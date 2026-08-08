from typing import Optional, Dict, Any, List
from backend.repositories.base_repository import BaseRepository
from backend.firebase.firestore_client import get_firestore_db
from backend.core.logging import logger


class RiskRepository(BaseRepository):
    """Repository handling H3 spatial risk index data in Firestore."""

    def __init__(self):
        self.db = get_firestore_db()
        self._in_memory_indices: Dict[str, Dict[str, Any]] = {
            "8928308280fffff": {
                "h3_index": "8928308280fffff",
                "current_risk_score": 14.0,
                "risk_level": "SAFE",
                "last_updated": "2026-08-03T13:00:00Z"
            },
            "8928308284fffff": {
                "h3_index": "8928308284fffff",
                "current_risk_score": 78.0,
                "risk_level": "DANGER",
                "last_updated": "2026-08-03T13:00:00Z"
            }
        }

    async def create(self, item_id: str, data: Dict[str, Any]) -> Dict[str, Any]:
        self._in_memory_indices[item_id] = data
        if self.db:
            try:
                self.db.collection("spatial_risk_index").document(item_id).set(data)
            except Exception as e:
                logger.warn("firestore_risk_create_fallback", error=str(e))
        return data

    async def get_by_id(self, item_id: str) -> Optional[Dict[str, Any]]:
        if self.db:
            try:
                doc = self.db.collection("spatial_risk_index").document(item_id).get()
                if doc.exists:
                    return doc.to_dict()
            except Exception as e:
                logger.warn("firestore_risk_get_fallback", error=str(e))
        return self._in_memory_indices.get(item_id)

    async def update(self, item_id: str, data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        existing = await self.get_by_id(item_id)
        if not existing:
            return await self.create(item_id, data)
        existing.update(data)
        self._in_memory_indices[item_id] = existing
        return existing

    async def delete(self, item_id: str) -> bool:
        if item_id in self._in_memory_indices:
            del self._in_memory_indices[item_id]
        return True
