# TruthLens Backend (FastAPI)

FastAPI forensic analysis backend for the TruthLens deepfake detection platform.

## Getting Started

### 1. Create a virtual environment
```bash
python -m venv venv
# On Windows:
.\venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate
```

### 2. Install dependencies
```bash
pip install -r requirements.txt
```

### 3. Run the development server
```bash
uvicorn main:app --reload --port 8000
```

The interactive OpenAPI documentation will be accessible at:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`
