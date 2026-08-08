from fastapi import APIRouter, Depends, Header, status
from backend.schemas.user import (
    SignUpRequest, LoginRequest, ForgotPasswordRequest,
    RefreshTokenRequest, AuthTokenResponse, UserProfileSchema
)
from backend.services.auth_service import AuthService
from backend.services.user_service import UserService
from backend.core.dependencies import get_auth_service, get_user_service, get_current_user_uid

router = APIRouter(prefix="/auth", tags=["Supabase Authentication"])


@router.post("/signup", response_model=AuthTokenResponse, status_code=status.HTTP_201_CREATED)
async def signup_user(
    request: SignUpRequest,
    auth_service: AuthService = Depends(get_auth_service)
):
    """Signs up user in Supabase Auth and automatically creates Firestore profile."""
    return await auth_service.sign_up(request)


@router.post("/login", response_model=AuthTokenResponse)
async def login_user(
    request: LoginRequest,
    auth_service: AuthService = Depends(get_auth_service)
):
    """Authenticates user via Supabase Auth and returns JWT token payload."""
    return await auth_service.login(request)


@router.post("/logout", status_code=status.HTTP_200_OK)
async def logout_user(
    authorization: str = Header(None),
    auth_service: AuthService = Depends(get_auth_service)
):
    """Terminates active Supabase session."""
    token = authorization.split()[1] if authorization and len(authorization.split()) == 2 else ""
    await auth_service.logout(token)
    return {"message": "Successfully logged out session"}


@router.post("/forgot-password", status_code=status.HTTP_200_OK)
async def forgot_password(
    request: ForgotPasswordRequest,
    auth_service: AuthService = Depends(get_auth_service)
):
    """Dispatches password reset link via Supabase Auth."""
    await auth_service.forgot_password(request.email)
    return {"message": f"Password reset email sent to {request.email}"}


@router.post("/refresh", status_code=status.HTTP_200_OK)
async def refresh_token(
    request: RefreshTokenRequest,
    auth_service: AuthService = Depends(get_auth_service)
):
    """Exchanges refresh token for a new access token."""
    return await auth_service.refresh_session(request.refresh_token)


@router.get("/me", response_model=UserProfileSchema)
async def get_current_authenticated_user(
    user_uid: str = Depends(get_current_user_uid),
    user_service: UserService = Depends(get_user_service)
):
    """Fetches profile of the currently authenticated Supabase user."""
    return await user_service.get_profile_by_id(user_uid)
