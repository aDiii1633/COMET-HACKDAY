from datetime import datetime
from typing import Dict, Any, Optional
from backend.schemas.user import SignUpRequest, LoginRequest, AuthTokenResponse, UserProfileSchema
from backend.services.supabase_service import SupabaseService
from backend.repositories.user_repository import UserRepository
from backend.core.exceptions import AuthenticationException, SafeSphereException
from backend.core.logging import logger


class AuthService:
    """AuthService handling Supabase Authentication & Firestore Profile Synchronization."""

    def __init__(self, supabase_service: SupabaseService = None, user_repo: UserRepository = None):
        self.supabase_service = supabase_service or SupabaseService()
        self.user_repo = user_repo or UserRepository()

    async def sign_up(self, request: SignUpRequest) -> AuthTokenResponse:
        """Signs up user in Supabase Auth and creates corresponding Firestore profile."""
        # 1. Supabase Auth Signup
        supabase_res = await self.supabase_service.sign_up(
            email=request.email,
            password=request.password,
            metadata={"name": request.name, "phone": request.phone}
        )

        user_id = supabase_res["id"]

        # 2. Check if Firestore profile exists; if not, sync & create
        existing_profile = await self.user_repo.get_by_id(user_id)
        if not existing_profile:
            profile_data = {
                "id": user_id,
                "name": request.name,
                "email": request.email,
                "phone": request.phone,
                "photo": None,
                "gender": request.gender or "unspecified",
                "guardianCircle": [],
                "preferences": {
                    "safety_threshold": 60.0,
                    "haptic_warnings": True,
                    "auto_alert_guardians": True,
                    "audio_prompts": True
                },
                "createdAt": datetime.utcnow().isoformat(),
                "updatedAt": datetime.utcnow().isoformat()
            }
            await self.user_repo.create(user_id, profile_data)
        else:
            profile_data = existing_profile

        session = supabase_res.get("session") or {}
        access_token = session.get("access_token") or f"sb_access_token_{user_id}"
        refresh_token = session.get("refresh_token") or f"sb_refresh_token_{user_id}"

        logger.info("user_signup_and_profile_synced", user_id=user_id, email=request.email)

        return AuthTokenResponse(
            access_token=access_token,
            refresh_token=refresh_token,
            token_type="bearer",
            expires_in=3600,
            user=UserProfileSchema(**profile_data)
        )

    async def login(self, request: LoginRequest) -> AuthTokenResponse:
        """Authenticates user via Supabase Auth and fetches synced Firestore profile."""
        supabase_res = await self.supabase_service.sign_in_with_password(
            email=request.email,
            password=request.password
        )

        user_id = supabase_res["id"]
        profile_data = await self.user_repo.get_by_id(user_id)

        if not profile_data:
            # Fallback sync if profile missing
            profile_data = {
                "id": user_id,
                "name": request.email.split("@")[0].capitalize(),
                "email": request.email,
                "phone": None,
                "photo": None,
                "gender": "unspecified",
                "guardianCircle": [],
                "preferences": {
                    "safety_threshold": 60.0,
                    "haptic_warnings": True,
                    "auto_alert_guardians": True,
                    "audio_prompts": True
                },
                "createdAt": datetime.utcnow().isoformat(),
                "updatedAt": datetime.utcnow().isoformat()
            }
            await self.user_repo.create(user_id, profile_data)

        session = supabase_res.get("session") or {}
        access_token = session.get("access_token") or f"sb_access_token_{user_id}"
        refresh_token = session.get("refresh_token") or f"sb_refresh_token_{user_id}"

        logger.info("user_login_authenticated", user_id=user_id, email=request.email)

        return AuthTokenResponse(
            access_token=access_token,
            refresh_token=refresh_token,
            token_type="bearer",
            expires_in=session.get("expires_in", 3600),
            user=UserProfileSchema(**profile_data)
        )

    async def logout(self, access_token: str) -> bool:
        """Signs out session via Supabase Service."""
        return await self.supabase_service.sign_out(access_token)

    async def forgot_password(self, email: str) -> bool:
        """Triggers password reset link via Supabase Service."""
        return await self.supabase_service.reset_password_for_email(email)

    async def refresh_session(self, refresh_token: str) -> Dict[str, Any]:
        """Exchanges refresh token for new access token."""
        return await self.supabase_service.refresh_session(refresh_token)
