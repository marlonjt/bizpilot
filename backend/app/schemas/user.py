from pydantic import BaseModel, EmailStr
from typing import Optional

class UserCreate(BaseModel):
    """Data required to register a new user."""

    full_name: str
    email: EmailStr
    password: str


class UserLogin(BaseModel):
    """Data required to authenticate a user."""

    email: EmailStr
    password: str


class UserResponse(BaseModel):
    """Data returned to the client after register/login/me. Never exposes the password."""

    id: int
    full_name: str
    email: EmailStr
    is_active: bool

    class Config:
        from_attributes = True  # Allows converting SQLAlchemy models to Pydantic


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str


class RefreshTokenRequest(BaseModel):
    refresh_token: str

class UserUpdate(BaseModel):
    """Data allowed to be updated in the profile."""

    full_name: Optional[str] = None
    password: Optional[str] = None
