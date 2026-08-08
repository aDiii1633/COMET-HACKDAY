from typing import Optional, Dict, Any, List
from backend.repositories.base_repository import BaseRepository
from backend.firebase.firestore_client import get_firestore_db
from backend.core.logging import logger


class AdminRepository(BaseRepository):
    """Repository handling Firestore /AdminLogs, /Settings, /Predictions, and /SavedRoutes collections."""

    def __init__(self):
        self.db = get_firestore_db()
        self._in_memory_logs: List[Dict[str, Any]] = []
        self._in_memory_settings: Dict[str, Any] = {
            "system_threshold_warning": 30.0,
            "system_threshold_danger": 60.0,
            "h3_resolution_default": 9,
            "fcm_retry_attempts": 3
        }

    async def create(self, item_id: str, data: Dict[str, Any]) -> Dict[str, Any]:
        self._in_memory_logs.insert(0, data)
        if self.db:
            try:
                self.db.collection("AdminLogs").document(item_id).set(data)
            except Exception as e:
                logger.warn("firestore_admin_log_fallback", error=str(e))
        return data

    async def get_by_id(self, item_id: str) -> Optional[Dict[str, Any]]:
        for log in self._in_memory_logs:
            if log.get("log_id") == item_id:
                return log
        return None

    async def list_admin_logs(self, limit: int = 50) -> List[Dict[str, Any]]:
        return self._in_memory_logs[:limit]

    async def get_settings(self) -> Dict[str, Any]:
        return self._in_memory_settings

    async def update_settings(self, new_settings: Dict[str, Any]) -> Dict[str, Any]:
        self._in_memory_settings.update(new_settings)
        if self.db:
            try:
                self.db.collection("Settings").document("global_config").set(self._in_memory_settings)
            except Exception as e:
                logger.warn("firestore_settings_update_fallback", error=str(e))
        return self._in_memory_settings

    async def update(self, item_id: str, data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        return None

    async def delete(self, item_id: str) -> bool:
        return True
