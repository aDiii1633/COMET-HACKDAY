from abc import ABC, abstractmethod
from typing import List, Optional, Dict, Any


class BaseRepository(ABC):
    """Abstract Base Repository implementing generic CRUD contract."""

    @abstractmethod
    async def create(self, item_id: str, data: Dict[str, Any]) -> Dict[str, Any]:
        pass

    @abstractmethod
    async def get_by_id(self, item_id: str) -> Optional[Dict[str, Any]]:
        pass

    @abstractmethod
    async def update(self, item_id: str, data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        pass

    @abstractmethod
    async def delete(self, item_id: str) -> bool:
        pass
