from fastapi import APIRouter, Depends, HTTPException, Response, Path
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List

from app.database import get_db
from app.core.security import get_current_user
from app.models.product import Product
from app.models.user import User
from app.schemas.product import ProductCreate, ProductUpdate, ProductResponse

# All routes in this router will be prefixed with /products
router = APIRouter(prefix="/products", tags=["products"])


def get_product_or_404(
    product_id: int = Path(...),  # Path(...) tells FastAPI to extract this from the URL
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Product:
    """
    Reusable dependency that fetches a product by ID.
    Ensures the product exists AND belongs to the authenticated user.
    Raises 404 if not found or if it belongs to another user (security by design).
    Used in GET one, PUT, and DELETE to avoid repeating this logic.
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
    """
    Creates a new product for the authenticated user.
    Name check is case-insensitive (func.lower) to prevent duplicates like
    'Pepsi' and 'pepsi' being treated as different products.
    """
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
        owner_id=current_user.id,  # Links the product to the authenticated user
    )

    db.add(new_product)
    db.commit()
    db.refresh(new_product)  # Fetches the auto-generated ID from the DB

    return new_product


@router.get("/", response_model=List[ProductResponse])
def get_products(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Returns all products belonging to the authenticated user."""
    return db.query(Product).filter(Product.owner_id == current_user.id).all()


@router.get("/{product_id}", response_model=ProductResponse)
def get_product(
    product: Product = Depends(get_product_or_404),
):
    """Returns a single product by ID. Ownership is validated by the dependency."""
    return product


@router.put("/{product_id}", response_model=ProductResponse)
def update_product(
    product_update: ProductUpdate,
    db: Session = Depends(get_db),
    db_product: Product = Depends(get_product_or_404),
):
    """
    Partially updates a product. Only the fields sent in the request are modified.
    exclude_unset=True prevents overwriting existing data with None for missing fields.
    """
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
    """
    Deletes a product permanently.
    Returns 204 No Content — the standard HTTP response for successful deletions.
    The frontend handles the UI update locally without needing response data.
    """
    db.delete(db_product)
    db.commit()

    return Response(status_code=204)
