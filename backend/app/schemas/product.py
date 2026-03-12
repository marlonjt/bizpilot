from pydantic import BaseModel
from datetime import datetime
from typing import Optional
from decimal import Decimal


# Schemas for product creation
class ProductCreate(BaseModel):
    name: str
    description: Optional[str] = None
    price: Decimal
    stock: Optional[int] = None


class ProductUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[Decimal] = None
    stock: Optional[int] = None


class ProductResponse(BaseModel):
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
