"""
deepfake_model.py
-----------------
Singleton loader for the Hugging Face deepfake classifier:
  prithivMLmods/Deep-Fake-Detector-v2-Model

Loaded ONCE at server startup (via FastAPI lifespan or the first call),
then cached in module-level globals so every request reuses the same
in-memory objects.

Label convention (confirmed from config.json):
  id2label: {"0": "Realism", "1": "Deepfake"}
  - index 0 → "Realism"  (the REAL/authentic class)
  - index 1 → "Deepfake" (the AI/fake class)

  The probability for "Deepfake" becomes ai_probability.
  The transformers pipeline internally applies softmax over the two raw
  logits, so the returned scores already sum to 1.0 — no manual softmax
  is needed here.

  NOTE: The real class is labelled "Realism", NOT "Real".
  _DEEPFAKE_LABEL uses a case-insensitive substring match ("deepfake")
  which correctly matches "Deepfake" regardless of capitalisation.

If the model fails to load, _model_error is populated and callers
must gracefully degrade (fall back to simulated logic).
"""

from __future__ import annotations

import logging
from typing import Optional, Tuple

from PIL import Image, ImageOps  # type: ignore

logger = logging.getLogger(__name__)

# Module-level singletons
_pipeline = None          # transformers.Pipeline
_model_error: Optional[str] = None
_MODEL_ID = "prithivMLmods/Deep-Fake-Detector-v2-Model"
_DEEPFAKE_LABEL = "Deepfake"


def load_model() -> None:
    """
    Load the ViT image-classification pipeline from Hugging Face Hub.
    Sets the module-level _pipeline or _model_error.
    Call this once at server startup.
    """
    global _pipeline, _model_error
    if _pipeline is not None:
        return  # already loaded
    try:
        from transformers import pipeline  # type: ignore
        logger.info("[TruthLens] Loading deepfake model '%s' …", _MODEL_ID)
        _pipeline = pipeline(
            "image-classification",
            model=_MODEL_ID,
            device=-1,          # CPU
            top_k=None,         # return all labels
        )
        # ── Diagnostic: log id2label so label mapping is always visible ──
        try:
            id2label = _pipeline.model.config.id2label
            deepfake_idx = next(
                (k for k, v in id2label.items() if "deepfake" in v.lower()), "NOT FOUND"
            )
            logger.info(
                "[TruthLens] id2label mapping: %s  |  'Deepfake' class index: %s",
                id2label,
                deepfake_idx,
            )
        except Exception as diag_exc:
            logger.warning("[TruthLens] Could not read id2label: %s", diag_exc)
        logger.info("[TruthLens] Deepfake model loaded successfully.")
    except Exception as exc:
        _model_error = str(exc)
        logger.error("[TruthLens] Model load failed: %s", exc)


def is_ready() -> bool:
    """Return True if the model loaded without errors."""
    return _pipeline is not None and _model_error is None


def get_error() -> Optional[str]:
    """Return the load error message, or None if healthy."""
    return _model_error


def _apply_exif_orientation(pil_image: Image.Image) -> Image.Image:
    """
    Transpose the image according to its EXIF Orientation tag (if any).
    Cameras embed rotation in EXIF; without this, a portrait photo may be
    fed to the model sideways, which hurts classification accuracy.
    Uses Pillow's built-in ImageOps.exif_transpose (no external libs needed).
    """
    try:
        return ImageOps.exif_transpose(pil_image)
    except Exception:
        return pil_image  # silently fall back to un-transposed image


def classify_pil(pil_image: Image.Image) -> Tuple[float, float]:
    """
    Run inference on a single PIL Image.

    Pre-processing applied here (before passing to the pipeline):
      1. EXIF orientation correction  (via ImageOps.exif_transpose)
      2. RGB conversion               (strips alpha / handles palette modes)
    The pipeline then applies the model's own ViTImageProcessor (resize to
    224×224, normalise with ImageNet mean/std) internally — we do NOT
    duplicate that step here.

    The pipeline applies softmax over the two raw logits and returns
    scores that sum to 1.0.  We take the "Deepfake" score directly as
    the deepfake probability.

    Returns
    -------
    (deepfake_prob, confidence)
        deepfake_prob : float in [0, 100]  — probability of Deepfake class
        confidence    : float in [0, 100]  — max probability (model certainty)

    Raises
    ------
    RuntimeError if the pipeline is not loaded.
    """
    if _pipeline is None:
        raise RuntimeError("Model pipeline is not loaded.")

    # ── Pre-processing ────────────────────────────────────────────────────
    # 1. Fix EXIF rotation first (before RGB conversion to avoid data loss)
    pil_image = _apply_exif_orientation(pil_image)
    # 2. Convert to RGB (handles RGBA, palette, grayscale, CMYK, etc.)
    pil_image = pil_image.convert("RGB")
    # The pipeline's ViTImageProcessor handles resize (224×224) and
    # ImageNet normalisation — no manual resize/normalise needed here.

    results = _pipeline(pil_image)  # list of {"label": ..., "score": ...}

    # Build label → probability mapping (scores sum to 1.0 after softmax)
    label_map: dict[str, float] = {r["label"]: r["score"] for r in results}

    logger.debug("[deepfake_model] Raw label_map: %s", label_map)

    # ── Find the Deepfake label (case-insensitive substring match) ────────
    deepfake_score: Optional[float] = None
    for label, score in label_map.items():
        if _DEEPFAKE_LABEL.lower() in label.lower():
            deepfake_score = score
            logger.debug(
                "[deepfake_model] Matched Deepfake label='%s' score=%.4f", label, score
            )
            break

    if deepfake_score is None:
        # Fallback: no label containing "deepfake" was found in the output.
        # Since the model is binary (Realism / Deepfake), the complement of
        # the highest "real" score IS the deepfake probability.
        # BUG-FIX: old code used max() here which would have returned the
        # Realism score (the dominant class for real photos) and treated it
        # as the deepfake score, causing real photos to be flagged as AI.
        max_real_score = max(label_map.values())
        deepfake_score = 1.0 - max_real_score
        logger.warning(
            "[deepfake_model] 'Deepfake' label not found in output %s — "
            "using complement fallback: deepfake_score=%.4f",
            list(label_map.keys()),
            deepfake_score,
        )

    confidence = max(label_map.values()) * 100.0
    deepfake_prob = deepfake_score * 100.0

    return round(deepfake_prob, 1), round(confidence, 1)
