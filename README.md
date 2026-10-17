# TruthLens - AI Deepfake Detection Platform

**TruthLens** is an open-source forensic verification and synthetic media detection platform designed to evaluate images, videos, and audio for generative AI tampering. TruthLens pairs a **React 19 + TypeScript** frontend with a **FastAPI** backend running deepfake classification models.

---

## 🚦 Signature Verdict Scale

At the core of the user experience is the signature **Green / Amber / Red Verdict Bar** plus neutral inconclusive state:
- 🟢 **Green (Authentic / Low Risk)**: Confidence score 0% – 25% synthetic probability. Optical and acoustic patterns align with natural reference recordings.
- 🟡 **Amber (Suspicious / Inconclusive)**: Confidence score 26% – 69% synthetic probability. Anomalies detected in frequency spectra, lighting inconsistencies, or audio compression; manual forensic review recommended.
- 🔴 **Red (Manipulated / High Risk Deepfake)**: Confidence score 70% – 100% synthetic probability. High-probability generative AI artifacts (e.g. face swapping, diffusion boundaries, lip-sync mismatches).
- ⚪ **Neutral Grey (Inconclusive / No Face Detected)**: Returned when no human face is detected in an image or fewer than 3 video frames contain a detectable face.

---

## 📊 Current Status

### Working
- **Image and Video Analysis with ViT Model**: Still image classification and multi-frame video extraction powered by the [`prithivMLmods/Deep-Fake-Detector-v2-Model`](https://huggingface.co/prithivMLmods/Deep-Fake-Detector-v2-Model) Vision Transformer (ViT) classifier with OpenCV face detection and cropping.
- **Scan History**: Local client-side scan history registry with telemetry metrics, charts (Recharts), search, and filtering without storing user data on a server.
- **Privacy Center**: Data retention settings, automatic purge controls, and an in-browser EXIF binary metadata scanner that inspects GPS tags and device fingerprints.
- **PDF Report**: Downloadable and printable forensic audit report generator featuring cryptographic SHA-256 hashes, verdict breakdowns, anomaly logs, and optional face-blur privacy masking.
- **EN / Hindi Localization**: Seamless English and Hindi language toggle (`EN | हिन्दी`) across the user interface.

### Known Issues
- **False Positives**: Real photos, videos, and screenshots are sometimes flagged as AI (false positives).
- **Screenshots Without Faces**: Screenshots without faces give meaningless scores.
- **Limited Accuracy**: Accuracy is limited across edge cases, compressed media, and varied lighting environments.

### Not Done Yet
- **Audio Detection Calibration**: Continuous calibration and dataset expansion across diverse acoustic environments.
- **Face-Detection Gate & Threshold Calibration**: Enhanced face-detection gating and refined threshold calibration across diverse demographic distributions and media types.

---

## 🛠️ Architecture & Tech Stack

- **Frontend**:
  - React 19, Vite, TypeScript
  - Tailwind CSS, Lucide React, Framer Motion
  - Recharts (Trend analytics, modality breakdown, confidence distribution)
- **Backend**:
  - Python 3.10+ (FastAPI, Uvicorn ASGI)
  - Pydantic v2 schemas
  - PyTorch (CPU-only), Hugging Face `transformers`, Pillow, OpenCV Headless

---

## 🚀 Setup & How to Run Step-by-Step

### Prerequisites
- **Node.js** v18+ (Node 20+ recommended) and `npm`
- **Python** 3.10, 3.11, or 3.12 (with `pip` and `venv`)

---

### Step 1: Start the Backend (FastAPI)

1. Open a terminal and navigate to the `backend` directory:
   ```bash
   cd backend
   ```

2. Create and activate a Python virtual environment:
   ```bash
   # Windows (PowerShell)
   python -m venv .venv
   .venv\Scripts\Activate.ps1

   # Windows (CMD)
   python -m venv .venv
   .venv\Scripts\activate.bat

   # macOS / Linux
   python3 -m venv .venv
   source .venv/bin/activate
   ```

3. *(Recommended)* Install CPU-only PyTorch first to avoid downloading large CUDA packages:
   ```bash
   pip install torch torchvision --index-url https://download.pytorch.org/whl/cpu
   ```

4. Install the remaining dependencies:
   ```bash
   pip install -r requirements.txt
   ```

5. Start the FastAPI development server:
   ```bash
   uvicorn main:app --host 0.0.0.0 --port 8000 --reload
   ```

> **Note on First Run**: The deepfake detection model (~500MB) will download automatically from Hugging Face Hub on the first server startup and cache locally in `~/.cache/huggingface/`. Subsequent startups will load directly from the cache.

- **API Endpoint**: `http://localhost:8000/`
- **Interactive API Docs (Swagger UI)**: `http://localhost:8000/docs`
- **Alternative Documentation (ReDoc)**: `http://localhost:8000/redoc`

---

### Step 2: Start the Frontend (React + Vite)

1. Open a second terminal and navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```

2. Install the frontend dependencies:
   ```bash
   npm install
   ```

3. *(Optional)* Configure the backend API URL:
   By default, the frontend proxies/connects to `http://localhost:8000`. If running on a different port or domain, create a `.env` file inside `frontend/`:
   ```env
   VITE_API_URL=http://localhost:8000
   ```

4. Start the Vite development server:
   ```bash
   npm run dev
   ```

5. Open your browser and navigate to:
   ```
   http://localhost:5173
   ```

---

## 🔒 Security & Privacy Commitments

- **Ephemeral Ingestion**: Uploaded files processed by the backend are temporary and purged immediately post-analysis.
- **Client-Side SHA-256 Pre-Hashing**: Hashing is computed locally in the browser before upload to confirm media integrity.
- **Zero Training on User Data**: User media submissions are never stored permanently or used for model training.

---

## 📄 License

This project is licensed under the MIT License.
