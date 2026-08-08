import time
from typing import Dict, Tuple
from fastapi import Request, HTTPException, status
from starlette.middleware.base import BaseHTTPMiddleware

# Simple in-memory sliding window rate limiter (100 requests per minute per IP)
RATE_LIMIT_REQUESTS = 100
RATE_LIMIT_WINDOW_SECONDS = 60
_request_counts: Dict[str, Tuple[int, float]] = {}


class RateLimitMiddleware(BaseHTTPMiddleware):
    """Middleware enforcing sliding window rate limiting per IP address."""

    async def dispatch(self, request: Request, call_next):
        client_ip = request.client.host if request.client else "127.0.0.1"
        now = time.time()

        if client_ip in _request_counts:
            count, start_time = _request_counts[client_ip]
            if now - start_time < RATE_LIMIT_WINDOW_SECONDS:
                if count >= RATE_LIMIT_REQUESTS:
                    raise HTTPException(
                        status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                        detail="Rate limit exceeded. Too many requests."
                    )
                _request_counts[client_ip] = (count + 1, start_time)
            else:
                _request_counts[client_ip] = (1, now)
        else:
            _request_counts[client_ip] = (1, now)

        response = await call_next(request)
        return response
