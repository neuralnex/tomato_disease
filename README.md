# Tomato Disease Classifier

A full-stack application to detect tomato leaf diseases.

## Backend
- Framework: FastAPI
- Database: SQLite
- ML Model: nexusbert/tomato-disease-vit (ViT)

> Important: This project is not compatible with Python 3.14. The pinned ML dependencies (`transformers`, `tokenizers`, and `torch`) are built for Python 3.10–3.12 and fail to install on 3.14 on Windows.

### Running Backend:
1. Install Python 3.11 or 3.12 (recommended: 3.11).
2. Create a virtual environment:
   - Windows: `py -3.11 -m venv venv`
   - macOS/Linux: `python3.11 -m venv venv`
3. Activate it:
   - Windows PowerShell: `./venv/Scripts/Activate.ps1`
   - macOS/Linux: `source venv/bin/activate`
4. Upgrade packaging tools: `python -m pip install --upgrade pip setuptools wheel`
5. Install dependencies: `pip install -r backend/requirements.txt`
6. Start the server: `uvicorn backend.app.main:app --reload`

If you already created a venv with Python 3.14, delete it and recreate it with Python 3.11 or 3.12 before installing the backend dependencies.

## Frontend
- Framework: React + Tailwind CSS

### Running Frontend:
1. `cd frontend`
2. `npm install`
3. `npm start`
