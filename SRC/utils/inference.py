import cv2
import numpy as np
from .config import get_model
from .llm import get_gemini_report


def _normalize_class_name(name: str) -> str:
    """YOLO class names may come with different spacing/case than CarDD's
    canonical labels -- normalize so they line up with DAMAGE_CLASSES in llm.py."""
    return name.strip().lower().replace("_", " ")


def _decode_image(image_bytes: bytes):
    """bytes -> cv2/numpy image (BGR)."""
    array = np.frombuffer(image_bytes, dtype=np.uint8)
    image = cv2.imdecode(array, cv2.IMREAD_COLOR)
    if image is None:
        raise ValueError("Could not decode image bytes -- unsupported or corrupt image.")
    return image


def _run_yolo(image: np.ndarray, conf: float = 0.35):
    """
    Runs the segmentation model on the image. Returns:
      - findings: list of dicts (damage_type, bbox, area_pct_of_image) -- no
        severity/cost here, that's Gemini's job once it sees the image.
      - annotated: a copy of the image with each damage region highlighted
        and labeled, ready to send to Gemini and to show the user.
    """
    model = get_model()
    height, width = image.shape[:2]
    results = model.predict(image, conf=conf, verbose=False)[0]

    findings = []
    annotated = image.copy()

    if results.masks is not None:
        boxes = results.boxes.xyxy.cpu().numpy()
        class_indices = results.boxes.cls.cpu().numpy()
        masks = results.masks.data.cpu().numpy()

        for box, class_idx, mask in zip(boxes, class_indices, masks):
            class_name = _normalize_class_name(model.names[int(class_idx)])
            mask_full = cv2.resize(mask, (width, height))
            area_pct = round(100 * float(mask_full.sum()) / (width * height), 3)

            findings.append({
                "damage_type": class_name,
                "bbox": [int(v) for v in box],
                "area_pct_of_image": area_pct,
            })

            color = (0, 0, 255)
            overlay = annotated.copy()
            overlay[mask_full > 0.5] = color
            annotated = cv2.addWeighted(overlay, 0.4, annotated, 0.6, 0)
            x1, y1, x2, y2 = map(int, box)
            cv2.rectangle(annotated, (x1, y1), (x2, y2), color, 2)
            cv2.putText(annotated, class_name, (x1, max(y1 - 8, 0)),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.6, color, 2)

    return findings, annotated


import time

def run_pipeline(image_bytes: bytes, conf: float = 0.35, include_report: bool = True) -> dict:
    image = _decode_image(image_bytes)
    findings, annotated = _run_yolo(image, conf=conf)

    success, encoded = cv2.imencode(".jpg", annotated)
    if not success:
        raise ValueError("Failed to encode annotated image.")
    annotated_bytes = encoded.tobytes()

    report = None
    if include_report:
        report = get_gemini_report(annotated_bytes, findings)

    return {
        "findings": findings,
        "annotated_image": annotated_bytes,
        "report": report,
    }