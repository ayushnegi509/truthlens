"""
analyzer.py
-----------
Shared helpers (verdict thresholds, breakdown builder, segment builder, SHA-256)
and the fallback/simulated analysis path used for:
  - Audio files  (always simulated — no audio model loaded)
  - URL inputs   (always simulated — remote content not fetched)
  - Error fallbacks in image_detector / video_detector

For IMAGE and VIDEO inputs the real inference services
(image_detector, video_detector) are called from the endpoint.
"""

from __future__ import annotations

import hashlib
import random
from typing import List

from app.models.schemas import AnalyzeResponse, BreakdownScores, FlaggedSegment

from app.core.config import settings

def determine_verdict(ai_probability: float) -> str:
    if ai_probability <= settings.AUTHENTIC_THRESHOLD:
        return "authentic"
    elif ai_probability < settings.AMBER_THRESHOLD:
        return "suspicious"
    else:
        return "fake"


# ── File hashing ────────────────────────────────────────────────────────────

def compute_sha256(file_path: str) -> str:
    """Return hex SHA-256 of a file on disk."""
    hasher = hashlib.sha256()
    with open(file_path, "rb") as fh:
        for chunk in iter(lambda: fh.read(1024 * 1024), b""):
            hasher.update(chunk)
    return hasher.hexdigest()


def compute_sha256_bytes(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


# ── Shared builders ──────────────────────────────────────────────────────────

def build_breakdown(ai_prob: float, rng: random.Random, source: str = "any") -> BreakdownScores:
    """
    Build breakdown scores correlated around ai_prob with realistic jitter.
    Source hints allow weighting: video weights face/lip_sync higher,
    image weights face/texture higher, audio weights audio higher.
    """
    def jitter(base: float, variance: float = 18.0) -> float:
        val = base + rng.uniform(-variance, variance)
        return round(max(2.0, min(98.0, val)), 1)

    if source == "video":
        return BreakdownScores(
            face=jitter(ai_prob, 12),
            lip_sync=jitter(ai_prob, 10),
            audio=jitter(ai_prob, 22),      # audio not inspected in video path
            texture=jitter(ai_prob, 15),
            metadata=jitter(ai_prob, 20),
        )
    elif source == "image":
        return BreakdownScores(
            face=jitter(ai_prob, 12),
            lip_sync=jitter(ai_prob, 25),   # not relevant for still image
            audio=jitter(ai_prob, 28),       # not relevant for still image
            texture=jitter(ai_prob, 10),
            metadata=jitter(ai_prob, 20),
        )
    elif source == "audio":
        return BreakdownScores(
            face=jitter(ai_prob, 28),
            lip_sync=jitter(ai_prob, 22),
            audio=jitter(ai_prob, 8),        # tighter for audio-focused analysis
            texture=jitter(ai_prob, 30),
            metadata=jitter(ai_prob, 18),
        )
    else:
        return BreakdownScores(
            face=jitter(ai_prob),
            lip_sync=jitter(ai_prob),
            audio=jitter(ai_prob),
            texture=jitter(ai_prob),
            metadata=jitter(ai_prob),
        )


POSSIBLE_ISSUES = [
    ("Facial boundary micro-jitter detected during head movement", "face"),
    ("HiFi-GAN vocoder spectral harmonics anomaly in upper frequencies", "audio"),
    ("Phoneme-to-mouth viseme synchronization lag (>85ms offset)", "lip_sync"),
    ("Diffusion latent texture noise inconsistency along cheek perimeter", "texture"),
    ("EXIF compression metadata mismatch indicating re-encoding splice", "metadata"),
    ("Atypical biological blink cadence with unnatural fixation interval", "face"),
    ("Unnatural phase cancellation and synthetic robotic breath cadence", "audio"),
]


def build_flagged_segments(
    ai_prob: float,
    verdict: str,
    rng: random.Random,
) -> List[FlaggedSegment]:
    """Build temporally-ordered simulated flagged segments."""
    if verdict == "fake":
        segment_count = rng.randint(2, 4)
    elif verdict == "suspicious":
        segment_count = rng.randint(1, 2)
    else:
        segment_count = 1 if rng.random() < 0.3 else 0

    segments: List[FlaggedSegment] = []
    cur_time = round(rng.uniform(0.5, 2.5), 1)

    for _ in range(segment_count):
        duration = round(rng.uniform(1.2, 3.8), 1)
        end_time = round(cur_time + duration, 1)
        issue_text, _ = rng.choice(POSSIBLE_ISSUES)
        seg_score_raw = ai_prob + rng.uniform(-18.0, 18.0)
        seg_score = round(max(2.0, min(98.0, seg_score_raw)), 1)
        severity = "high" if seg_score >= 70 else ("medium" if seg_score >= 26 else "low")

        segments.append(
            FlaggedSegment(
                start_time=cur_time,
                end_time=end_time,
                description=issue_text,
                score=seg_score,
                severity=severity,
            )
        )
        cur_time = round(end_time + rng.uniform(1.5, 4.0), 1)

    return segments


# ── Simulated analysis (audio / URL inputs) ──────────────────────────────────

def generate_simulated_analysis(
    seed_bytes: bytes,
    media_name: str,
    input_type: str,
    category: str = "unknown",
) -> AnalyzeResponse:
    """
    Purely deterministic / simulated analysis.
    Used for audio files and URL inputs where no real model runs.
    Returns demo_mode=True and simulated=True.
    """
    sha256_hex = compute_sha256_bytes(seed_bytes)
    seed_int = int(sha256_hex[:16], 16)
    rng = random.Random(seed_int)

    ai_prob = round(rng.uniform(4.0, 96.0), 1)
    verdict = determine_verdict(ai_prob)
    confidence = round(rng.uniform(82.0, 99.5), 1)
    breakdown = build_breakdown(ai_prob, rng, source=category)
    flagged_segments = build_flagged_segments(ai_prob, verdict, rng)

    return AnalyzeResponse(
        ai_probability=ai_prob,
        verdict=verdict,
        confidence=confidence,
        breakdown=breakdown,
        flagged_segments=flagged_segments,
        input_type=input_type,
        media_name=media_name,
        sha256=sha256_hex,
        demo_mode=True,
        simulated=True,
    )
