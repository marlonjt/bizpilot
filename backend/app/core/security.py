import os
from passlib.context import CryptContext
from jose import jwt, JWTError
from datetime import datetime, timedelta, timezone
from dotenv import load_dotenv
from fastapi import HTTPException, status, Depends
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User

# Importante: Asegúrate de importar tu modelo de Usuario para buscarlo en la BD
# from app.models import User

load_dotenv()

# Configuración de seguridad para hashing de contraseñas
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# --- FUNCIONES DE CONTRASEÑA ---


def hash_password(password: str) -> str:
    """Transforma una contraseña plana en un hash seguro para guardar en BD."""
    return pwd_context.hash(password)


def verify_password(plain: str, hashed: str) -> bool:
    """Compara una contraseña escrita por el usuario con el hash de la BD."""
    return pwd_context.verify(plain, hashed)


# --- CONFIGURACIÓN JWT ---

SECRET_KEY = os.getenv("SECRET_KEY", "supersecret")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 30))


def create_access_token(data: dict) -> str:
    """Genera un token firmado que expira en el tiempo configurado."""
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def decode_access_token(token: str) -> dict:
    """Verifica si el token es válido y devuelve su contenido (payload)."""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        # Si el token falló, lanzamos el error 401 de una vez
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido o expirado",
            headers={"WWW-Authenticate": "Bearer"},
        )


# --- PROTECCIÓN DE RUTAS ---

# Define que para entrar a ciertas rutas, el cliente debe enviar un Token en el header
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/token")


def get_current_user(
    token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)
):
    payload = decode_access_token(token)
    email: str = payload.get("sub")
    if email is None:
        raise HTTPException(status_code=401, detail="Token no contiene identidad")

    db_user = db.query(User).filter(User.email == email).first()

    if db_user is None:
        raise HTTPException(status_code=401, detail="Usuario no encontrado")

    return db_user
