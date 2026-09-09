from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
from SRC.utils.inference import run_pipeline

app = FastAPI(
    title="Car Damage Detection API",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {
        "message": "Car Damage Detection API is running"
    }


@app.get("/health")
def health():
    return {
        "status": "ok"
    }


@app.post("/analyze")
async def analyze(file: UploadFile = File(...)):

    try:
        image_bytes = await file.read()

        if not image_bytes:
            raise HTTPException(
                status_code=400,
                detail="No image uploaded"
            )

        result = run_pipeline(image_bytes)

        return {
            "success": True,
            "findings": result["findings"],
            "report": result["report"]
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )


@app.post("/analyze-image")
async def analyze_image(file: UploadFile = File(...)):

    try:
        image_bytes = await file.read()

        if not image_bytes:
            raise HTTPException(
                status_code=400,
                detail="No image uploaded"
            )

        result = run_pipeline(image_bytes, include_report=False)

        return Response(
            content=result["annotated_image"],
            media_type="image/jpeg"
        )

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )