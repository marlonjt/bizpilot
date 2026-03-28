from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base
from app.models import user, client, product, sale
from app.routers import auth, clients, products, sales

# Create tables
Base.metadata.create_all(bind=engine)

# Initialize FastAPI app
app = FastAPI()

# CORS debe ir ANTES de los routers
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Root endpoint
@app.get("/")
def read_root():
    return {"message": "BizPilot API funcionando", "version": "0.1.0"}


# Routers the app
app.include_router(auth.router)
app.include_router(clients.router)
app.include_router(products.router)
app.include_router(sales.router)
