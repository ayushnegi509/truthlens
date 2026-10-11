"""
audio_model.py
--------------
Singleton loader for Hugging Face audio deepfake classifiers (Wav2Vec2 architecture).

This module manages loading, inference, and fallback mechanisms for detecting
synthetic or spoofed audio speech.

Primary Model:
  Gustking/wav2vec2-large-xlsr-deepfake-audio-classification

Fallback Model:
  OBITO03/Deepfakewav2vec2

Architecture & Execution:
- The model is loaded ONCE at server startup and cached in module-level singletons.
- During load, model.config.id2label is inspected to dynamically locate the index
  corresponding to the synthetic/fake/spoof class.
- The model is set to evaluation mode on the CPU.
- If the primary model fails to load, an automatic fallback to the secondary model occurs.
- If both fail, `_model_error` is set with the combined failure trace.
"""

from __future__ import annotations

import logging
from typing import Optional, Tuple

import numpy as np

logger = logging.getLogger(__name__)

# Module-level singletons
_feature_extractor = None
_model = None
_model_error: Optional[str] = None
_MODEL_ID: str = "Gustking/wav2vec2-large-xlsr-deepfake-audio-classification"
_FALLBACK_MODEL_ID: str = "OBITO03/Deepfakewav2vec2"
_FAKE_LABEL: Optional[str] = None  # Auto-detected from id2label
_FAKE_IDX: Optional[int] = None
_active_model_id: Optional[str] = None  # Tracks which model loaded


def _load_single_model(model_id: str) -> None:
    """
    Attempt to instantiate and configure feature extractor and model for a given ID.
    Raises an exception if loading or configuration fails.
    """
    global _feature_extractor, _model, _FAKE_LABEL, _FAKE_IDX, _active_model_id

    from transformers import AutoFeatureExtractor, AutoModelForAudioClassification  # type: ignore

    logger.info("[TruthLens] Loading audio deepfake model '%s' …", model_id)
    feature_extractor = AutoFeatureExtractor.from_pretrained(model_id)
    model = AutoModelForAudioClassification.from_pretrained(model_id)

    model.eval()
    model.to("cpu")

    # Diagnostic: Print and log model.config.id2label
    id2label = getattr(model.config, "id2label", {}) or {}
    logger.info("[TruthLens] Audio model '%s' id2label mapping: %s", model_id, id2label)
    print(f"[TruthLens] Audio model '{model_id}' id2label: {id2label}")

    # Detect the fake label: find label whose lowercase contains 'fake', 'spoof', or 'synthetic'
    detected_idx: Optional[int] = None
    detected_label: Optional[str] = None

    for raw_idx, label in id2label.items():
        label_str = str(label).lower()
        if any(keyword in label_str for keyword in ("fake", "spoof", "synthetic")):
            try:
                detected_idx = int(raw_idx)
            except (ValueError, TypeError):
                detected_idx = raw_idx  # type: ignore[assignment]
            detected_label = str(label)
            break

    # If no fake label found, assume index 1 (standard convention) and log warning
    if detected_idx is None:
        logger.warning(
            "[TruthLens] No fake/spoof/synthetic label identified in id2label (%s) for '%s'. Assuming index 1.",
            id2label,
            model_id,
        )
        detected_idx = 1
        detected_label = str(id2label.get(1, id2label.get("1", "fake")))

    _feature_extractor = feature_extractor
    _model = model
    _FAKE_IDX = detected_idx
    _FAKE_LABEL = detected_label
    _active_model_id = model_id

    logger.info(
        "[TruthLens] Audio deepfake model '%s' loaded successfully. Fake label: '%s' (index: %s)",
        model_id,
        _FAKE_LABEL,
        _FAKE_IDX,
    )


def load_audio_model() -> None:
    """
    Load the Wav2Vec2 audio deepfake classifier model and feature extractor.
    First attempts primary model (_MODEL_ID). If any exception occurs, falls back
    to secondary model (_FALLBACK_MODEL_ID).
    Sets _model_error if all attempts fail.
    """
    global _model_error

    if _model is not None:
        return

    try:
        _load_single_model(_MODEL_ID)
        _model_error = None
        return
    except Exception as primary_exc:
        logger.warning(
            "[TruthLens] Primary audio model '%s' failed to load: %s. Attempting fallback '%s'…",
            _MODEL_ID,
            primary_exc,
            _FALLBACK_MODEL_ID,
        )
        try:
            _load_single_model(_FALLBACK_MODEL_ID)
            _model_error = None
            return
        except Exception as fallback_exc:
            combined_error = (
                f"Primary model '{_MODEL_ID}' error: {primary_exc}; "
                f"Fallback model '{_FALLBACK_MODEL_ID}' error: {fallback_exc}"
            )
            _model_error = combined_error
            logger.error("[TruthLens] All audio models failed to load: %s", combined_error)


def is_audio_ready() -> bool:
    """Return True if model is loaded and no error occurred."""
    return _model is not None and _model_error is None


def get_audio_error() -> Optional[str]:
    """Return the model loading error, or None if healthy."""
    return _model_error


def get_active_model_name() -> Optional[str]:
    """Return the identifier of the currently active model."""
    return _active_model_id


def classify_audio(waveform: np.ndarray, sample_rate: int) -> Tuple[float, float]:
    """
    Classify a mono 1D audio waveform for deepfake / synthetic speech detection.

    Parameters
    ----------
    waveform : np.ndarray
        1D float numpy array containing the mono audio waveform (typically sampled at 16kHz).
    sample_rate : int
        Audio sample rate (e.g. 16000).

    Returns
    -------
    Tuple[float, float]
        (fake_probability_0_to_100, confidence_0_to_100)
    """
    if _model is None or _feature_extractor is None:
        raise RuntimeError("Audio model not loaded.")

    import torch  # type: ignore

    inputs = _feature_extractor(
        waveform,
        sampling_rate=sample_rate,
        return_tensors="pt",
        padding=True,
    )

    with torch.no_grad():
        logits = _model(**inputs).logits

    probs = torch.nn.functional.softmax(logits, dim=-1)[0]

    fake_prob_val = probs[_FAKE_IDX].item()
    confidence_val = torch.max(probs).item() * 100.0
    fake_prob = fake_prob_val * 100.0

    return round(fake_prob, 1), round(confidence_val, 1)
