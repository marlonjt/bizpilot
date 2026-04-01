# Use imagen de python
FROM python:3.12-slim

# Directorio de trabajo
WORKDIR /app

# Copiar archivos de requerimientos e instalarlos
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copiar el resto de la app
COPY . .
COPY start.sh .
RUN chmod +x start.sh
CMD ["./start.sh"]
