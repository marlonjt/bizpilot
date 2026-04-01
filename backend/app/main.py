import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base
from app.models import user, client, product, sale
from app.routers import auth, clients, products, sales

Base.metadata.create_all(bind=engine)

app = FastAPI()

# Read allowed origins from environment variable
# In production: "https://bizpilot.vercel.app"
# In development: "http://localhost:5173,http://127.0.0.1:5173"
origins = os.getenv(
    "ALLOWED_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173"
).split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def read_root():
    return {"message": "BizPilot API running", "version": "0.1.0"}


app.include_router(auth.router)
app.include_router(clients.router)
app.include_router(products.router)
app.include_router(sales.router)
