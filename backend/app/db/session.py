from sqlalchemy.orm import Session
from .models import Base, engine, SessionLocal

def init_db():
    Base.metadata.create_all(bind=engine)

# Re-export SessionLocal for easy imports
__all__ = ["init_db", "SessionLocal"]
