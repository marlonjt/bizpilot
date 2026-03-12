from pydantic import BaseModel
from datetime import datetime
from typing import Optional
from decimal import Decimal


class ProductCreate(BaseModel):
    """Data required to create a new product."""

    name: str
    description: Optional[str] = None
    price: Decimal  # Decimal for accurate money representation (avoids float rounding errors)
    stock: Optional[int] = None


class ProductUpdate(BaseModel):
    """All fields optional — only provided fields will be updated (PATCH behavior)."""

    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[Decimal] = None
    stock: Optional[int] = None


class ProductResponse(BaseModel):
    """Data returned to the client after create/read/update operations."""

    id: int
    name: str
    description: Optional[str] = None
    price: Decimal
    stock: int
    is_active: bool
    created_at: datetime
    owner_id: int

    class Config:
        from_attributes = True
