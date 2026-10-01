from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .api import auth, classification
from .db.session import init_db

app = FastAPI(title="Tomato Disease Classifier API")

# CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, replace with actual frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Database
@app.on_event("startup")
def on_startup():
    init_db()

# Routes
app.include_router(auth.router)
app.include_router(classification.router)

@app.get("/")
def read_root():
    return {"message": "Welcome to Tomato Disease Classifier API. Visit /docs for API documentation."}
