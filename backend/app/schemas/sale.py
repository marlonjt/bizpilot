from pydantic import BaseModel
from datetime import datetime
from typing import Optional
from decimal import Decimal


class SaleCreate(BaseModel):
    """Data required to create a new sale."""

    client_id: int
    product_id: int
    quantity: int
    notes: Optional[str] = None


class SaleUpdate(BaseModel):
    """All fields optional — only provided fields will be updated (PATCH behavior)."""

    quantity: Optional[int] = None
    notes: Optional[str] = None


class SaleResponse(BaseModel):
    """Data returned to the client after create/read/update operations."""

    id: int
    quantity: int
    unit_price: Decimal
    total: Decimal
    notes: str
    created_at: datetime
    client_id: int
    product_id: int
    owner_id: int

    class Config:
        from_attributes = True
