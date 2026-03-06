from fastapi import FastAPI

app = FastAPI()


@app.get("/")
def read_root():
    return {"message": "BizPilot API funcionando", "version": "0.1.0"}
