"""
face_detector.py
----------------
Face detection and cropping utilities using OpenCV (DNN / YuNet detector,
with fallback to Haar Cascade if supported).

Functions:
- detect_face(bgr_or_rgb_img): returns bounding box (x, y, w, h) of the highest-confidence face, or None
- crop_face_with_margin(pil_img, margin=0.25): returns (cropped_pil_img, (x, y, w, h)) or (None, None)
"""

from __future__ import annotations

import logging
import os
from typing import Optional, Tuple
import cv2  # type: ignore
import numpy as np  # type: ignore
from PIL import Image  # type: ignore

logger = logging.getLogger(__name__)

# Model paths in backend/app/data
_BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
_DATA_DIR = os.path.join(_BASE_DIR, "data")
_YUNET_PATH = os.path.join(_DATA_DIR, "face_detection_yunet_2023mar.onnx")
_HAAR_PATH = os.path.join(_DATA_DIR, "haarcascade_frontalface_default.xml")

_yunet_detector = None
_haar_detector = None
_initialized = False


def _ensure_detectors_loaded() -> None:
    global _yunet_detector, _haar_detector, _initialized
    if _initialized:
        return
    _initialized = True

    # 1. Try OpenCV FaceDetectorYN (DNN face detector)
    if os.path.exists(_YUNET_PATH) and hasattr(cv2, "FaceDetectorYN"):
        try:
            _yunet_detector = cv2.FaceDetectorYN.create(
                model=_YUNET_PATH,
                config="",
                input_size=(320, 320),
                score_threshold=0.5,
                nms_threshold=0.3,
                top_k=5000,
            )
            logger.info("[face_detector] Loaded YuNet DNN face detector from %s", _YUNET_PATH)
        except Exception as exc:
            logger.warning("[face_detector] Failed to create FaceDetectorYN: %s", exc)

    # 2. Try Haar Cascade if available in cv2
    if hasattr(cv2, "CascadeClassifier") and os.path.exists(_HAAR_PATH):
        try:
            cascade = cv2.CascadeClassifier(_HAAR_PATH)
            if not cascade.empty():
                _haar_detector = cascade
                logger.info("[face_detector] Loaded Haar cascade classifier from %s", _HAAR_PATH)
        except Exception as exc:
            logger.warning("[face_detector] Failed to load Haar cascade: %s", exc)


def detect_face_bbox(cv_img_bgr: np.ndarray) -> Optional[Tuple[int, int, int, int]]:
    """
    Detect the primary face in an image (BGR format).
    Returns (x, y, w, h) for the face with the highest score / largest area,
    or None if no face was detected.
    """
    _ensure_detectors_loaded()
    h, w = cv_img_bgr.shape[:2]
    if h <= 0 or w <= 0:
        return None

    # Try DNN FaceDetectorYN first
    if _yunet_detector is not None:
        try:
            _yunet_detector.setInputSize((w, h))
            ret, faces = _yunet_detector.detect(cv_img_bgr)
            if faces is not None and len(faces) > 0:
                # Find face with highest confidence score (faces[:, -1])
                best_face = max(faces, key=lambda f: float(f[-1]))
                fx, fy, fw, fh = int(best_face[0]), int(best_face[1]), int(best_face[2]), int(best_face[3])
                # Ensure within image bounds
                if fw > 0 and fh > 0:
                    return (max(0, fx), max(0, fy), min(w, fw), min(h, fh))
        except Exception as exc:
            logger.warning("[face_detector] YuNet detection error: %s", exc)

    # Fallback to Haar Cascade if loaded
    if _haar_detector is not None:
        try:
            gray = cv2.cvtColor(cv_img_bgr, cv2.COLOR_BGR2GRAY)
            faces = _haar_detector.detectMultiScale(
                gray,
                scaleFactor=1.1,
                minNeighbors=4,
                minSize=(30, 30),
            )
            if len(faces) > 0:
                # Pick largest area
                best_face = max(faces, key=lambda b: b[2] * b[3])
                return (int(best_face[0]), int(best_face[1]), int(best_face[2]), int(best_face[3]))
        except Exception as exc:
            logger.warning("[face_detector] Haar cascade detection error: %s", exc)

    return None


def crop_face_from_pil(
    pil_img: Image.Image,
    margin: float = 0.25,
) -> Tuple[Optional[Image.Image], Optional[Tuple[int, int, int, int]]]:
    """
    Detect a face in a PIL image. If found, crop with about `margin` (25%) on all sides.
    Returns (cropped_pil_image, (x, y, w, h)) if face detected, else (None, None).
    """
    # Convert PIL Image to BGR numpy array for OpenCV
    rgb_arr = np.array(pil_img.convert("RGB"))
    bgr_arr = cv2.cvtColor(rgb_arr, cv2.COLOR_RGB2BGR)

    bbox = detect_face_bbox(bgr_arr)
    if bbox is None:
        return None, None

    x, y, w, h = bbox
    img_h, img_w = bgr_arr.shape[:2]

    margin_x = int(w * margin)
    margin_y = int(h * margin)

    crop_x1 = max(0, x - margin_x)
    crop_y1 = max(0, y - margin_y)
    crop_x2 = min(img_w, x + w + margin_x)
    crop_y2 = min(img_h, y + h + margin_y)

    if crop_x2 <= crop_x1 or crop_y2 <= crop_y1:
        return None, None

    # Crop from original PIL image to preserve PIL object properties
    cropped_pil = pil_img.crop((crop_x1, crop_y1, crop_x2, crop_y2))
    return cropped_pil, (crop_x1, crop_y1, crop_x2 - crop_x1, crop_y2 - crop_y1)
