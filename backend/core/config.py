import os
from typing import List, Optional, Dict, Any
from pydantic_settings import BaseSettings, SettingsConfigDict
from structlog import get_logger

logger = get_logger()


class Settings(BaseSettings):
    PROJECT_NAME: str = "SafeSphere AI Enterprise Backend"
    VERSION: str = "1.1.0"
    API_V1_STR: str = "/api/v1"
    ENVIRONMENT: str = "development"
    DEBUG: bool = True
    PORT: int = 8000
    HOST: str = "0.0.0.0"

    # Security & JWT Tokens
    JWT_SECRET: str = "safesphere_super_secret_jwt_key_change_in_production"
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRE_MINUTES: int = 1440 # 24 Hours

    # Supabase Auth Configuration
    SUPABASE_URL: str = "https://safesphere-demo.supabase.co"
    SUPABASE_ANON_KEY: str = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.demo_anon_key"
    SUPABASE_SERVICE_ROLE_KEY: Optional[str] = None
    SUPABASE_JWT_SECRET: str = "safesphere_supabase_jwt_secret_demo"

    # Firebase & FCM Config (Database & Push Notifications)
    FIREBASE_PROJECT_ID: str = "safesphere-ai-demo"
    FIREBASE_CLIENT_EMAIL: Optional[str] = None
    FIREBASE_PRIVATE_KEY: Optional[str] = None
    FIREBASE_DATABASE_URL: Optional[str] = None
    FCM_SERVER_KEY: Optional[str] = None

    # External AI, Maps & Places APIs
    OPENAI_API_KEY: Optional[str] = None
    GEMINI_API_KEY: Optional[str] = None
    GOOGLE_MAPS_API_KEY: Optional[str] = None
    GOOGLE_PLACES_API_KEY: Optional[str] = None
    DATA_GOV_IN_API_KEY: Optional[str] = None

    # CORS
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "https://safesphere.ai"
    ]

    # Risk Engine Thresholds
    RISK_THRESHOLD_WARNING: float = 30.0
    RISK_THRESHOLD_DANGER: float = 60.0
    RISK_THRESHOLD_CRITICAL: float = 75.0
    GUARDIAN_AUTO_ALERT_TIMEOUT_SECONDS: int = 15

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore"
    )

    def validate_required_environment(self) -> Dict[str, str]:
        """Validates all 13 required environment variables at backend startup."""
        required_keys = [
            ("SUPABASE_URL", self.SUPABASE_URL),
            ("SUPABASE_ANON_KEY", self.SUPABASE_ANON_KEY),
            ("SUPABASE_SERVICE_ROLE_KEY", self.SUPABASE_SERVICE_ROLE_KEY),
            ("GOOGLE_MAPS_API_KEY", self.GOOGLE_MAPS_API_KEY),
            ("GOOGLE_PLACES_API_KEY", self.GOOGLE_PLACES_API_KEY),
            ("OPENAI_API_KEY", self.OPENAI_API_KEY),
            ("GEMINI_API_KEY", self.GEMINI_API_KEY),
            ("FIREBASE_PROJECT_ID", self.FIREBASE_PROJECT_ID),
            ("FIREBASE_PRIVATE_KEY", self.FIREBASE_PRIVATE_KEY),
            ("FIREBASE_CLIENT_EMAIL", self.FIREBASE_CLIENT_EMAIL),
            ("FCM_SERVER_KEY", self.FCM_SERVER_KEY),
            ("JWT_SECRET", self.JWT_SECRET),
            ("JWT_ALGORITHM", self.JWT_ALGORITHM),
            ("JWT_EXPIRE_MINUTES", str(self.JWT_EXPIRE_MINUTES)),
        ]

        missing_keys = [name for name, val in required_keys if not val or "demo" in str(val).lower()]

        if missing_keys:
            logger.warn(
                "environment_variables_running_in_demo_mode",
                missing_or_demo_keys=missing_keys,
                message="Backend is operating with deterministic mock fallbacks for unconfigured API keys."
            )
        else:
            logger.info("all_environment_variables_validated_successfully")

        return {"missing_or_demo": missing_keys}


settings = Settings()
