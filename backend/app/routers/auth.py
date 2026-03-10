from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

# Importaciones locales de mi app
from app.database import get_db
from app.models.user import User
from app.schemas.user import UserCreate, UserResponse
from app.core.security import hash_password

# Router para el registro
router = APIRouter(prefix="/auth", tags=["auth"])

# Método post para enviar la información del user
@router.post("/register", response_model=UserResponse, status_code=201)

# función para crear un nuevo user
def register(user: UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.email == user.email).first()

    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    hashed_password = hash_password(user.password)

    new_user = User(
        full_name=user.full_name, email=user.email, hashed_password=hashed_password
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return new_user
