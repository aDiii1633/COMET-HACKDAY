from typing import Optional, Dict, Any, List
from backend.repositories.base_repository import BaseRepository
from backend.firebase.firestore_client import get_firestore_db
from backend.core.logging import logger


class EmergencyRepository(BaseRepository):
    """Repository handling Firestore /EmergencyLogs collection."""

    def __init__(self):
        self.db = get_firestore_db()
        self._in_memory_logs: List[Dict[str, Any]] = []

    async def create(self, item_id: str, data: Dict[str, Any]) -> Dict[str, Any]:
        self._in_memory_logs.insert(0, data)
        if self.db:
            try:
                self.db.collection("EmergencyLogs").document(item_id).set(data)
            except Exception as e:
                logger.warn("firestore_emergency_log_create_fallback", error=str(e))
        return data

    async def get_by_id(self, item_id: str) -> Optional[Dict[str, Any]]:
        for log in self._in_memory_logs:
            if log.get("log_id") == item_id:
                return log
        return None

    async def list_emergency_logs(self, user_uid: Optional[str] = None, limit: int = 50) -> List[Dict[str, Any]]:
        if user_uid:
            return [l for l in self._in_memory_logs if l.get("user_uid") == user_uid][:limit]
        return self._in_memory_logs[:limit]

    async def update(self, item_id: str, data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        for log in self._in_memory_logs:
            if log.get("log_id") == item_id:
                log.update(data)
                return log
        return None

    async def delete(self, item_id: str) -> bool:
        self._in_memory_logs = [l for l in self._in_memory_logs if l.get("log_id") != item_id]
        return True
