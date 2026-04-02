from fastapi import APIRouter, Depends, HTTPException, Response, Path
from sqlalchemy.orm import Session

from app.database import get_db
from app.core.security import get_current_user
from app.models.sale import Sale
from app.models.user import User
from app.models.product import Product
from app.models.client import Client
from app.schemas.sale import SaleCreate, SaleUpdate, SaleResponse, SaleListResponse

router = APIRouter(prefix="/sales", tags=["sales"])


def get_sale_or_404(
    sale_id: int = Path(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Sale:
    sale = (
        db.query(Sale)
        .filter(Sale.id == sale_id, Sale.owner_id == current_user.id)
        .first()
    )
    if not sale:
        raise HTTPException(status_code=404, detail="Sale not found")
    return sale


def fetch_client(client_id: int, owner_id: int, db: Session) -> Client:
    client = (
        db.query(Client)
        .filter(Client.id == client_id, Client.owner_id == owner_id)
        .first()
    )
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
    return client


def fetch_product(product_id: int, owner_id: int, db: Session) -> Product:
    product = (
        db.query(Product)
        .filter(Product.id == product_id, Product.owner_id == owner_id)
        .first()
    )
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product


@router.post("/", response_model=SaleResponse, status_code=201)
def create_sale(
    sale: SaleCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    client = fetch_client(sale.client_id, current_user.id, db)
    product = fetch_product(sale.product_id, current_user.id, db)

    if product.stock < sale.quantity:
        raise HTTPException(status_code=400, detail="Insufficient stock")

    unit_price = product.price
    total = sale.quantity * unit_price
    product.stock -= sale.quantity

    new_sale = Sale(
        client_id=sale.client_id,
        product_id=sale.product_id,
        quantity=sale.quantity,
        unit_price=unit_price,
        total=total,
        notes=sale.notes,
        owner_id=current_user.id,
    )
    db.add(new_sale)
    db.commit()
    db.refresh(new_sale)
    return new_sale


@router.get("/", response_model=SaleListResponse)
def get_sales(
    skip: int = 0,
    limit: int = 20,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Returns paginated sales belonging to the authenticated user."""
    query = db.query(Sale).filter(Sale.owner_id == current_user.id)
    total = query.count()
    items = query.offset(skip).limit(limit).all()
    return {"total": total, "items": items}


@router.get("/{sale_id}", response_model=SaleResponse)
def get_sale(db_sale: Sale = Depends(get_sale_or_404)):
    return db_sale


@router.put("/{sale_id}", response_model=SaleResponse)
def update_sale(
    sale_update: SaleUpdate,
    db: Session = Depends(get_db),
    db_sale: Sale = Depends(get_sale_or_404),
):
    update_data = sale_update.model_dump(exclude_unset=True)

    if "quantity" in update_data:
        new_quantity = update_data["quantity"]
        difference = new_quantity - db_sale.quantity
        product = fetch_product(db_sale.product_id, db_sale.owner_id, db)

        if product.stock < difference:
            raise HTTPException(status_code=400, detail="Insufficient stock")

        product.stock -= difference
        db_sale.quantity = new_quantity
        db_sale.total = new_quantity * db_sale.unit_price

    if "notes" in update_data:
        db_sale.notes = update_data["notes"]

    db.commit()
    db.refresh(db_sale)
    return db_sale


@router.delete("/{sale_id}", status_code=204)
def delete_sale(
    db: Session = Depends(get_db),
    db_sale: Sale = Depends(get_sale_or_404),
):
    product = fetch_product(db_sale.product_id, db_sale.owner_id, db)
    product.stock += db_sale.quantity
    db.delete(db_sale)
    db.commit()
    return Response(status_code=204)
