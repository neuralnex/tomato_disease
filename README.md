# Tomato Disease Classifier

A full-stack application to detect tomato leaf diseases.

## Backend
- Framework: FastAPI
- Database: SQLite
- ML Model: nexusbert/tomato-disease-vit (ViT)

### Running Backend:
1. `python3 -m venv venv`
2. `source venv/bin/activate`
3. `pip install -r backend/requirements.txt`
4. `uvicorn backend.app.main:app --reload`

## Frontend
- Framework: React + Tailwind CSS

### Running Frontend:
1. `cd frontend`
2. `npm install`
3. `npm start`
