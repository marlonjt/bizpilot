from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional


# Schemas for user creation, login and response
class ClientCreate(BaseModel):
    full_name: str
    email: EmailStr
    phone: Optional[str] = None
    notas: Optional[str] = None


class ClientUpdate(BaseModel):
    full_name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    notas: Optional[str] = None


class ClientResponse(BaseModel):
    id: int
    full_name: str
    email: EmailStr
    phone: Optional[str] = None
    notas: Optional[str] = None
    is_active: bool
    created_at: datetime
    owner_id: int

    class Config:
        from_attributes = True
