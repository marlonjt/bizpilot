from pydantic import BaseModel, EmailStr


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
