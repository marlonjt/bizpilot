from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from fastapi.security import OAuth2PasswordRequestForm

from app.database import get_db
from app.models.user import User
from app.schemas.user import UserCreate, UserResponse, UserLogin, UserUpdate
from app.core.security import hash_password, create_access_token, verify_password
from app.core.security import (
    get_current_user,
    create_refresh_token,
    decode_access_token,
)
from app.schemas.user import RefreshTokenRequest

router = APIRouter(prefix="/auth", tags=["auth"])


def authenticate_user(email: str, password: str, db: Session) -> User:
    """
    Validates user credentials against the database.
    Returns the User object if valid, raises 401 otherwise.
    Shared by both login endpoints to avoid code duplication (DRY principle).
    """
    db_user = db.query(User).filter(User.email == email).first()
    if not db_user or not verify_password(password, db_user.hashed_password):
        raise HTTPException(status_code=401, detail="Incorrect email or password")
    return db_user


@router.post("/register", response_model=UserResponse, status_code=201)
def register(user: UserCreate, db: Session = Depends(get_db)):
    """Creates a new user account. Returns 400 if email is already in use."""
    existing_user = db.query(User).filter(User.email == user.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    new_user = User(
        full_name=user.full_name,
        email=user.email,
        hashed_password=hash_password(user.password),
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return new_user


@router.post("/login")
def login(user: UserLogin, db: Session = Depends(get_db)):
    db_user = authenticate_user(user.email, user.password, db)
    access_token = create_access_token(data={"sub": db_user.email})
    refresh_token = create_refresh_token(data={"sub": db_user.email})
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
    }


@router.post("/refresh")
def refresh(request: RefreshTokenRequest, db: Session = Depends(get_db)):
    try:
        payload = decode_access_token(request.refresh_token)
        if payload.get("type") != "refresh":
            raise HTTPException(status_code=401, detail="Invalid token type")
        email = payload.get("sub")
        db_user = db.query(User).filter(User.email == email).first()
        if not db_user:
            raise HTTPException(status_code=401, detail="User not found")
        new_access_token = create_access_token(data={"sub": email})
        return {"access_token": new_access_token, "token_type": "bearer"}
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid refresh token")


@router.post("/token")
def login_swagger(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
):
    """
    Form data login endpoint used by Swagger UI's Authorize button.
    Accepts: username (email) + password as form fields.
    Requires python-multipart to be installed.
    """
    db_user = authenticate_user(form_data.username, form_data.password, db)
    access_token = create_access_token(data={"sub": db_user.email})
    return {"access_token": access_token, "token_type": "bearer"}


@router.get("/me", response_model=UserResponse)
def get_current_user_info(current_user: User = Depends(get_current_user)):
    """Returns the profile of the currently authenticated user."""
    return current_user

@router.put("/profile", response_model=UserResponse)
def update_profile(
    user_data: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),  # Protege la ruta
):
    """Updates the name or password of the authenticated user."""

    # Si el usuario envió un nuevo nombre, lo actualizamos
    if user_data.full_name:
        current_user.full_name = user_data.full_name

    # Si envió una contraseña, la hash antes de guardarla
    if user_data.password and len(user_data.password) >= 6:
        current_user.hashed_password = hash_password(user_data.password)

    db.add(current_user)
    db.commit()  # Guarda los cambios en la base de datos
    db.refresh(current_user)  # Recarga el objeto con los datos nuevos

    return current_user
