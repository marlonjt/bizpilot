from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.models.client import Client
from app.schemas.client import ClientCreate, ClientUpdate, ClientResponse
from app.core.security import get_current_user
from app.models.user import User

# All routes in this router will be prefixed with /clients
router = APIRouter(prefix="/clients", tags=["clients"])


def get_client_or_404(
    client_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Client:
    """
    Reusable dependency that fetches a client by ID.
    Ensures the client exists AND belongs to the authenticated user.
    Raises 404 if not found or if it belongs to another user (security by design).
    Used in GET one, PUT, and DELETE to avoid repeating this logic.
    """
    client = (
        db.query(Client)
        .filter(Client.id == client_id, Client.owner_id == current_user.id)
        .first()
    )
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
    return client


@router.post("/", response_model=ClientResponse, status_code=201)
def create_client(
    client: ClientCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Creates a new client for the authenticated user.
    Returns 400 if the email is already registered in the system.
    """
    existing_client = db.query(Client).filter(Client.email == client.email).first()
    if existing_client:
        raise HTTPException(status_code=400, detail="Email already registered")

    new_client = Client(
        full_name=client.full_name,
        email=client.email,
        phone=client.phone,
        notes=client.notes,
        owner_id=current_user.id,  # Links the client to the authenticated user
    )

    db.add(new_client)
    db.commit()
    db.refresh(new_client)  # Fetches the auto-generated ID from the DB

    return new_client


@router.get("/", response_model=List[ClientResponse])
def get_clients(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Returns all clients belonging to the authenticated user."""
    return db.query(Client).filter(Client.owner_id == current_user.id).all()


@router.get("/{client_id}", response_model=ClientResponse)
def get_client(
    client: Client = Depends(get_client_or_404),
):
    """Returns a single client by ID. Ownership is validated by the dependency."""
    return client


@router.put("/{client_id}", response_model=ClientResponse)
def update_client(
    client_update: ClientUpdate,
    db: Session = Depends(get_db),
    db_client: Client = Depends(get_client_or_404),
):
    """
    Partially updates a client. Only the fields sent in the request are modified.
    exclude_unset=True prevents overwriting existing data with None for missing fields.
    """
    update_data = client_update.model_dump(exclude_unset=True)

    for key, value in update_data.items():
        setattr(db_client, key, value)

    db.commit()
    db.refresh(db_client)

    return db_client


@router.delete("/{client_id}", response_model=ClientResponse)
def delete_client(
    db: Session = Depends(get_db),
    db_client: Client = Depends(get_client_or_404),
):
    """
    Deletes a client permanently.
    Returns the deleted client data so the frontend can confirm what was removed.
    """
    db.delete(db_client)
    db.commit()

    return db_client
