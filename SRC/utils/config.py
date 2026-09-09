import os
import logging
from dotenv import load_dotenv
from ultralytics import YOLO
from google import genai

load_dotenv()

logger = logging.getLogger(__name__)

# --- Environment variables ---
APP_NAME = os.getenv("APP_NAME")
VERSION = os.getenv("VERSION")
SECRET_API_KEY = os.getenv("SECRET_API_KEY")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
SRC_PATH = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODEL_PATH = os.path.join(SRC_PATH, 'artifacts', 'model_yolo8.pt')


REQUEST_TIMEOUT_SECONDS = 15

# --- Gemini client (new google-genai SDK) ---
gemini_client = genai.Client(api_key=GEMINI_API_KEY)

GEMINI_MODEL_FALLBACK_CHAIN = [
    "gemini-3.5-flash-lite",
    "gemini-3.5-flash"
]

# --- YOLO model (lazy-loaded singleton) ---
_model = None

def get_model():
    global _model
    if _model is None:
        _model = YOLO(MODEL_PATH)
    return _model