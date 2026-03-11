from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.models.client import Client
from app.schemas.client import ClientCreate, ClientUpdate, ClientResponse
from app.core.security import get_current_user
from app.models.user import User

# PREFIJO GLOBAL: Todas las rutas aquí automáticamente empezarán con "/clients"
router = APIRouter(prefix="/clients", tags=["clients"])


# ==========================================
# 🛠️ FUNCIÓN HELPER (REUTILIZABLE)
# ==========================================
def get_client_or_404(
    client_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Client:
    """
    Busca un cliente asegurando que exista y que pertenezca al usuario logueado.
    Se usa como inyección de dependencias en GET, PUT y DELETE para no repetir código.
    """
    db_client = (
        db.query(Client)
        .filter(Client.id == client_id, Client.owner_id == current_user.id)
        .first()
    )
    if not db_client:
        # Si no existe o es de otro usuario, cortamos la petición aquí mismo
        raise HTTPException(status_code=404, detail="Client not found")
    return db_client


# ==========================================
# 🟢 CREATE (POST) - Crear nuevo cliente
# ==========================================
@router.post("/", response_model=ClientResponse, status_code=201)
def create_client(
    client: ClientCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Por qué: Evitamos duplicidad de correos en la base de datos para mantener integridad.
    db_client = db.query(Client).filter(Client.email == client.email).first()
    if db_client:
        raise HTTPException(status_code=400, detail="Email already registered")

    # Por qué: Transformamos el Schema (ClientCreate) en un Modelo (Client)
    # y le asignamos el owner_id para la lógica de multi-usuario.
    new_client = Client(
        full_name=client.full_name,
        email=client.email,
        phone=client.phone,
        notas=client.notas,
        owner_id=current_user.id,
    )

    db.add(new_client)  # Lo preparamos
    db.commit()  # Lo guardamos en disco
    db.refresh(new_client)  # Obtenemos su nuevo ID autogenerado

    return new_client


# ==========================================
# 🔵 READ ALL (GET) - Listar mis clientes
# ==========================================
@router.get("/", response_model=List[ClientResponse])
def get_clients(
    db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
):
    # Por qué: El .filter() garantiza que el usuario solo vea SU lista de clientes.
    return db.query(Client).filter(Client.owner_id == current_user.id).all()


# ==========================================
# 🔵 READ ONE (GET) - Ver un cliente específico
# ==========================================
@router.get("/{client_id}", response_model=ClientResponse)
def get_client_id(
    # Magia de FastAPI: Inyectamos nuestra función Helper.
    # Ella se encarga de buscar y lanzar el 404 si es necesario.
    client: Client = Depends(get_client_or_404),
):
    # Si el código llega aquí, el cliente existe y está validado.
    return client


# ==========================================
# 🟠 UPDATE (PUT) - Actualizar un cliente
# ==========================================
@router.put("/{client_id}", response_model=ClientResponse)
def update_client(
    client_update: ClientUpdate,
    db: Session = Depends(get_db),
    # Reutilizamos el Helper para obtener el cliente de la BD
    db_client: Client = Depends(get_client_or_404),
):
    # Por qué exclude_unset=True: Pydantic ignora los campos que el usuario no envió
    # en el JSON, evitando sobreescribir datos existentes con "None".
    update_data = client_update.model_dump(exclude_unset=True)

    # setattr para actualizar dinámicamente solo los campos que vinieron en update_data
    for key, value in update_data.items():
        setattr(db_client, key, value)

    db.commit()
    db.refresh(db_client)

    return db_client


# ==========================================
# 🔴 DELETE (DELETE) - Eliminar un cliente
# ==========================================
@router.delete("/{client_id}", response_model=ClientResponse)
def client_delete(
    db: Session = Depends(get_db),
    # Reutilizamos el Helper otra vez
    db_client: Client = Depends(get_client_or_404),
):
    db.delete(db_client)
    db.commit()

    return db_client
