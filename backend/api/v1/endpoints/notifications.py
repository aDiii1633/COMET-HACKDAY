from fastapi import APIRouter, Depends
from backend.schemas.notification import NotificationSendRequest, NotificationResponse
from backend.services.notification_service import NotificationService
from backend.core.dependencies import get_notification_service, get_current_user_uid

router = APIRouter(prefix="/notifications", tags=["Notifications Engine"])


@router.post("/send", response_model=NotificationResponse)
async def send_notification(
    request: NotificationSendRequest,
    notification_service: NotificationService = Depends(get_notification_service)
):
    """Dispatches multi-channel notification (FCM Push, SMS, WhatsApp, Email)."""
    return await notification_service.send_notification(request)


@router.get("", response_model=list)
async def list_notifications(
    limit: int = 50,
    user_uid: str = Depends(get_current_user_uid),
    notification_service: NotificationService = Depends(get_notification_service)
):
    """Fetches user notifications from Firestore."""
    return await notification_service.list_notifications(user_uid, limit)
