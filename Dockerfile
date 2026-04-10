FROM python:3.11-slim

WORKDIR /app

# Install system dependencies required by easyocr, torch, and Pillow
RUN apt-get update && apt-get install -y --no-install-recommends \
    libgl1 \
    libglib2.0-0 \
    libgomp1 \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY api_bridge.py .
COPY edumit/ edumit/

# Expose the API port
EXPOSE 8000

# CORS_ORIGINS can be overridden at runtime, e.g.:
#   docker run -e CORS_ORIGINS="https://yourfrontend.com" ...
ENV CORS_ORIGINS="http://localhost:3000"

CMD ["uvicorn", "api_bridge:app", "--host", "0.0.0.0", "--port", "8000"]
