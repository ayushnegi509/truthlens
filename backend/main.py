import os
os.environ.setdefault("HF_HUB_DISABLE_SYMLINKS_WARNING", "1")

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.v1.router import api_router
from app.api.v1.endpoints import analyze
from app.services import deepfake_model
from app.services import audio_model


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Load the deepfake classifier models once at server startup.
    - ViT image/video model (deepfake_model)
    - Wav2Vec2 audio model (audio_model)
    Both are cached in module-level globals and reused across all requests.
    """
    deepfake_model.load_model()
    audio_model.load_audio_model()
    yield
    # Nothing to clean up on shutdown


app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="TruthLens Forensic Deepfake Detection API (Video, Audio, Image)",
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    lifespan=lifespan,
)

# Configure CORS for frontend access (including http://localhost:5173)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Root level /analyze endpoint per requirement
app.include_router(analyze.router, tags=["Forensics"])

# Also include under /api/v1
app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/")
def root():
    model_status = "loaded" if deepfake_model.is_ready() else f"unavailable ({deepfake_model.get_error()})"
    audio_status = "loaded" if audio_model.is_audio_ready() else f"unavailable ({audio_model.get_audio_error()})"
    audio_name = audio_model.get_active_model_name()
    return {
        "name": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "status": "operational",
        "model": model_status,
        "audio_model": audio_status,
        "audio_model_id": audio_name,
        "docs_url": "/docs",
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=False)
