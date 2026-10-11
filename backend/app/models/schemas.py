from pydantic import BaseModel, Field
from typing import List, Optional

class BreakdownScores(BaseModel):
    face: float = Field(..., ge=0.0, le=100.0, description="Facial consistency & deepfake score")
    lip_sync: float = Field(..., ge=0.0, le=100.0, description="Phoneme-viseme lip synchronization anomaly score")
    audio: float = Field(..., ge=0.0, le=100.0, description="Acoustic & vocoder voice cloning score")
    texture: float = Field(..., ge=0.0, le=100.0, description="Spatial GAN / diffusion texture artifact score")
    metadata: float = Field(..., ge=0.0, le=100.0, description="EXIF/C2PA metadata tamper score")

class FlaggedSegment(BaseModel):
    start_time: float = Field(..., ge=0.0, description="Start timestamp in seconds")
    end_time: float = Field(..., ge=0.0, description="End timestamp in seconds")
    description: str = Field(..., description="Forensic anomaly explanation")
    score: float = Field(..., ge=0.0, le=100.0, description="Anomaly severity score")
    severity: str = Field(..., description="low, medium, or high")

class AnalyzeResponse(BaseModel):
    ai_probability: float = Field(..., ge=0.0, le=100.0, description="Synthetic AI probability 0-100")
    verdict: str = Field(..., description="authentic, suspicious, fake, or inconclusive")
    confidence: float = Field(..., ge=0.0, le=100.0, description="Model certainty confidence percentage")
    breakdown: BreakdownScores
    flagged_segments: List[FlaggedSegment] = []
    input_type: str = Field(..., description="'file' or 'url'")
    media_name: str
    sha256: str
    demo_mode: bool = True
    simulated: bool = Field(
        default=True,
        description=(
            "True when results are simulated/heuristic (audio, URL, or model fallback). "
            "False when a real ViT deepfake classifier ran on the actual content."
        ),
    )
    inference_error: Optional[str] = Field(
        default=None,
        description="Set when real inference failed and simulated fallback was used."
    )
    message: Optional[str] = Field(
        default=None,
        description="Diagnostic or explanatory message (e.g. for inconclusive face detection)."
    )
    frame_scores: Optional[List[float]] = Field(
        default=None,
        description="Per-frame deepfake probability scores for video media."
    )
    model_name: Optional[str] = Field(
        default=None,
        description=(
            "Name of the classifier model used for analysis. "
            "Displayed in the frontend badge (e.g. 'ViT deepfake classifier', "
            "'Wav2Vec2 audio classifier')."
        ),
    )
