from fastapi import FastAPI
from app.database import engine, Base
from app.models import user

# Create tables
Base.metadata.create_all(bind=engine)

# Initialize FastAPI app
app = FastAPI()

# Root endpoint
@app.get("/")
def read_root():
    return {"message": "BizPilot API funcionando", "version": "0.1.0"}
