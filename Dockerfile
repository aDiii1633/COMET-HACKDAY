# Production Dockerfile for SafeSphere AI Backend (built from root context)
FROM python:3.11-slim as builder

WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    gcc \
    && rm -rf /var/lib/apt/lists/*

COPY backend/requirements.txt .
RUN pip install --no-cache-dir --prefix=/install -r requirements.txt

# Final Runner
FROM python:3.11-slim

WORKDIR /app

COPY --from=builder /install /usr/local
# Copy the actual backend directory to preserve backend.* namespace
COPY backend/ ./backend/

ENV PYTHONPATH=/app
ENV PORT=8080
EXPOSE 8080

CMD ["python", "-m", "uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8080"]
