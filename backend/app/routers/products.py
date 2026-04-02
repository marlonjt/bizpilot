from fastapi import APIRouter, Depends, HTTPException, Response, Path
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List

from app.database import get_db
from app.core.security import get_current_user
from app.models.product import Product
from app.models.user import User
from app.schemas.product import ProductCreate, ProductUpdate, ProductResponse, ProductListResponse

router = APIRouter(prefix="/products", tags=["products"])


def get_product_or_404(
    product_id: int = Path(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Product:
    """
    Reusable dependency that fetches a product by ID.
    Ensures the product exists AND belongs to the authenticated user.
    """
    product = (
        db.query(Product)
        .filter(Product.id == product_id, Product.owner_id == current_user.id)
        .first()
    )
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product


@router.post("/", response_model=ProductResponse, status_code=201)
def create_product(
    product: ProductCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Creates a new product. Name check is case-insensitive to prevent duplicates."""
    existing_product = (
        db.query(Product)
        .filter(
            func.lower(Product.name) == product.name.lower(),
            Product.owner_id == current_user.id,
        )
        .first()
    )
    if existing_product:
        raise HTTPException(status_code=400, detail="Product already registered")

    new_product = Product(
        name=product.name,
        description=product.description,
        price=product.price,
        stock=product.stock,
        owner_id=current_user.id,
    )
    db.add(new_product)
    db.commit()
    db.refresh(new_product)
    return new_product


@router.get("/", response_model=ProductListResponse)
def get_products(
    skip: int = 0,
    limit: int = 20,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Returns paginated products belonging to the authenticated user."""
    query = db.query(Product).filter(Product.owner_id == current_user.id)
    total = query.count()
    items = query.offset(skip).limit(limit).all()
    return {"total": total, "items": items}


@router.get("/{product_id}", response_model=ProductResponse)
def get_product(product: Product = Depends(get_product_or_404)):
    """Returns a single product by ID."""
    return product


@router.put("/{product_id}", response_model=ProductResponse)
def update_product(
    product_update: ProductUpdate,
    db: Session = Depends(get_db),
    db_product: Product = Depends(get_product_or_404),
):
    """Partially updates a product. Only sent fields are modified."""
    update_data = product_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_product, key, value)
    db.commit()
    db.refresh(db_product)
    return db_product


@router.delete("/{product_id}", status_code=204)
def delete_product(
    db: Session = Depends(get_db),
    db_product: Product = Depends(get_product_or_404),
):
    """Deletes a product permanently. Returns 204 No Content."""
    db.delete(db_product)
    db.commit()
    return Response(status_code=204)
