"""
image_detector.py
-----------------
Real deepfake inference for still images using the ViT classifier
loaded in deepfake_model.py.

Pipeline
--------
1. Open the image with Pillow (converts to RGB automatically).
2. Run classify_pil() → deepfake probability [0-100].
3. Build breakdown scores correlated to the real ai_probability.
4. Return an AnalyzeResponse with demo_mode=False, simulated=False.
"""

from __future__ import annotations

import logging
import random
from typing import Optional

from PIL import Image  # type: ignore

from app.models.schemas import AnalyzeResponse
from app.services import deepfake_model
from app.services.analyzer import (
    determine_verdict,
    build_breakdown,
    compute_sha256,
)

logger = logging.getLogger(__name__)

TEXTURE_ISSUES = [
    ("Spatial GAN checkerboard artifact detected in cheek region", "texture"),
    ("Diffusion latent noise inconsistency along face boundary", "texture"),
    ("Frequency-domain FFT anomaly: synthetic high-freq suppression", "texture"),
    ("Face-swap seam artifact visible at jawline boundary", "face"),
    ("Facial geometry inconsistency: asymmetric eye-socket depth", "face"),
    ("High-frequency boundary noise residue — re-synthesized region", "texture"),
]


from app.services.face_detector import crop_face_from_pil
from app.models.schemas import BreakdownScores

NO_FACE_MESSAGE = "No face detected, this model can only assess faces"


def analyze_image(
    file_path: str,
    media_name: str,
) -> AnalyzeResponse:
    """
    Run face detection followed by real ViT deepfake inference on an image file.
    If no face is detected, returns verdict 'inconclusive'.
    When a face is found, crops with ~25% margin and classifies the crop.
    Falls back gracefully if inference errors.
    """
    sha256_hex = compute_sha256(file_path)
    seed_int = int(sha256_hex[:16], 16)
    rng = random.Random(seed_int)

    try:
        # Open without converting yet — EXIF orientation data must be
        # preserved for classify_pil to apply ImageOps.exif_transpose.
        img = Image.open(file_path)
    except Exception as exc:
        logger.error("[image_detector] Cannot open image '%s': %s", file_path, exc)
        return _simulated_fallback(sha256_hex, rng, media_name, error=str(exc))

    # Face detection with OpenCV
    try:
        cropped_face, bbox = crop_face_from_pil(img, margin=0.25)
    except Exception as exc:
        logger.error("[image_detector] Face detection error: %s", exc)
        cropped_face, bbox = None, None

    if cropped_face is None:
        logger.info("[image_detector] No face detected in '%s'. Returning inconclusive.", media_name)
        return AnalyzeResponse(
            ai_probability=0.0,
            verdict="inconclusive",
            confidence=0.0,
            breakdown=BreakdownScores(face=0.0, lip_sync=0.0, audio=0.0, texture=0.0, metadata=0.0),
            flagged_segments=[],
            input_type="file",
            media_name=media_name,
            sha256=sha256_hex,
            demo_mode=False,
            simulated=False,
            message=NO_FACE_MESSAGE,
        )

    logger.info("[image_detector] Face detected with bbox %s. Running inference on crop.", bbox)

    if not deepfake_model.is_ready():
        err = deepfake_model.get_error() or "Model not loaded."
        logger.warning("[image_detector] Model unavailable: %s. Using simulated.", err)
        return _simulated_fallback(sha256_hex, rng, media_name, error=err)

    try:
        ai_prob, confidence = deepfake_model.classify_pil(cropped_face)
    except Exception as exc:
        logger.error("[image_detector] Inference error on crop: %s", exc)
        return _simulated_fallback(sha256_hex, rng, media_name, error=str(exc))

    verdict = determine_verdict(ai_prob)
    breakdown = build_breakdown(ai_prob, rng, source="image")

    # For images we don't have a temporal timeline; no flagged segments
    flagged_segments = []

    return AnalyzeResponse(
        ai_probability=ai_prob,
        verdict=verdict,
        confidence=confidence,
        breakdown=breakdown,
        flagged_segments=flagged_segments,
        input_type="file",
        media_name=media_name,
        sha256=sha256_hex,
        demo_mode=False,
        simulated=False,
    )


def _simulated_fallback(
    sha256_hex: str,
    rng: random.Random,
    media_name: str,
    error: Optional[str] = None,
) -> AnalyzeResponse:
    ai_prob = round(rng.uniform(4.0, 96.0), 1)
    verdict = determine_verdict(ai_prob)
    confidence = round(rng.uniform(82.0, 99.5), 1)
    breakdown = build_breakdown(ai_prob, rng, source="image")
    return AnalyzeResponse(
        ai_probability=ai_prob,
        verdict=verdict,
        confidence=confidence,
        breakdown=breakdown,
        flagged_segments=[],
        input_type="file",
        media_name=media_name,
        sha256=sha256_hex,
        demo_mode=True,
        simulated=True,
        inference_error=error,
    )
