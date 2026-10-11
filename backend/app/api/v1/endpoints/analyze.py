import os
import shutil
import tempfile
from typing import Optional
from urllib.parse import urlparse
import httpx
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, status
from app.models.schemas import AnalyzeResponse
from app.services.analyzer import generate_simulated_analysis, compute_sha256

router = APIRouter()

# Validation rules aligned with frontend fileValidation.ts
ALLOWED_EXTENSIONS = {
    "video": {"mp4", "mov", "mkv", "avi"},
    "audio": {"mp3", "wav", "aac", "m4a", "flac", "ogg", "webm", "opus"},
    "image": {"png", "jpg", "jpeg", "webp", "tiff", "bmp"}
}

MAX_SIZE_BYTES = {
    "video": 250 * 1024 * 1024,  # 250MB
    "audio": 50 * 1024 * 1024,   # 50MB
    "image": 25 * 1024 * 1024    # 25MB
}

def detect_category(filename: str, content_type: Optional[str] = None) -> Optional[str]:
    """
    Detect whether a file is video, audio, or image.
    
    webm is ambiguous (can be audio or video container). We use content_type
    to disambiguate: audio/webm → audio, video/webm → video.
    If no content_type, extension-based lookup applies (webm → audio, since
    browser MediaRecorder audio recordings typically use .webm).
    """
    ext = filename.split(".")[-1].lower() if "." in filename else ""

    # Content-type takes priority (handles webm ambiguity)
    if content_type:
        if content_type.startswith("video/"):
            # video/webm → treat as video
            if ext == "webm":
                return "video"
            return "video"
        if content_type.startswith("audio/"):
            return "audio"
        if content_type.startswith("image/"):
            return "image"

    # Fallback to extension-based lookup
    for category, ext_set in ALLOWED_EXTENSIONS.items():
        if ext in ext_set:
            return category
    return None


@router.post(
    "/analyze",
    response_model=AnalyzeResponse,
    summary="Analyze media file or URL for synthetic AI artifacts"
)
async def analyze_media(
    file: Optional[UploadFile] = File(None),
    url: Optional[str] = Form(None)
):
    """
    Accepts an uploaded media file or URL, validates it against size and format limits,
    performs forensic analysis, and automatically purges any temporary file on disk.

    - **Image files**: real ViT deepfake classifier inference
    - **Video files**: real ViT classifier on 16 evenly-spaced frames
    - **Audio files**: simulated analysis (no audio model loaded)
    - **URLs**: simulated analysis, marked with simulated=True
    """
    if not file and not url:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Either a file upload or a media URL must be provided."
        )

    # ── URL Input (link analysis not available) ──────────────────────────────
    if url and not file:
        url_clean = url.strip()
        parsed = urlparse(url_clean)
        if not parsed.scheme or not parsed.netloc:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid URL format. Must include protocol (e.g. https://...).",
            )

        url_path = parsed.path
        filename = os.path.basename(url_path) or "remote_media_stream"
        from app.models.schemas import BreakdownScores
        from app.services.analyzer import compute_sha256_bytes
        seed_bytes = url_clean.encode("utf-8")
        sha256_hex = compute_sha256_bytes(seed_bytes)

        return AnalyzeResponse(
            ai_probability=0.0,
            verdict="inconclusive",
            confidence=0.0,
            breakdown=BreakdownScores(face=0.0, lip_sync=0.0, audio=0.0, texture=0.0, metadata=0.0),
            flagged_segments=[],
            input_type="url",
            media_name=filename,
            sha256=sha256_hex,
            demo_mode=False,
            simulated=False,
            message="Link analysis is not available in this version. Download the file and upload it instead.",
        )

    # ── File Upload ───────────────────────────────────────────────────────────
    if file:
        raw_name = file.filename or "uploaded_media"
        filename = os.path.basename(raw_name) or "uploaded_media"
        category = detect_category(filename, file.content_type)
        if not category:
            allowed_summary = "video (mp4, mov, webm, mkv, avi), audio (mp3, wav, aac, m4a, flac, ogg), image (png, jpg, jpeg, webp)"
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Unsupported file format. Please upload {allowed_summary}.",
            )

        # Ensure filename has an appropriate extension to avoid ambiguous handling
        ext = filename.split(".")[-1].lower() if "." in filename else ""
        if ext not in ALLOWED_EXTENSIONS[category]:
            # Append standard extension if missing/mismatched from content-type
            fallback_ext = list(ALLOWED_EXTENSIONS[category])[0]
            filename = f"{filename}.{fallback_ext}"

        max_allowed = MAX_SIZE_BYTES[category]

        # Write to a temporary file for safe streaming & post-analysis deletion
        temp_dir = tempfile.mkdtemp(prefix="truthlens_")
        temp_path = os.path.join(temp_dir, filename)

        try:
            total_bytes = 0
            with open(temp_path, "wb") as f_out:
                while chunk := await file.read(1024 * 1024):  # 1MB chunks
                    total_bytes += len(chunk)
                    if total_bytes > max_allowed:
                        max_mb = max_allowed // (1024 * 1024)
                        raise HTTPException(
                            status_code=status.HTTP_400_BAD_REQUEST,
                            detail=f"File exceeds maximum allowed size of {max_mb}MB for {category}s.",
                        )
                    f_out.write(chunk)

            if total_bytes == 0:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Uploaded file is empty (0 bytes).",
                )

            # ── Route to the right analysis path ─────────────────────────────
            if category == "image":
                from app.services.image_detector import analyze_image
                result = analyze_image(file_path=temp_path, media_name=filename)

            elif category == "video":
                from app.services.video_detector import analyze_video
                result = analyze_video(file_path=temp_path, media_name=filename)

            else:
                # Audio: real Wav2Vec2 deepfake classifier
                from app.services.audio_detector import analyze_audio
                result = analyze_audio(file_path=temp_path, media_name=filename)

            return result

        finally:
            # Zero-retention: delete uploaded file after analysis
            try:
                if os.path.exists(temp_path):
                    os.remove(temp_path)
                if os.path.exists(temp_dir):
                    shutil.rmtree(temp_dir, ignore_errors=True)
            except Exception:
                pass
