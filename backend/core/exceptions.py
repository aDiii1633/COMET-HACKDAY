from fastapi import Request, status
from fastapi.responses import JSONResponse
import structlog

logger = structlog.get_logger()


class SafeSphereException(Exception):
    """Base domain exception for SafeSphere AI."""
    def __init__(self, message: str, status_code: int = status.HTTP_400_BAD_REQUEST, details: dict = None):
        self.message = message
        self.status_code = status_code
        self.details = details or {}
        super().__init__(self.message)


class AuthenticationException(SafeSphereException):
    def __init__(self, message: str = "Authentication failed"):
        super().__init__(message=message, status_code=status.HTTP_401_UNAUTHORIZED)


class ForbiddenException(SafeSphereException):
    def __init__(self, message: str = "Permission denied"):
        super().__init__(message=message, status_code=status.HTTP_403_FORBIDDEN)


class ResourceNotFoundException(SafeSphereException):
    def __init__(self, message: str = "Resource not found"):
        super().__init__(message=message, status_code=status.HTTP_404_NOT_FOUND)


class RiskEngineException(SafeSphereException):
    def __init__(self, message: str = "Risk Engine calculation error"):
        super().__init__(message=message, status_code=status.HTTP_500_INTERNAL_SERVER_ERROR)


async def global_exception_handler(request: Request, exc: Exception):
    """Global exception handler converting uncaught exceptions to structured JSON response."""
    if isinstance(exc, SafeSphereException):
        logger.warning(
            "domain_exception_raised",
            path=request.url.path,
            status_code=exc.status_code,
            message=exc.message,
            details=exc.details
        )
        return JSONResponse(
            status_code=exc.status_code,
            content={
                "success": False,
                "error": {
                    "message": exc.message,
                    "details": exc.details,
                    "type": exc.__class__.__name__
                }
            }
        )

    logger.error(
        "uncaught_system_exception",
        path=request.url.path,
        error=str(exc),
        exc_info=True
    )
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "success": False,
            "error": {
                "message": "Internal System Exception",
                "type": "InternalServerError"
            }
        }
    )
