import json
import logging
import time
import concurrent.futures

from google.genai import types as genai_types

from .config import gemini_client, GEMINI_MODEL_FALLBACK_CHAIN, REQUEST_TIMEOUT_SECONDS

logger = logging.getLogger(__name__)

# --- CarDD damage classes (must match the YOLO model's class names exactly) ---
DAMAGE_CLASSES = ["dent", "scratch", "crack", "glass shatter", "lamp broken", "tire flat"]

# --- Prompt template ---
VLM_TECHNICIAN_PROMPT_TEMPLATE = (
    "You are an experienced car repair technician working in Egypt. "
    "A computer-vision pipeline (YOLOv8-seg) has already detected and localized "
    "the damage on this vehicle. The attached photo is annotated with the detected "
    "region(s) highlighted, and the JSON below lists exactly what the detector found "
    "-- damage type/label, severity, bounding box, and the percentage of the image "
    "each damaged area covers (derived from its segmentation mask):\n\n"
    "{findings_json}\n\n"
    "Treat this JSON as ground truth for WHICH damages exist, WHERE they are, and "
    "their type/size -- do not invent additional damage it doesn't mention, "
    "and do not dismiss damage it does mention. Look closely at the highlighted "
    "region(s) in the photo yourself and judge the SEVERITY of each damage based on "
    "what you actually see (depth, spread, how structurally serious it looks) -- the "
    "detector does not provide severity, that judgment is yours to make. Then write a "
    "full technician's report.\n\n"
    "All monetary values MUST be realistic current Egyptian market prices. "
    "For every cost, return a MIN and MAX value in Egyptian Pounds (EGP). "
    "Use plain numbers only, without currency symbols or the word 'EGP' inside "
    "the numbers. The total range should be consistent with the technician and "
    "parts ranges. "
    "estimated_repair_time_hours must be a plain number of hours (decimals allowed, "
    "e.g. 1.5)."
)

# --- Response schema (Gemini formats the report itself, no manual parsing needed) ---
REPORT_SCHEMA = {
    "type": "object",
    "properties": {
        "damage_assessment": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "damage_type": {"type": "string", "enum": DAMAGE_CLASSES},
                    "location_on_vehicle": {"type": "string"},
                    "severity": {"type": "string", "enum": ["minor", "moderate", "severe"]},
                    "description": {"type": "string"},
                },
                "required": [
                    "damage_type",
                    "location_on_vehicle",
                    "severity",
                    "description",
                ],
            },
        },
        "repair_steps": {
            "type": "array",
            "items": {"type": "string"},
        },
        "tools_and_equipment_needed": {
            "type": "array",
            "items": {"type": "string"},
        },
        "estimated_repair_time_hours": {
            "type": "number",
        },

        # Money is returned as a realistic Egyptian Pound range
        "technician_service_cost_egp": {
            "type": "object",
            "properties": {
                "min": {"type": "number"},
                "max": {"type": "number"},
            },
            "required": ["min", "max"],
        },

        "equipment_and_parts_cost_egp": {
            "type": "object",
            "properties": {
                "min": {"type": "number"},
                "max": {"type": "number"},
            },
            "required": ["min", "max"],
        },

        "total_estimated_cost_egp": {
            "type": "object",
            "properties": {
                "min": {"type": "number"},
                "max": {"type": "number"},
            },
            "required": ["min", "max"],
        },

        "notes": {
            "type": "string",
        },
    },
    "required": [
        "damage_assessment",
        "repair_steps",
        "tools_and_equipment_needed",
        "estimated_repair_time_hours",
        "technician_service_cost_egp",
        "equipment_and_parts_cost_egp",
        "total_estimated_cost_egp",
        "notes",
    ],
}

def _call_gemini(model_name: str, image_bytes: bytes, prompt: str):
    """Single call to one Gemini model. Raises on failure/timeout."""
    image_part = genai_types.Part.from_bytes(data=image_bytes, mime_type="image/jpeg")

    request_config = genai_types.GenerateContentConfig(
        response_mime_type="application/json",
        response_schema=REPORT_SCHEMA,
    )

    with concurrent.futures.ThreadPoolExecutor(max_workers=1) as executor:
        future = executor.submit(
            gemini_client.models.generate_content,
            model=model_name,
            contents=[image_part, prompt],
            config=request_config,
        )
        response = future.result(timeout=REQUEST_TIMEOUT_SECONDS)

    return response.text


def get_gemini_report(image_bytes: bytes, findings: list[dict]) -> dict:
    prompt = VLM_TECHNICIAN_PROMPT_TEMPLATE.format(
        findings_json=json.dumps(findings, ensure_ascii=False)
    )

    last_error = None
    pipeline_start = time.time()

    for model_name in GEMINI_MODEL_FALLBACK_CHAIN:
        attempt_start = time.time()
        try:
            raw_text = _call_gemini(model_name, image_bytes, prompt)
            elapsed = time.time() - attempt_start
            total_elapsed = time.time() - pipeline_start
            logger.info(f"[TIMING] Gemini success with {model_name} in {elapsed:.2f}s (total chain: {total_elapsed:.2f}s)")
            print(f"[TIMING] Gemini success with {model_name} in {elapsed:.2f}s (total chain: {total_elapsed:.2f}s)")
            return json.loads(raw_text)
        except concurrent.futures.TimeoutError:
            elapsed = time.time() - attempt_start
            logger.warning(f"[TIMING] Gemini TIMEOUT on {model_name} after {elapsed:.2f}s")
            print(f"[TIMING] Gemini TIMEOUT on {model_name} after {elapsed:.2f}s")
            last_error = f"Timeout: {model_name}"
        except Exception as e:
            elapsed = time.time() - attempt_start
            logger.warning(f"[TIMING] Gemini FAILED on {model_name} after {elapsed:.2f}s: {e}")
            print(f"[TIMING] Gemini FAILED on {model_name} after {elapsed:.2f}s: {e}")
            last_error = e

    total_elapsed = time.time() - pipeline_start
    print(f"[TIMING] ALL models failed. Total chain time: {total_elapsed:.2f}s")
    raise RuntimeError(f"All Gemini models failed. Last error: {last_error}")