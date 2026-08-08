from fastapi import APIRouter, Depends
from backend.schemas.user import UserProfileSchema, ProfileUpdateRequest
from backend.services.user_service import UserService
from backend.core.dependencies import get_user_service, get_current_user_uid

router = APIRouter(prefix="/profile", tags=["User Profile"])


@router.get("", response_model=UserProfileSchema)
async def get_profile(
    user_uid: str = Depends(get_current_user_uid),
    user_service: UserService = Depends(get_user_service)
):
    """Fetches user profile document from Firestore matching Supabase User ID."""
    return await user_service.get_profile_by_id(user_uid)


@router.put("", response_model=UserProfileSchema)
async def update_profile(
    request: ProfileUpdateRequest,
    user_uid: str = Depends(get_current_user_uid),
    user_service: UserService = Depends(get_user_service)
):
    """Updates profile fields in Firestore (name, phone, photo, gender, preferences)."""
    return await user_service.update_profile(user_uid, request)
