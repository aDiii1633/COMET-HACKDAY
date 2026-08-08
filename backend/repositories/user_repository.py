from datetime import datetime
from typing import Optional, Dict, Any, List
from backend.repositories.base_repository import BaseRepository
from backend.firebase.firestore_client import get_firestore_db
from backend.core.logging import logger


class UserRepository(BaseRepository):
    """Repository handling User profile data in Firestore keyed strictly by Supabase User ID."""

    def __init__(self):
        self.db = get_firestore_db()
        self._in_memory_users: Dict[str, Dict[str, Any]] = {
            "sub_ananya_01": {
                "id": "sub_ananya_01",
                "email": "user@safesphere.ai",
                "name": "Ananya Sharma",
                "role": "user",
                "is_active": True,
                "createdAt": datetime.utcnow().isoformat(),
                "updatedAt": datetime.utcnow().isoformat(),
            }
        }

    async def create(self, item_id: str, data: Dict[str, Any]) -> Dict[str, Any]:
        """Creates user document in Firestore keyed by Supabase ID."""
        self._in_memory_users[item_id] = data
        if self.db:
            try:
                self.db.collection("users").document(item_id).set(data)
            except Exception as e:
                logger.warn("firestore_user_create_fallback", error=str(e))
        return data

    async def get_by_id(self, item_id: str) -> Optional[Dict[str, Any]]:
        """Fetches user document by Supabase ID."""
        if self.db:
            try:
                doc = self.db.collection("users").document(item_id).get()
                if doc.exists:
                    return doc.to_dict()
            except Exception as e:
                logger.warn("firestore_user_get_fallback", error=str(e))
        return self._in_memory_users.get(item_id)

    async def get_by_email(self, email: str) -> Optional[Dict[str, Any]]:
        """Fetches user document matching email address."""
        if self.db:
            try:
                docs = self.db.collection("users").where("email", "==", email).limit(1).stream()
                for doc in docs:
                    return doc.to_dict()
            except Exception as e:
                logger.warn("firestore_user_get_email_fallback", error=str(e))

        for user in self._in_memory_users.values():
            if user.get("email") == email:
                return user
        return None

    async def list_users(self, limit: int = 50) -> List[Dict[str, Any]]:
        """Lists registered user documents."""
        if self.db:
            try:
                docs = self.db.collection("users").limit(limit).stream()
                results = [doc.to_dict() for doc in docs]
                if results:
                    return results
            except Exception as e:
                logger.warn("firestore_user_list_fallback", error=str(e))

        return list(self._in_memory_users.values())[:limit]

    async def update(self, item_id: str, data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Updates user document fields."""
        existing = await self.get_by_id(item_id)
        if not existing:
            return None

        data["updatedAt"] = datetime.utcnow().isoformat()
        existing.update(data)
        self._in_memory_users[item_id] = existing

        if self.db:
            try:
                self.db.collection("users").document(item_id).update(data)
            except Exception as e:
                logger.warn("firestore_user_update_fallback", error=str(e))
        return existing

    async def delete(self, item_id: str) -> bool:
        """Deletes user document from Firestore."""
        if item_id in self._in_memory_users:
            del self._in_memory_users[item_id]
        if self.db:
            try:
                self.db.collection("users").document(item_id).delete()
            except Exception as e:
                logger.warn("firestore_user_delete_fallback", error=str(e))
        return True
