from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    PROJECT_NAME: str = "TruthLens API"
    VERSION: str = "0.1.0"
    API_V1_STR: str = "/api/v1"
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:5173",
        "http://127.0.0.1:5173"
    ]

    # Forensic Verdict Thresholds (percentage synthetic probability)
    AUTHENTIC_THRESHOLD: float = 25.0  # <= 25.0% -> Green (Authentic)
    AMBER_THRESHOLD: float = 70.0       # > 25.0% and < 70.0% -> Amber (Suspicious), >= 70.0% -> Red (Deepfake)

    class Config:
        case_sensitive = True

settings = Settings()
