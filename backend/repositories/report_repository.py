from typing import Optional, Dict, Any, List
from backend.repositories.base_repository import BaseRepository
from backend.firebase.firestore_client import get_firestore_db
from backend.core.logging import logger


class ReportRepository(BaseRepository):
    """Repository handling Community Incident Reports in Firestore."""

    def __init__(self):
        self.db = get_firestore_db()
        self._in_memory_reports: List[Dict[str, Any]] = []

    async def create(self, item_id: str, data: Dict[str, Any]) -> Dict[str, Any]:
        self._in_memory_reports.insert(0, data)
        if self.db:
            try:
                self.db.collection("community_reports").document(item_id).set(data)
            except Exception as e:
                logger.warn("firestore_report_create_fallback", error=str(e))
        return data

    async def get_by_id(self, item_id: str) -> Optional[Dict[str, Any]]:
        for rep in self._in_memory_reports:
            if rep.get("report_id") == item_id:
                return rep
        return None

    async def get_all_reports(self, limit: int = 50) -> List[Dict[str, Any]]:
        if self.db:
            try:
                docs = self.db.collection("community_reports").order_by("created_at", direction="DESCENDING").limit(limit).stream()
                reports = [doc.to_dict() for doc in docs]
                if reports:
                    return reports
            except Exception as e:
                logger.warn("firestore_fetch_failed_using_memory", error=str(e))
        return self._in_memory_reports[:limit]

    async def update(self, item_id: str, data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        for rep in self._in_memory_reports:
            if rep.get("report_id") == item_id:
                rep.update(data)
                return rep
        return None

    async def delete(self, item_id: str) -> bool:
        self._in_memory_reports = [r for r in self._in_memory_reports if r.get("report_id") != item_id]
        return True
