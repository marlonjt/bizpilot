# Use imagen de python
FROM python:3.12-slim

# Directorio de trabajo
WORKDIR /app

# Copiar archivos de requerimientos e instalarlos
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copiar el resto de la app
COPY . .

# Exponer el puerto de FastAPI
EXPOSE 8000

# Comando para iniciar la app con uvicorn
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
