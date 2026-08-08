from typing import List, Optional, Dict, Any
from backend.schemas.user import UserProfileSchema, ProfileUpdateRequest
from backend.repositories.user_repository import UserRepository
from backend.core.exceptions import ResourceNotFoundException


class UserService:
    """UserService handling User Profile business logic."""

    def __init__(self, user_repo: UserRepository = None):
        self.user_repo = user_repo or UserRepository()

    async def get_profile_by_id(self, user_id: str) -> UserProfileSchema:
        user_data = await self.user_repo.get_by_id(user_id)
        if not user_data:
            raise ResourceNotFoundException("User profile not found")
        return UserProfileSchema(**user_data)

    async def update_profile(self, user_id: str, request: ProfileUpdateRequest) -> UserProfileSchema:
        existing = await self.user_repo.get_by_id(user_id)
        if not existing:
            raise ResourceNotFoundException("User profile not found")

        update_payload = request.model_dump(exclude_unset=True)
        if "preferences" in update_payload and update_payload["preferences"]:
            update_payload["preferences"] = update_payload["preferences"].model_dump()

        updated = await self.user_repo.update(user_id, update_payload)
        return UserProfileSchema(**updated)

    async def list_users(self, limit: int = 50) -> List[UserProfileSchema]:
        raw_users = await self.user_repo.list_users(limit)
        return [UserProfileSchema(**u) for u in raw_users]
