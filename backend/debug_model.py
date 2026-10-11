#!/usr/bin/env python3
"""
backend/debug_model.py
----------------------
Diagnostic script for TruthLens deepfake detection.

Runs a folder of images and prints:
- filename
- face found: yes/no (and bounding box)
- raw class probabilities for each label
- final ai_probability
- verdict (authentic / suspicious / fake / inconclusive)

Usage
-----
  cd backend
  python debug_model.py <folder_of_images>
"""

from __future__ import annotations

import sys
import os
import statistics
from pathlib import Path

# Make sure backend root is on sys.path
sys.path.insert(0, str(Path(__file__).parent))

from app.core.config import settings
from app.services.face_detector import crop_face_from_pil
from app.services.analyzer import determine_verdict

SUPPORTED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".bmp", ".tiff", ".tif", ".gif"}


def verdict_display(verdict: str, ai_prob: float) -> str:
    if verdict == "inconclusive":
        return "[INCONCLUSIVE] (no face)"
    elif verdict == "authentic":
        return f"[AUTHENTIC] ({ai_prob:.1f}%)"
    elif verdict == "suspicious":
        return f"[SUSPICIOUS] ({ai_prob:.1f}%)"
    else:
        return f"[FAKE/DEEPFAKE] ({ai_prob:.1f}%)"


def run_debug(folder: str) -> None:
    folder_path = Path(folder)
    if not folder_path.is_dir():
        print(f"[ERROR] '{folder}' is not a directory.")
        sys.exit(1)

    image_files = sorted(
        p for p in folder_path.iterdir()
        if p.is_file() and p.suffix.lower() in SUPPORTED_EXTENSIONS
    )
    if not image_files:
        print(f"[ERROR] No image files found in '{folder}'.")
        sys.exit(1)

    print("=" * 80)
    print("  TruthLens — Debug Model & Face Detection Script")
    print("=" * 80)
    print(f"\nFolder : {folder_path.resolve()}")
    print(f"Images : {len(image_files)} file(s) found\n")
    print(f"Verdict Thresholds: Authentic <= {settings.AUTHENTIC_THRESHOLD}%, Amber < {settings.AMBER_THRESHOLD}%")

    print("[*] Loading ViT classification model …")
    from transformers import pipeline  # type: ignore
    from PIL import Image, ImageOps   # type: ignore

    MODEL_ID = "prithivMLmods/Deep-Fake-Detector-v2-Model"
    pipe = pipeline(
        "image-classification",
        model=MODEL_ID,
        device=-1,   # CPU
        top_k=None,  # return all labels
    )

    id2label = pipe.model.config.id2label
    print(f"[model] id2label = {dict(id2label)}\n")

    print("-" * 80)
    print(f"{'Filename':<28} {'Face?':<6} {'Raw Probabilities':<26} {'ai_prob':>8}  Verdict")
    print("-" * 80)

    scored_probs: list[float] = []
    face_counts = 0

    for img_path in image_files:
        try:
            img = Image.open(img_path)
            img = ImageOps.exif_transpose(img)

            # Face detection and 25% margin crop
            cropped_face, bbox = crop_face_from_pil(img, margin=0.25)
            face_found = cropped_face is not None
            face_str = "yes" if face_found else "no"

            if not face_found:
                raw_str = "n/a (no face crop)"
                ai_prob = 0.0
                verdict = "inconclusive"
            else:
                face_counts += 1
                crop_rgb = cropped_face.convert("RGB")
                results = pipe(crop_rgb)
                label_map: dict[str, float] = {r["label"]: r["score"] for r in results}

                # Find Deepfake score
                deepfake_score: float | None = None
                for label, score in label_map.items():
                    if "deepfake" in label.lower():
                        deepfake_score = score
                        break

                if deepfake_score is None:
                    deepfake_score = 1.0 - max(label_map.values())

                ai_prob = round(deepfake_score * 100.0, 1)
                scored_probs.append(ai_prob)
                verdict = determine_verdict(ai_prob)

                # Format raw probabilities string
                raw_parts = [f"{k}: {v*100:.1f}%" for k, v in sorted(label_map.items())]
                raw_str = ", ".join(raw_parts)

            filename = img_path.name
            if len(filename) > 27:
                filename = filename[:24] + "…"

            print(
                f"{filename:<28} {face_str:<6} {raw_str:<26} {ai_prob:>7.1f}%  {verdict_display(verdict, ai_prob)}"
            )

        except Exception as exc:
            print(f"{img_path.name:<28} ERROR: {exc}")

    print("-" * 80)
    print(f"\n[summary] {len(image_files)} total images processed")
    print(f"          Faces detected: {face_counts}/{len(image_files)}")
    if scored_probs:
        print(f"          Scored faces count    : {len(scored_probs)}")
        print(f"          Mean   ai_probability : {statistics.mean(scored_probs):.1f}%")
        print(f"          Median ai_probability : {statistics.median(scored_probs):.1f}%")
        print(f"          Min    ai_probability : {min(scored_probs):.1f}%")
        print(f"          Max    ai_probability : {max(scored_probs):.1f}%")
        print(
            f"          Flagged as fake (>={settings.AMBER_THRESHOLD}%): "
            f"{sum(1 for p in scored_probs if p >= settings.AMBER_THRESHOLD)}/{len(scored_probs)}"
        )
    print("\n[done]")


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python debug_model.py <folder_of_images>")
        print("\nExample:")
        print("  python debug_model.py test_images/")
        sys.exit(1)

    run_debug(sys.argv[1])
