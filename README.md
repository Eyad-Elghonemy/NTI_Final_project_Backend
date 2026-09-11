<div align="center">

<img src="logo.svg" alt="CarDD Logo" width="120" />

# CarDD — AI Vehicle Damage Assessment
**A computer-vision API that detects car damage and turns it into a full technician's report, wrapped in a real-time Streamlit control room.**

[![Python](https://img.shields.io/badge/Python-3.12-3776AB?logo=python&logoColor=white)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![YOLOv8](https://img.shields.io/badge/Vision-YOLOv8--seg-00FFFF?logo=ultralytics&logoColor=black)](https://docs.ultralytics.com/)
[![Gemini](https://img.shields.io/badge/LLM-Gemini-8E75B2?logo=googlegemini&logoColor=white)](https://ai.google.dev/)
[![Streamlit](https://img.shields.io/badge/Frontend-Streamlit-FF4B4B?logo=streamlit&logoColor=white)](https://streamlit.io/)
[![Docker](https://img.shields.io/badge/Deploy-Docker-2496ED?logo=docker&logoColor=white)](https://www.docker.com/)

</div>

---

## What is CarDD?

CarDD is a two-stage deep learning service that looks at a photo of a damaged vehicle, finds every damaged region, and turns those detections into a realistic Egyptian-market repair report. It is composed of two independent components that work together:

- **Backend** — a FastAPI service that runs a trained YOLOv8-seg model to localize damage, then sends the annotated photo to Gemini for severity judgment, a repair plan, and cost/time estimates.
- **Frontend** — a Streamlit control room that connects to the API to offer image upload, live results, PDF/JSON export, and a session history — all without loading the model locally.

---

## Features

| Feature | Detail |
|---|---|
| 🚀 **Async FastAPI backend** | Production-grade, non-blocking request handling via Uvicorn |
| 🧠 **YOLOv8-seg detector** | Trained on the CarDD dataset to segment 6 damage classes |
| 🤖 **Gemini technician report** | Vision-language model judges severity and writes repair steps, tools, time & cost |
| 🔁 **Model fallback chain** | Automatically retries a second Gemini model if the first one times out or fails |
| 🖼️ **Annotated image output** | Returns the photo with detected damage regions highlighted and labeled |
| 📄 **PDF & JSON export** | Download a full report from the Streamlit UI in either format |
| 🕓 **Session history** | Every analyzed image is kept in the Streamlit session for quick recall |
| 🌍 **CORS enabled** | Ready for cross-origin frontends out of the box |

---

## The 6 Damage Classes

| Class | Description |
|---|---|
| 🔧 Dent | Deformed body panel |
| ⚡ Scratch | Surface paint damage |
| 💥 Crack | Fractured body part or bumper |
| 💧 Glass Shatter | Broken windshield or window |
| 💡 Lamp Broken | Damaged head/tail light |
| 🛞 Tire Flat | Deflated or damaged tire |

Classes and labels follow the [CarDD dataset](https://cardd-ustc.github.io/) convention.

---

## Model Pipeline

```
Input image      →  uploaded vehicle photo (JPG/PNG)
YOLOv8-seg        →  segmentation masks + bounding boxes per damage region
                       -> damage_type, bbox, area_pct_of_image
Annotated image   →  masks + boxes drawn on the original photo
Gemini (VLM)      →  looks at the annotated photo + YOLO findings as ground truth
                       -> severity, location, description
                       -> repair_steps, tools_and_equipment_needed
                       -> estimated_repair_time_hours
                       -> technician / parts / total cost (EGP, min-max)
```

**Detection configuration:**

| Setting | Value |
|---|---|
| Confidence threshold | 0.35 (default, adjustable per request) |
| Model | YOLOv8-seg, fine-tuned on CarDD |
| Report model | Gemini, with automatic fallback chain |
| Request timeout | 15s per Gemini attempt |

See the training notebooks (`yolo8n_training_25_epoch.ipynb`, `yolo8n_continue_training_50_epoch.ipynb`, `yolo_11m_continue_training.ipynb`) for the full training history, and `Evaluation.ipynb` for metrics.

---

## Project Structure

```
.
├── main.py                    # FastAPI app — routes only
├── config.py                  # Env loading, YOLO model loading, Gemini client
├── inference.py                # Image decoding, YOLO inference, annotation
├── llm.py                      # Gemini prompt, response schema, fallback chain
├── pyproject.toml              # Backend project metadata and dependencies
├── requirements.txt            # Backend dependencies (pip-installable mirror)
├── requirements-app.txt        # Frontend-only dependencies
├── .env.example                 # Environment variable template
├── artifacts/
│   └── model_yolo8.pt          # Trained YOLOv8-seg weights (not tracked by Git)
├── Evaluation.ipynb            # Model evaluation notebook
├── yolo8n_training_25_epoch.ipynb
├── yolo8n_continue_training_50_epoch.ipynb
├── yolo_11m_continue_training.ipynb
└── app.py                       # Streamlit control room (frontend)
```

---

## Requirements

**Backend**
- Python 3.12
- See `pyproject.toml` for pinned versions — key packages:
  - `fastapi[standard]==0.139.0`
  - `uvicorn==0.49.0`
  - `ultralytics==8.4.142`
  - `google-genai==1.28.0`
  - `opencv-python-headless==4.10.0.84`
  - `Pillow==10.4.0`
  - `python-dotenv==1.2.2`
  - `python-multipart==0.0.32`

**Frontend**
- `streamlit`
- `requests`
- `Pillow`
- `fpdf2`

---

## Installation

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd <your-repo-folder>
```

### 2. Create and activate a virtual environment

```bash
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
```

### 3. Install backend dependencies

```bash
pip install -r requirements.txt
```

### 4. Configure environment variables

```bash
cp .env.example .env
```

Edit `.env`:

```env
GEMINI_API_KEY="your-gemini-api-key"
```

### 5. Add the trained model

Place the trained model file at:

```
artifacts/model_yolo8.pt
```

---

## Running the Services

### Backend API

```bash
uvicorn main:app --reload
```

Available at: `http://127.0.0.1:8000`
Swagger UI: `http://127.0.0.1:8000/docs`

### Frontend (Streamlit)

```bash
pip install -r requirements-app.txt
streamlit run app.py
```

Available at: `http://localhost:8501`

> Set `API_BASE_URL` at the top of `app.py` to point at your running backend.

---

## API Reference

### `GET /`
Health check.

**Response**
```json
{ "message": "Car Damage Detection API is running" }
```

---

### `GET /health`
Lightweight liveness check, used by the Streamlit status indicator.

**Response**
```json
{ "status": "ok" }
```

---

### `POST /analyze`
Analyze a vehicle image and return findings + the full Gemini report.

**Body** — `multipart/form-data`

| Field | Type | Description |
|---|---|---|
| `file` | File | Image of a damaged vehicle (PNG, JPG…) |

**Example**
```bash
curl -X POST "http://127.0.0.1:8000/analyze" \
  -F "file=@damaged_car.jpg"
```

**Success response**
```json
{
  "success": true,
  "findings": [
    { "damage_type": "dent", "bbox": [120, 80, 340, 260], "area_pct_of_image": 4.271 }
  ],
  "report": {
    "damage_assessment": [ { "damage_type": "dent", "severity": "moderate", "...": "..." } ],
    "repair_steps": ["..."],
    "estimated_repair_time_hours": 2.5,
    "total_estimated_cost_egp": { "min": 1500, "max": 2800 }
  }
}
```

---

### `POST /analyze-image`
Same detection pipeline, but returns only the annotated JPEG image (no Gemini call).

**Body** — `multipart/form-data`, same `file` field as above.

**Response** — `image/jpeg` binary.

**Error responses**

| Status | Reason |
|---|---|
| `400` | No image uploaded |
| `500` | Decoding, inference, or Gemini failure |

---

## Security Notes

- **The API currently has no authentication** — `/analyze` and `/analyze-image` are open to anyone who can reach the endpoint. Add an `X-API-KEY` check (or similar) before exposing this publicly with real usage costs attached.
- Never commit your `.env` file — it is excluded by `.gitignore`.
- `GEMINI_API_KEY` must only ever live server-side; the Streamlit frontend never sees it, since it only talks to your FastAPI backend.
- CORS is currently open (`allow_origins=["*"]`). Restrict this in production.

---

## Live Deployment

| Component | URL |
|---|---|
| Backend API | `https://eyadzz-churn-live.hf.space` |
| API Docs (Swagger) | `https://eyadzz-churn-live.hf.space/docs` |

---

<div align="center">
<sub>CarDD · built with FastAPI, YOLOv8, Gemini &amp; Streamlit</sub>
</div>
