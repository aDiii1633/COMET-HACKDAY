import os
os.environ["PROTOCOL_BUFFERS_PYTHON_IMPLEMENTATION"] = "python"
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.core.config import settings
from backend.core.logging import setup_logging, logger
from backend.core.exceptions import global_exception_handler
from backend.middleware.request_id import RequestIdMiddleware
from backend.middleware.security_headers import SecurityHeadersMiddleware
from backend.middleware.rate_limit import RateLimitMiddleware
from backend.api.v1.router import api_v1_router
from backend.firebase.firebase_app import initialize_firebase

# Setup Structured JSON Logging
setup_logging()

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="SafeSphere AI Enterprise Backend — Predictive Spatial Threat Intelligence, Google Places Emergency Safe Havens, AI SafeRoute Navigation, OpenAI Natural Language XAI, and Context-Aware Guardian Circle Emergency Engine.",
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Register Custom Enterprise Middlewares
app.add_middleware(RequestIdMiddleware)
app.add_middleware(SecurityHeadersMiddleware)
app.add_middleware(RateLimitMiddleware)

# CORS Middleware Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global Exception Handlers
app.add_exception_handler(Exception, global_exception_handler)

# Include API v1 Router
app.include_router(api_v1_router, prefix=settings.API_V1_STR)


@app.on_event("startup")
async def startup_event():
    logger.info("safesphere_enterprise_backend_starting", version=settings.VERSION, env=settings.ENVIRONMENT)
    try:
        settings.validate_required_environment()
        initialize_firebase()
    except Exception as e:
        logger.warn("startup_init_warn", error=str(e))
    
    # Background async initialization so port binding is instant
    asyncio.create_task(async_background_init())

async def async_background_init():
    try:
        from backend.services.crime_data_service import CrimeDataService
        crime_service = CrimeDataService()
        await crime_service.fetch_government_crime_data()
    except Exception as e:
        logger.warn("crime_service_async_init_warn", error=str(e))


@app.on_event("shutdown")
async def shutdown_event():
    logger.info("safesphere_enterprise_backend_shutting_down")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host=settings.HOST, port=settings.PORT, reload=settings.DEBUG)
