from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional


class ClientCreate(BaseModel):
    """Data required to create a new client."""

    full_name: str
    email: EmailStr
    phone: Optional[str] = None
    notes: Optional[str] = None  # renamed from 'notas' to 'notes' (English)


class ClientUpdate(BaseModel):
    """All fields optional — only provided fields will be updated (PATCH behavior)."""

    full_name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    notes: Optional[str] = None  # renamed from 'notas' to 'notes' (English)


class ClientResponse(BaseModel):
    """Data returned to the client after create/read/update operations."""

    id: int
    full_name: str
    email: EmailStr
    phone: Optional[str] = None
    notes: Optional[str] = None  # renamed from 'notas' to 'notes' (English)
    is_active: bool
    created_at: datetime
    owner_id: int

    class Config:
        from_attributes = True
