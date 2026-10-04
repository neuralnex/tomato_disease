from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from typing import List
import os
import uuid
from ..db.models import Classification, User
from ..db.session import SessionLocal
from ..api.auth import get_db
from ..ml.predictor import TomatoPredictor
from ..schemas.user import ClassificationOut
router = APIRouter(prefix="/classify", tags=["classification"])
predictor = TomatoPredictor()

UPLOAD_DIR = "backend/uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)


def get_or_create_guest_user(db: Session) -> User:
    guest_username = "guest"
    guest_user = db.query(User).filter(User.username == guest_username).first()
    if guest_user is None:
        guest_user = User(username=guest_username, hashed_password="guest")
        db.add(guest_user)
        db.commit()
        db.refresh(guest_user)
    return guest_user


@router.post("/predict")
async def predict_image(
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    current_user = get_or_create_guest_user(db)

    file_ext = os.path.splitext(file.filename)[1]
    filename = f"{uuid.uuid4()}{file_ext}"
    file_path = os.path.join(UPLOAD_DIR, filename)

    with open(file_path, "wb") as buffer:
        buffer.write(await file.read())

    try:
        result = predictor.predict(file_path)
        label = result["label"]
        confidence = result["score"]

        classification = Classification(
            user_id=current_user.id,
            image_path=file_path,
            label=label,
            confidence=confidence
        )
        db.add(classification)
        db.commit()
        db.refresh(classification)

        return {
            "label": label,
            "confidence": confidence,
            "image_path": file_path
        }
    except Exception as e:
        if os.path.exists(file_path):
            os.remove(file_path)
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")

@router.get("/history", response_model=List[ClassificationOut])
def get_history(db: Session = Depends(get_db)):
    current_user = get_or_create_guest_user(db)
    return db.query(Classification).filter(Classification.user_id == current_user.id).order_by(Classification.created_at.desc()).all()

@router.get("/stats")
def get_stats(db: Session = Depends(get_db)):
    current_user = get_or_create_guest_user(db)
    from sqlalchemy import func

    stats = db.query(
        Classification.label,
        func.count(Classification.id).label("count")
    ).filter(Classification.user_id == current_user.id).group_by(Classification.label).all()

    return {item[0]: item[1] for item in stats}
