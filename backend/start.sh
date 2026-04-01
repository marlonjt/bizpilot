#!/bin/bash
# Ejecuta migraciones automáticamente al iniciar
alembic upgrade head
# Luego inicia el servidor
uvicorn app.main:app --host 0.0.0.0 --port 8000
