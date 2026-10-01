from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class UserBase(BaseModel):
    username: str

class UserCreate(UserBase):
    password: str

class UserOut(UserBase):
    id: int
    created_at: datetime

    class Config:
        # Support both pydantic v1 (`orm_mode`) and v2 (`from_attributes`)
        orm_mode = True
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class ClassificationBase(BaseModel):
    label: str
    confidence: float
    image_path: str
    created_at: datetime

class ClassificationOut(ClassificationBase):
    id: int
    user_id: int

    class Config:
        orm_mode = True
        from_attributes = True
