from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List
from decimal import Decimal


class SaleCreate(BaseModel):
    """Data required to create a new sale."""

    client_id: int
    product_id: int
    quantity: int
    notes: Optional[str] = None


class SaleUpdate(BaseModel):
    """Only quantity and notes can be updated after a sale is created."""

    quantity: Optional[int] = None
    notes: Optional[str] = None


class SaleResponse(BaseModel):
    """Data returned after create/read/update operations."""

    id: int
    quantity: int
    unit_price: Decimal
    total: Decimal
    notes: Optional[str] = None
    created_at: datetime
    client_id: int
    product_id: int
    owner_id: int

    class Config:
        from_attributes = True


class SaleListResponse(BaseModel):
    """Paginated response — wraps items with total count."""

    total: int
    items: List[SaleResponse]
