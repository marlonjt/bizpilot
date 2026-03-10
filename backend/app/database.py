# database.py
import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

# Cargar variables de entorno desde el archivo .env
load_dotenv()

# Obtener la URL de la base de datos desde las variables de entorno
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./dev.db")

# Crear el motor de la base de datos
engine = create_engine(
    DATABASE_URL,
    connect_args=(
        {"check_same_thread": False} if DATABASE_URL.startswith("sqlite:///") else {}
    ),  #  connect_args Necesario solo para SQLite el if verifica sqlite y si no es no agrega argumentos
)

# Crear una fábrica de sesiones locales
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Crear una clase base para los modelos declarativos
Base = declarative_base()


# Dependencia para obtener la sesión de la db
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
