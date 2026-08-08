from typing import List
from fastapi import APIRouter, Depends
from backend.schemas.user import UserProfileSchema
from backend.services.user_service import UserService
from backend.core.dependencies import get_user_service

router = APIRouter(prefix="/users", tags=["Users Management"])


@router.get("", response_model=List[UserProfileSchema])
async def list_users(
    limit: int = 50,
    user_service: UserService = Depends(get_user_service)
):
    """Lists registered user profiles from Firestore."""
    return await user_service.list_users(limit)


@router.get("/{user_id}", response_model=UserProfileSchema)
async def get_user_by_id(
    user_id: str,
    user_service: UserService = Depends(get_user_service)
):
    """Fetches single user profile by Supabase User ID."""
    return await user_service.get_profile_by_id(user_id)
