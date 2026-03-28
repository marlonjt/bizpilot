from fastapi import APIRouter, Depends, HTTPException, Response, Path
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.core.security import get_current_user
from app.models.sale import Sale
from app.models.user import User
from app.models.product import Product
from app.models.client import Client
from app.schemas.sale import SaleCreate, SaleUpdate, SaleResponse

router = APIRouter(prefix="/sales", tags=["sales"])


# HELPER — Reusable dependency


def get_sale_or_404(
    sale_id: int = Path(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Sale:
    """
    Fetches a sale by ID and validates ownership.
    Used as a dependency in GET one, PUT, and DELETE.
    Raises 404 if the sale doesn't exist or belongs to another user.
    """
    sale = (
        db.query(Sale)
        .filter(Sale.id == sale_id, Sale.owner_id == current_user.id)
        .first()
    )
    if not sale:
        raise HTTPException(status_code=404, detail="Sale not found")
    return sale


# INTERNAL HELPERS — Fetch related records


def fetch_client(client_id: int, owner_id: int, db: Session) -> Client:
    """
    Fetches a client by ID and validates ownership.
    Used internally in create_sale — ID comes from the request body, not the URL.
    Raises 404 if the client doesn't exist or belongs to another user.
    """
    client = (
        db.query(Client)
        .filter(Client.id == client_id, Client.owner_id == owner_id)
        .first()
    )
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
    return client


def fetch_product(product_id: int, owner_id: int, db: Session) -> Product:
    """
    Fetches a product by ID and validates ownership.
    Used internally in create_sale and update_sale — ID comes from the request body or sale record.
    Raises 404 if the product doesn't exist or belongs to another user.
    """
    product = (
        db.query(Product)
        .filter(Product.id == product_id, Product.owner_id == owner_id)
        .first()
    )
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product


# CREATE — Register a new sale


@router.post("/", response_model=SaleResponse, status_code=201)
def create_sale(
    sale: SaleCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Creates a new sale linking a client and a product.

    Business logic:
    - unit_price is taken from the product at the moment of sale (price freeze).
        This ensures historical accuracy — changing the product price later
        will NOT affect past sales.
    - total is calculated server-side: quantity * unit_price.
    - Product stock is reduced by the quantity sold.
    - If stock is insufficient, returns 400 before any changes are made.
    """
    client = fetch_client(sale.client_id, current_user.id, db)
    product = fetch_product(sale.product_id, current_user.id, db)

    # Validate stock before making any changes
    if product.stock < sale.quantity:
        raise HTTPException(status_code=400, detail="Insufficient stock")

    # Freeze the price at the moment of sale
    unit_price = product.price
    total = sale.quantity * unit_price

    # Reduce product stock
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


# READ ALL — List all sales


@router.get("/", response_model=List[SaleResponse])
def get_sales(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Returns all sales belonging to the authenticated user."""
    return db.query(Sale).filter(Sale.owner_id == current_user.id).all()


# READ ONE — Get a single sale


@router.get("/{sale_id}", response_model=SaleResponse)
def get_sale(db_sale: Sale = Depends(get_sale_or_404)):
    """Returns a single sale by ID. Ownership is validated by the dependency."""
    return db_sale


# UPDATE — Edit quantity or notes


@router.put("/{sale_id}", response_model=SaleResponse)
def update_sale(
    sale_update: SaleUpdate,
    db: Session = Depends(get_db),
    db_sale: Sale = Depends(get_sale_or_404),
):
    """
    Partially updates a sale (quantity and/or notes only).

    Business logic for quantity change:
    - Calculates the difference between new and original quantity.
    - Adjusts product stock accordingly:
        new > original → stock decreases (more units sold)
        new < original → stock increases (units returned)
        new == original → no stock change
    - Recalculates total based on the new quantity.
    - Returns 400 if the stock adjustment would result in negative stock.

    Note: client_id and product_id cannot be changed after a sale is created.
    To correct those, delete the sale and create a new one.
    """
    update_data = sale_update.model_dump(exclude_unset=True)

    # Handle quantity change separately — affects stock and total
    if "quantity" in update_data:
        new_quantity = update_data["quantity"]
        original_quantity = db_sale.quantity
        difference = new_quantity - original_quantity

        # Fetch the related product to adjust its stock
        product = fetch_product(db_sale.product_id, db_sale.owner_id, db)

        # Check if there is enough stock for the increase
        if product.stock < difference:
            raise HTTPException(status_code=400, detail="Insufficient stock")

        # Adjust stock: positive difference reduces stock, negative returns it
        product.stock -= difference

        # Update quantity and recalculate total based on the frozen unit_price
        db_sale.quantity = new_quantity
        db_sale.total = new_quantity * db_sale.unit_price

    # Apply remaining fields (e.g. notes)
    if "notes" in update_data:
        db_sale.notes = update_data["notes"]

    db.commit()
    db.refresh(db_sale)
    return db_sale


# DELETE — Cancel a sale


@router.delete("/{sale_id}", status_code=204)
def delete_sale(
    db: Session = Depends(get_db),
    db_sale: Sale = Depends(get_sale_or_404),
):
    """
    Cancels and permanently deletes a sale.

    Business logic:
    - Before deleting, the sold quantity is returned to the product stock.
    This keeps inventory accurate after a cancellation.
    - Returns 204 No Content — nothing to return after deletion.
    """
    # Return the sold units back to product stock
    product = fetch_product(db_sale.product_id, db_sale.owner_id, db)
    product.stock += db_sale.quantity

    db.delete(db_sale)
    db.commit()

    return Response(status_code=204)
