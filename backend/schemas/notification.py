from datetime import datetime
from enum import Enum
from typing import Optional, Dict, Any
from pydantic import BaseModel, Field


class NotificationChannel(str, Enum):
    PUSH = "PUSH"
    SMS = "SMS"
    WHATSAPP = "WHATSAPP"
    EMAIL = "EMAIL"


class NotificationSendRequest(BaseModel):
    recipient_uid: str
    channel: NotificationChannel = NotificationChannel.PUSH
    title: str
    body: str
    data: Optional[Dict[str, Any]] = None


class NotificationResponse(BaseModel):
    notification_id: str
    recipient_uid: str
    channel: NotificationChannel
    status: str = "DELIVERED"
    timestamp: datetime = Field(default_factory=datetime.utcnow)
