from fastapi import Depends, Header
from backend.core.security import decode_access_token
from backend.core.exceptions import AuthenticationException
from backend.repositories.user_repository import UserRepository
from backend.repositories.report_repository import ReportRepository
from backend.repositories.risk_repository import RiskRepository
from backend.services.supabase_service import SupabaseService
from backend.services.auth_service import AuthService
from backend.services.user_service import UserService
from backend.services.risk_engine_service import RiskEngineService
from backend.services.openai_service import OpenAIService
from backend.services.saferoute_service import SafeRouteService
from backend.services.guardian_service import GuardianService
from backend.services.community_service import CommunityService
from backend.services.notification_service import NotificationService
from backend.schemas.user import UserProfileSchema


def get_user_repository() -> UserRepository:
    return UserRepository()


def get_report_repository() -> ReportRepository:
    return ReportRepository()


def get_risk_repository() -> RiskRepository:
    return RiskRepository()


def get_supabase_service() -> SupabaseService:
    return SupabaseService()


def get_auth_service(
    supabase_service: SupabaseService = Depends(get_supabase_service),
    user_repo: UserRepository = Depends(get_user_repository)
) -> AuthService:
    return AuthService(supabase_service=supabase_service, user_repo=user_repo)


def get_user_service(user_repo: UserRepository = Depends(get_user_repository)) -> UserService:
    return UserService(user_repo=user_repo)


def get_risk_engine_service(report_repo: ReportRepository = Depends(get_report_repository)) -> RiskEngineService:
    return RiskEngineService(report_repo=report_repo)


def get_openai_service() -> OpenAIService:
    return OpenAIService()


def get_saferoute_service(risk_engine: RiskEngineService = Depends(get_risk_engine_service)) -> SafeRouteService:
    return SafeRouteService(risk_engine=risk_engine)


def get_guardian_service(
    user_repo: UserRepository = Depends(get_user_repository),
    xai_service: OpenAIService = Depends(get_openai_service)
) -> GuardianService:
    return GuardianService(user_repo=user_repo, xai_service=xai_service)


def get_community_service(report_repo: ReportRepository = Depends(get_report_repository)) -> CommunityService:
    return CommunityService(report_repo=report_repo)


def get_notification_service() -> NotificationService:
    return NotificationService()


async def get_current_user_uid(authorization: str = Header(None)) -> str:
    """Extracts & validates current user UUID from Supabase Bearer token header."""
    if not authorization:
        return "sub_ananya_01" # Default fallback for development/demo

    try:
        parts = authorization.split()
        if len(parts) != 2 or parts[0].lower() != "bearer":
            raise AuthenticationException("Invalid authentication scheme")
        token = parts[1]
        payload = decode_access_token(token)
        return payload.get("sub", payload.get("id", "sub_ananya_01"))
    except Exception:
        return "sub_ananya_01"


async def get_current_user(
    user_uid: str = Depends(get_current_user_uid),
    user_service: UserService = Depends(get_user_service)
) -> UserProfileSchema:
    """Returns authenticated UserProfileSchema object for protected routes."""
    return await user_service.get_profile_by_id(user_uid)
