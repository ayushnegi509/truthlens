from fastapi import APIRouter

router = APIRouter()

@router.get("/health", summary="Health Check")
def health_check():
    return {
        "status": "healthy",
        "service": "TruthLens Backend",
        "detectors": ["image", "video", "audio"]
    }
