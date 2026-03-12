from fastapi import APIRouter, Depends, HTTPException, Response, Path
from sqlalchemy.orm import Session
from app.database import get_db
from app.core.security import get_current_user
from app.models.product import Product
from app.models.user import User
from app.schemas.product import ProductCreate, ProductUpdate, ProductResponse
from typing import List
from sqlalchemy import func


router = APIRouter(prefix="/products", tags=["products"])


def get_product_or_404(
    product_id: int = Path(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Product:
    db_product = db.query(Product).filter(
        Product.id == product_id, Product.owner_id == current_user.id
    ).first()
    if not db_product:
        raise HTTPException(status_code=404, detail="Product not found")
    return db_product


# POST   /products/
@router.post("/", response_model=ProductResponse, status_code=201)
def create_product(
    product: ProductCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    db_product = db.query(Product).filter(
        func.lower(Product.name) == product.name.lower(),
        Product.owner_id == current_user.id,
    ).first()
    if db_product:
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


# GET    /products/
@router.get("/", response_model=List[ProductResponse])
def get_products(
    db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
):
    return db.query(Product).filter(Product.owner_id == current_user.id).all()


# GET    /products/{product_id}
@router.get("/{product_id}", response_model=ProductResponse)
def get_client_id(
    product: Product = Depends(get_product_or_404),
):
    return product


# PUT    /products/{product_id}
@router.put("/{product_id}", response_model=ProductResponse)
def update_product(
    product_update: ProductUpdate,
    db: Session = Depends(get_db),
    db_product: Product = Depends(get_product_or_404),
):
    update_data = product_update.model_dump(exclude_unset=True)

    for key, value in update_data.items():
        setattr(db_product, key, value)

    db.commit()
    db.refresh(db_product)

    return db_product


# DELETE /products/{product_id}
@router.delete("/{product_id}", status_code=204)
def product_delete(
    db: Session = Depends(get_db),
    db_product: Product = Depends(get_product_or_404),
):
    db.delete(db_product)
    db.commit()

    return Response(status_code=204)
