# TruthLens - Deepfake Detection Platform

## 1. Project Overview
**TruthLens** is an advanced AI-powered forensic verification and deepfake detection platform designed to detect manipulated media across **video**, **audio**, and **images**. 

At the core of the user experience is the signature **Green / Amber / Red Verdict Bar** plus neutral inconclusive state:
- 🟢 **Green (Authentic / Low Risk)**: Confidence score 0% - 25% synthetic probability. Little to no signs of digital manipulation or generative synthesis.
- 🟡 **Amber (Suspicious / Inconclusive)**: Confidence score 26% - 69% synthetic probability. Anomalies detected in frequency spectra, lighting inconsistencies, or audio compression; manual forensic review recommended.
- 🔴 **Red (Manipulated / High Risk Deepfake)**: Confidence score 70% - 100% synthetic probability. High-probability generative AI artifacts (e.g., face swapping, diffusion boundaries, lip-sync mismatches, voice cloning artifacts).
- ⚪ **Neutral Grey (Inconclusive / No Face Detected)**: Returned when no human face is detected in an image or fewer than 3 video frames contain a detectable face ("No face detected, this model can only assess faces").

---

## 2. Tech Stack

### Frontend
- **Framework & Tooling**: [React 19](https://react.dev/) + [Vite](https://vitejs.dev/) (TypeScript)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Animations & Micro-interactions**: [Framer Motion](https://www.framer.com/motion/)
- **Data Visualizations & Metrics**: [Recharts](https://recharts.org/) (Timeline score charts, audio frequency spectra, confidence distribution)
- **Icons**: [Lucide React](https://lucide.dev/)

### Backend
- **Framework**: [FastAPI](https://fastapi.tiangolo.com/) (Python 3.10+)
- **Server**: [Uvicorn](https://www.uvicorn.org/) (ASGI)
- **Data Validation & Schemas**: [Pydantic v2](https://docs.pydantic.dev/)
- **File Handling**: `python-multipart` for high-throughput multipart uploads (video, audio, image)
- **Face Detection & Cropping**:
  - **OpenCV Face Detection**: Uses OpenCV DNN face detector (`YuNet` ONNX) with Haar cascade compatibility.
  - **Cropping**: When a face is located, crops with ~25% margin on all sides and scores the face crop rather than the full frame (eliminating false positives caused by non-face backgrounds, webcam surroundings, or screen bezels).
  - **No Face Handling**: If no face is found in an image, returns `verdict: "inconclusive"` and message `"No face detected, this model can only assess faces"`.
  - **Video Face Filtering**: For videos, only frames containing a face are classified. If fewer than 3 frames have a face, returns `verdict: "inconclusive"`.
  - **Aggregation**: Uses the median frame score for `ai_probability` and includes `frame_scores` list in the response.
- **Configurable Verdict Thresholds**: Configurable in `app/core/config.py` (`AUTHENTIC_THRESHOLD: 25.0`, `AMBER_THRESHOLD: 70.0`).
- **Real AI Inference (Image & Video)**:
  - **Model**: [`prithivMLmods/Deep-Fake-Detector-v2-Model`](https://huggingface.co/prithivMLmods/Deep-Fake-Detector-v2-Model) — ViT-based binary image classifier trained to distinguish `Realism` vs `Deepfake` images.
  - **Library stack**: `transformers` (HuggingFace pipeline), `torch` (CPU-only), `Pillow` (image I/O), `opencv-python-headless` (face detector & video frame extraction)
  - **Image pipeline**: Image → OpenCV face detector → ~25% margin crop → ViT classifier → `Deepfake` class probability → `ai_probability` (0–100)
  - **Video pipeline**: OpenCV extracts 16 evenly-spaced frames → filters frames with faces → crops face with 25% margin → classifies crops → median score `ai_probability` & `frame_scores`; frames ≥ 70% become `flagged_segments` with timestamps
  - **Model load**: Loaded **once at server startup** via FastAPI lifespan and cached in memory; zero per-request reload overhead
  - **Graceful degradation**: If model fails to load or inference errors, falls back to deterministic simulated results with `simulated: true` and `inference_error` in the response
- **Real AI Inference (Audio)**:
  - **Primary Model**: [`Gustking/wav2vec2-large-xlsr-deepfake-audio-classification`](https://huggingface.co/Gustking/wav2vec2-large-xlsr-deepfake-audio-classification) — Wav2Vec2 XLSR architecture fine-tuned for deepfake speech detection.
  - **Fallback Model**: [`OBITO03/Deepfakewav2vec2`](https://huggingface.co/OBITO03/Deepfakewav2vec2) — automatic fallback if primary model fails to load.
  - **Library stack**: `transformers` (`AutoFeatureExtractor`, `AutoModelForAudioClassification`), `torch` (CPU-only), `librosa` / `soundfile` (audio I/O & resampling).
  - **Audio pipeline**:
    - Converted to **16 kHz mono**.
    - Minimum duration gate: Audio < 2.0s returns `verdict: "inconclusive"` and message `"Audio too short (<duration>s). Minimum 2 seconds required for analysis."`.
    - Split into **5-second non-overlapping chunks** (up to a maximum of 12 chunks).
    - Each chunk is classified via `AutoModelForAudioClassification` with dynamic `id2label` fake label detection.
    - Aggregated via **median fake probability** across chunks → `ai_probability` (0–100).
    - Chunks scoring ≥ 70% become timestamped `flagged_segments` with severity `high`.
    - Browser recordings (`webm`, `ogg`, `opus`) decoded via librosa / ffmpeg with clear error if ffmpeg is missing.
    - Ephemeral storage: audio files deleted immediately after analysis.
  - **Model load**: Loaded once at server startup alongside ViT model via FastAPI lifespan.
  - **Badge**: Teal badge `"Analyzed by Wav2Vec2 audio classifier (limited accuracy)"` displayed when `simulated: false`.

### Model Limitations
> **Important**: This model is a research/demonstration classifier, not a production forensic tool.
- Trained primarily on face-swap deepfakes; may miss diffusion-model or voice-clone artifacts
- No temporal analysis — video frames are classified independently (no inter-frame consistency check)
- CPU-only inference; each video analysis takes ~5–30 seconds depending on video size
- The model has not been independently audited for bias across demographics or nationalities
- Results should be treated as probabilistic estimates, **not legal evidence**

### Running the Backend

```bash
cd backend

# 1. Create & activate a virtual environment
python -m venv .venv
.venv\Scripts\activate          # Windows
# source .venv/bin/activate     # macOS / Linux

# 2. Install CPU-only PyTorch first (avoids downloading 2GB+ CUDA wheels)
pip install torch torchvision --index-url https://download.pytorch.org/whl/cpu

# 3. Install remaining dependencies
pip install -r requirements.txt

# 4. Start the server (model downloads on first run, ~500MB)
uvicorn main:app --host 0.0.0.0 --port 8000

# Development with auto-reload (note: model reloads on each code change)
uvicorn main:app --reload
```

The model is downloaded from HuggingFace Hub on first startup and cached in `~/.cache/huggingface/`.  
Check model load status at `GET /` → `"model": "loaded"`.



---

## 3. Project Folder Structure

```
truthlens/
├── PROJECT_NOTES.md                   # Project documentation, architecture & roadmap
├── frontend/
│   ├── index.html                     # HTML root entry
│   ├── package.json                   # Dependencies (React, Vite, Tailwind, Framer Motion, Recharts)
│   ├── postcss.config.js              # PostCSS configuration
│   ├── tailwind.config.js             # Tailwind CSS configuration with custom theme colors
│   ├── tsconfig.json                  # TypeScript configuration
│   ├── tsconfig.node.json             # Vite TypeScript node config
│   ├── vite.config.ts                 # Vite bundler configuration
│   └── src/
│       ├── main.tsx                   # React app entry point
│       ├── App.tsx                    # Shell layout and placeholder router
│       ├── index.css                  # Global styles & Tailwind directives
│       ├── assets/                    # Static assets, logos, icons
│       ├── components/                # Reusable UI components
│       │   ├── common/                # Buttons, Cards, Badges, Modals
│       │   ├── verdict/               # Signature Green/Amber/Red Verdict Bar & gauges
│       │   ├── charts/                # Recharts wrappers (Time series, Confidence radar)
│       │   └── upload/                # Multi-modal drag & drop dropzones
│       ├── pages/                     # Application page views (to be built)
│       ├── services/                  # API clients and FastAPI fetch handlers
│       ├── types/                     # TypeScript interfaces (Verdict, ScanResult, FileMeta)
│       └── utils/                     # Color helpers, score formatters, forensic utilities
└── backend/
    ├── main.py                        # FastAPI application entrypoint
    ├── requirements.txt               # Backend Python dependencies
    ├── README.md                      # Backend setup and API documentation
    └── app/
        ├── __init__.py
        ├── core/                      # Application config, CORS, logging, security
        │   ├── __init__.py
        │   └── config.py
        ├── models/                    # Pydantic schemas and database models
        │   ├── __init__.py
        │   └── schemas.py
        ├── api/                       # API route endpoints
        │   ├── __init__.py
        │   └── v1/
        │       ├── __init__.py
        │       ├── endpoints/
        │       │   ├── __init__.py
        │       │   ├── analyze_image.py
        │       │   ├── analyze_video.py
        │       │   ├── analyze_audio.py
        │       │   └── health.py
        │       └── router.py
        └── services/                  # Deepfake detection heuristics and inference stubs
            ├── __init__.py
            ├── image_detector.py
            ├── video_detector.py
            └── audio_detector.py
```

---

## 4. Checklist of Pages to Build

- [x] **1. Landing / Overview Page (Redesigned - Clean & Simple Architecture)** *(Completed)*
  - **Clean & Focused 5-Section Layout**:
    1. **Hero**: Headline ("Verify what's real."), ONE short sentence ("Upload a photo, video or audio clip and see how likely it is to be AI-generated."), one primary button ("Analyze media"), and one small text link ("How it works"). Completely removed badges, stats rows, long technical paragraphs, and slider widgets.
    2. **How It Works**: 3 simple, non-technical steps (Upload, Analyze, Get your result) with one short sentence each.
    3. **Result Scale**: A single clean horizontal green / amber / red bar (0-25% Likely real, 26-69% Unsure, 70-100% Likely AI) with 3 straightforward plain-language cards with zero complex sliders or sample tabs.
    4. **Privacy**: Minimalist 3-point guarantee (No files stored, Never used for AI training, Secure transmission) with direct link to Privacy Center.
    5. **Final CTA & Simple Footer**: Clean call to action ("Ready to check your media?") and streamlined footer without technical jargon, fake social proof, or operational badges.
  - **Navbar Redesign**:
    - Fixed brand logo overlapping links with flex shrinking and spacious responsive layout.
    - Simplified navigation to strictly 4 core items: `Analyze`, `History`, `Learn`, `Privacy`.
    - Moved `Report & Help` into the footer and into the dedicated Learn page callout banner.
    - Cleaned up language toggle to unambiguously display `EN / हिन्दी` with active indicator.
    - Preserved theme toggle and primary action button.
  - **Clean Aesthetic**: Generous whitespace, one clear focal point per section, removed glow effects/borders, larger readable typography, and fully responsive across screen sizes.


- [x] **2. Multi-Modal Scan / Upload Hub & Analysis Page** *(Completed)*
  - **Single Unified Drag-and-Drop Dropzone (`DropzoneUpload`)**:
    - Unified drag-and-drop supporting MP4/MOV/WEBM, WAV/MP3/AAC, and PNG/JPG/WEBP with active drag effects and file browsing.
  - **Interactive File Preview (`MediaPreviewCard`)**:
    - HTML5 video player with controls, audio player with animated acoustic waveform frequency bars, and spatial image viewer.
    - Real-time client-side cryptographic SHA-256 integrity hash calculation with one-click clipboard copy.
    - Expandable forensic metadata drawer detailing MIME types, file sizes, intake provenance, and ephemeral sandbox confirmation.
  - **Strict Format & Size Validation (`fileValidation`)**:
    - Limits: Video ≤ 250MB, Audio ≤ 50MB, Image ≤ 25MB.
    - Real-time rejection alerts with helpful guidance and validation success badges.
  - **Forensic Configuration Panel**:
    - Standard Fast Screen (<1.5s sub-second check) vs. Deep Multi-Frame Audit (multi-frame sampled inspection).
    - Modular toggle checklist for Spatial GAN artifacts, Multi-frame temporal sampling, Acoustic frequency analysis (simulated), and EXIF metadata inspection.
  - **Animated Progress Stepper & Terminal (`ProgressStepper`)**:
    - 4 distinct progress stages: Uploading & Pre-Hashing, Extracting Signals, Running AI Models, Generating Report.
    - Master animated percentage bar (0% → 100%) with pulsing status glows and phase icons.
    - Live neural event stream / terminal log console outputting realistic real-time timestamps and model diagnostics.
    - Completed verdict preview card presenting the signature **Green / Amber / Red Verdict Bar**, synthetic confidence score, key forensic indicators, and options to re-scan or view breakdown.
  - **FastAPI Backend Integration & Deterministic Engine (`/analyze`)**:
    - Connected frontend analysis flow directly to `POST /analyze`.
    - Returns AI probability (0-100), verdict (`authentic` 0-25, `suspicious` 26-69, `fake` 70-100), confidence, breakdown scores (face, lip-sync, audio, texture, metadata), and timestamped flagged segments.
    - Ephemeral server-side intake with automatic purge of temporary files post-analysis.
    - Verdict screen displays interactive modality breakdown, flagged timeline segments, and simulated results demo badge (`Demo mode: results are simulated`).

- [x] **3. Forensic Analysis & Verdict Dashboard (Dedicated Result Page/View)** *(Completed)*
  - **Large Horizontal Verdict Bar**: Signature Green / Amber / Red scale calibrated with exact thresholds:
    - Authentic / Low Risk (0% - 25%)
    - Suspicious / Inconclusive (26% - 69%)
    - Manipulated / High Risk Deepfake (70% - 100%)
    - Interactive indicator marker needle, AI probability percentage, category badge, and model confidence score.
  - **Forensic Modality Breakdown Cards**:
    - 5 core diagnostic dimensions (Facial Coherence, Lip-Sync Timing, Audio Naturalness, Texture & Latent Noise, Metadata & Headers).
    - Color-coded mini progress bars for rapid visual appraisal with accessible severity text labels (`Clean`, `Suspicious`, `Manipulated`) and semantic icons.
  - **Timeline Heatmap of Flagged Segments**:
    - Continuous horizontal temporal timeline track mapping timestamped anomalies across the duration.
    - Anomaly blocks color-coded by severity (Low 0-25%, Medium 26-69%, High 70-100%) with start/end timestamps and descriptions.
  - **"Why was this flagged?" Plain-Language Explanation**:
    - Contextual diagnostic overview translating classifier signals, compression variance, and boundaries into clear human-readable bullet points.
  - **Probabilistic Evidence Disclaimer**:
    - High-visibility legal notice clarifying that results are probabilistic neural estimates and heuristics, not legal proof or court testimony.
  - **Accessibility First**:
    - Screen-reader friendly icons (`ShieldCheck`, `AlertTriangle`, `AlertOctagon`, `Activity`, `Sparkles`) and explicit text labels alongside colors for contrast and accessibility.
  - **Friendly Unreachable Backend Error State**:
    - Full error state card with actionable troubleshooting instructions, server command hints, and one-click retry / media re-scan buttons.
  - **Demo Mode Badge**:
    - Prominent `Demo mode: results are simulated` badge maintained across the verdict views.
  - **Forensic Frame Viewer with Bounding Boxes (`FrameViewer.tsx`)**:
    - Interactive frame scrubber (Frames F1 through F8) with dynamic spatial bounding boxes around detected synthetic anomalies (GAN face-swap perimeter, lip-sync viseme lag, diffusion latent noise).
    - Toggleable bounding box overlays, simulated heatmap visualization, active crosshair HUD, and per-region geometry diagnostics (top/left offset, bounding dimensions, and localized risk scores).
  - **Acoustic Waveform with Flagged Segments (`AudioWaveform.tsx`)**:
    - 48-band frequency bar visualizer with interactive playhead scrubbing and simulated acoustic audio playback.
    - Highlighted temporal anomaly underlay zones color-coded by severity (rose, amber, emerald) with real-time playhead harmonic status inspection.
  - **Download Forensic PDF Report (`pdfReport.ts`)**:
    - One-click print/save-as-PDF report generator with printable forensic layout containing SHA-256 checksums, verdict calibration scale, modality breakdown scores, anomaly log table, and legal disclaimers.
  - **Dedicated Views**:
    - Reusable `<ResultView />` component seamlessly embedded within `<ProgressStepper />` and standalone `<ResultPage />` routed via `#result` hash.

- [x] **4. Deep Forensic Breakdown & Evidence Page** *(Completed & Integrated)*
  - Frame-by-frame temporal video & spatial scrubber with interactive bounding box anomaly inspection (`FrameViewer`)
  - Audio spectral visualizer highlighting acoustic frequency anomalies and flagged segments (`AudioWaveform`)
  - Heatmap visual overlays on flagged image/video regions
  - Export capabilities (Detailed print-ready PDF audit report via `generateForensicPdfReport`, JSON metadata export)

- [x] **5. Scan History & Telemetry Dashboard (`HistoryPage.tsx`)** *(Completed)*
  - **Automatic Scan Persistence**: Completed analyses automatically saved to `localStorage` via `saveScanToHistory` with zero server footprint.
  - **Recharts Analytics & Metrics (`HistoryStats.tsx`)**:
    - Total scans verified counter.
    - Fake detection rate (%) with flagged count badges.
    - Authentic media volume and percentage ratio.
    - Mean neural model confidence metric.
    - Continuous AreaChart tracking AI synthetic probability trends chronologically over time.
    - Donut PieChart breakdown of Authentic vs. Suspicious vs. Manipulated proportions.
    - Modality volume BarChart across video, audio, and image inputs.
  - **Filter & Searchable Registry (`HistoryTable.tsx`)**:
    - Real-time text search filtering across file names and SHA-256 cryptographic hashes.
    - Semantic verdict filters (All, Authentic, Suspicious, Fake/Tampered).
    - Modality filter selector (All, Videos, Audio, Images).
    - Sortable table columns by chronological date or AI synthetic probability.
    - Multi-select batch checkbox operations with bulk JSON export and delete actions.
    - Individual row actions: View full forensic report in ResultView, generate print-ready PDF audit report, or delete from storage.
    - Local storage retention management with single-item deletion and complete registry wipe.

- [x] **6. Privacy Center & Metadata Defense (`PrivacyCenterPage.tsx`)** *(Completed)*
  - **Data Retention Settings (`PrivacySettingsCard.tsx`)**:
    - Configurable retention options: Zero Retention (none), Session Only (<3h), 24 Hours, 7 Days, 30 Days (default), and Unlimited (forever).
    - Automatic pruning of expired records in `localStorage` upon retention updates or app load (`purgeExpiredHistory`).
    - Emergency one-click local storage purge button.
  - **Face-Blur Option for Exported Reports**:
    - Configurable privacy toggle (`faceBlurOnExport`) integrated into `generateForensicPdfReport`.
    - Automatically adds privacy protocol badge and CSS facial bounding box anonymization to prevent identity leakage in audit disclosures.
  - **Client-Side EXIF & Binary Metadata Scanner (`ExifScannerCard.tsx`, `exifScanner.ts`)**:
    - In-browser JPEG App1 EXIF marker and TIFF header parser extracting embedded binary metadata.
    - Detects and flags high-risk personal data: GPS latitude/longitude/altitude coordinates with one-click Google Maps links, hardware camera make/model/software fingerprints, and capture timestamps.
    - Evaluates privacy severity tiers (`critical`, `high`, `medium`, `clean`).
    - Includes interactive "Load Sample Photo" button for testing and demonstration.
  - **Data Handling & Ephemeral Architecture Explainer (`DataHandlingExplainer.tsx`)**:
    - 4-phase data lifecycle breakdown: Client-Side Pre-Hashing (Intake), Encrypted TLS Transport (Transport), Ephemeral Memory Inspection (Execution), Immediate Buffer Purge (Disposal).
    - Guarantees: Zero model training on user media, local-only browser session persistence, and GDPR/CCPA alignment.

- [x] **7. Learn & Awareness Page (`LearnPage.tsx`, `#learn`)** *(Completed)*
  - **How Deepfakes Work (Under the Hood)**:
    - Detailed breakdowns of Autoencoders & Latent Embeddings, Generative Adversarial Networks (GANs), Latent Diffusion Models, and Neural Vocoder Voice Cloning.
    - Key forensic tell-tales listed for each architecture (boundary seams, checkerboard artifacts, lighting contradictions, viseme lag).
  - **8 Practical Tips to Spot Deepfakes**:
    - Sensory guidelines: Eye blink rate cadence, phoneme-lip sync alignment, facial asymmetry & jewelry, jawline/neck boundary seams, corneal specular reflections, acoustic background noise bleed, plastic skin texture over-smoothing, and provenance cross-verification.
  - **Awareness Articles & Investigative Briefings**:
    - CEO & family emergency voice clone scams with safe-word protocols.
    - Electoral & civic disinformation defense with release timing scrutiny.
    - Non-consensual synthetic imagery victim rights & 24-hour intermediary takedowns.
    - Expandable briefing modal / drawer with full advisory text.
  - **Interactive STOP & VERIFY Protocol**:
    - Callout banner guiding users to verify provenance before forwarding viral media.

- [x] **8. Report & Help Center (`ReportHelpPage.tsx`, `#help`)** *(Completed)*
  - **India Cybercrime Resources**:
    - 24x7 National Cyber Crime Helpline **1930** (operated by MHA Indian Cyber Crime Coordination Centre I4C) with direct `tel:1930` dialing and copy button.
    - Official National Cyber Crime Reporting Portal **cybercrime.gov.in** with direct links and pipeline instructions.
  - **Immediate 4-Step Incident Response Playbook**:
    - Step 1: Preserve digital evidence (screenshots, URLs, raw files).
    - Step 2: Run TruthLens forensic audit & download SHA-256 evidence-support report (PDF).
    - Step 3: Report to 1930 Helpline or cybercrime.gov.in (anonymous reporting supported).
    - Step 4: Issue 24-hour mandatory intermediary takedown notice.
  - **Indian Legal Protections & IT Rules**:
    - IT Act 2000 Section 66D (Cheating by personation).
    - IT Act 2000 Section 66E & 67A (Privacy violation and non-consensual morphed media).
    - IT Rules 2021 Rule 3(2)(b) (Mandatory 24-hour platform removal of non-consensual intimate imagery).
    - General Information Disclaimer: Clear advisory that guidance is informational and technical, not formal legal counsel.
  - **Interactive FAQ Accordion**:
    - 6 comprehensive questions addressing anonymous complaints, using evidence-support reports as technical context, platform grievance officers, and family scam prevention.

- [x] **9. Multi-Lingual Architecture (English / Hindi Toggle)** *(Completed)*
  - `LanguageContext` (`LanguageContext.tsx`) with instant navbar toggle (`EN | हिन्दी`).
  - Persisted language preferences in browser `localStorage`.
  - Comprehensive translations covering navigation, hero messaging, verdict scale definitions, educational topics, and help resources.

---

## 5. Frontend Design System & Component Library

### Theme Tokens
- **Theme**: Dark Navy primary theme with light-mode toggle (persisted via `localStorage` in `ThemeContext`).
- **Typography**: Inter (`font-sans`) for sleek modern legibility; JetBrains Mono (`font-mono`) for technical forensic data & scores.
- **Dark Navy Palette**:
  - `navy-950` (`#060a14`): Deep canvas background
  - `navy-900` (`#0a1020`): Main surface background
  - `navy-850` (`#0e172e`): Elevated cards & panels
  - `navy-800` (`#13203e`): Hover states & interactive elements
  - `navy-700` (`#1d2e56`): Borders and structural dividers
- **Accent Palette**:
  - `accent-cyan` (`#06b6d4`), `accent-teal` (`#14b8a6`), `accent-blue` (`#3b82f6`)
  - Gradient styling: `bg-gradient-to-r from-cyan-500 to-blue-600`
- **Semantic Verdict Palette**:
  - 🟢 **Authentic**: `verdict.authentic` (`#10B981`) | 0% – 25% synthetic likelihood
  - 🟡 **Suspicious / Inconclusive**: `verdict.amber` (`#F59E0B`) | 26% – 69% synthetic likelihood
  - 🔴 **Manipulated / AI Deepfake**: `verdict.deepfake` (`#EF4444`) | 70% – 100% synthetic likelihood

### Reusable UI Components
- **`Navbar`** (`src/components/common/Navbar.tsx`): Streamlined responsive navbar featuring TruthLens shield branding, 4 essential links (`Analyze`, `History`, `Learn`, `Privacy`), theme toggle (Sun/Moon), clean `EN / हिन्दी` language toggle, primary action button, and mobile menu drawer.
- **`Button`** (`src/components/common/Button.tsx`): Variants for `primary` (teal/blue gradient), `secondary` (navy surface), `outline`, `ghost`, and semantic states (`authentic`, `amber`, `danger`), with loading and icon props.
- **`Card`** (`src/components/common/Card.tsx`): Modular card system (`Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter`) with glassmorphism, interactive hover states, and semantic trim borders.
- **`Footer`** (`src/components/common/Footer.tsx`): Minimalist footer with plain-language mission statement, simplified navigation links, integrated `Report & Help` cybercrime resources, and verdict color indicators without technical jargon.
- **`VerdictBar`** (`src/components/verdict/VerdictBar.tsx`): Signature Green/Amber/Red visual bar with dynamic needle pin marker, threshold percentages, and categorization helper.
- **`VerdictTeaser`** (`src/components/verdict/VerdictTeaser.tsx`): Interactive simulator demonstrating the VerdictBar across sample video, audio, and face-swap clips, complete with an interactive range slider.
- **`QuickScanModal`** (`src/components/upload/QuickScanModal.tsx`): Responsive intake modal supporting drag-and-drop media upload, modality badges (Video, Audio, Image), fast vs. deep scan toggle, and privacy assurance.
- **`DropzoneUpload`** (`src/components/analysis/DropzoneUpload.tsx`): Drag-and-drop intake zone with format validation for Video, Audio, and Images, active drag visual feedback, and size boundary enforcement.
- **`MediaPreviewCard`** (`src/components/analysis/MediaPreviewCard.tsx`): Rich preview card for video (HTML5 player), audio (interactive waveform visualizer), and image files with SHA-256 integrity hash display, copy button, and expandable forensic metadata.
- [x] **`ProgressStepper`** (`src/components/analysis/ProgressStepper.tsx`): Animated multi-phase stepper (Uploading & Pre-Hashing, Extracting Signals, Running AI Models, Generating Report) with progress bar, real-time terminal event log, and integrated completed verdict card rendering `ResultView`.
- [x] **`ResultView`** (`src/components/analysis/ResultView.tsx`): Comprehensive verdict and forensic assessment view featuring the signature large `VerdictBar`, 5 modality breakdown cards with mini progress bars, temporal timeline heatmap of flagged segments, "Why was this flagged?" plain-language diagnostic section, probabilistic legal disclaimer, accessible icons/labels, and quick action to Report Misuse (`#help`).
- [x] **`ResultPage`** (`src/pages/ResultPage.tsx`): Dedicated result page view with breadcrumb navigation, status beacon, `ResultView` integration, and responsive layout.
- [x] **`AnalysisPage`** (`src/pages/AnalysisPage.tsx`): Streamlined scan hub page uniting drag-and-drop file upload, file preview, format & size validation, fast vs. deep scan configuration, modular detection checkboxes, and execution stepper.
- [x] **`HistoryPage`** (`src/pages/HistoryPage.tsx`): Historical analysis registry featuring `HistoryStats` Recharts telemetry and `HistoryTable` with interactive filters, sorting, search, and bulk export.
- [x] **`PrivacyCenterPage`** (`src/pages/PrivacyCenterPage.tsx`): Hub for data retention controls, client-side metadata auditing, and zero-retention explanations.
- [x] **`LearnPage`** (`src/pages/LearnPage.tsx`): Deepfake education, neural mechanics, 8 sensory spotting tips, and awareness briefings.
- [x] **`ReportHelpPage`** (`src/pages/ReportHelpPage.tsx`): India cybercrime resources (cybercrime.gov.in, Helpline 1930), 4-step emergency response playbook, IT Act & IT Rules 2021 statutory rights, and interactive FAQ.
- [x] **`LanguageContext`** (`src/context/LanguageContext.tsx`): Centralized English/Hindi localization with localStorage persistence.

