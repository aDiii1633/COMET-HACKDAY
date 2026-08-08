# Production Multi-Stage Dockerfile for SafeSphere AI Backend

FROM python:3.11-slim as builder

WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    gcc \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir --prefix=/install -r requirements.txt

# Final Production Runner
FROM python:3.11-slim

WORKDIR /app

COPY --from=builder /install /usr/local
COPY . ./backend/

ENV PYTHONPATH=/app
ENV PORT=8080
EXPOSE $PORT

CMD ["sh", "-c", "uvicorn backend.main:app --host 0.0.0.0 --port $PORT"]
