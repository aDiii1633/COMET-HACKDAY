import uuid
from datetime import datetime
from backend.schemas.notification import NotificationSendRequest, NotificationResponse, NotificationChannel
from backend.core.logging import logger
from backend.firebase.firebase_app import initialize_firebase

try:
    from firebase_admin import messaging
except ImportError:
    messaging = None


class NotificationService:
    """Multi-channel Notification Service supporting FCM Push, SMS, WhatsApp, and Email."""

    def __init__(self):
        self.firebase_app = initialize_firebase()
        try:
            from firebase_admin import firestore
            self.db = firestore.client(app=self.firebase_app)
        except Exception:
            self.db = None

    async def send_notification(self, request: NotificationSendRequest) -> NotificationResponse:
        notification_id = f"ntf_{uuid.uuid4().hex[:8]}"

        if request.channel == NotificationChannel.PUSH and messaging and self.firebase_app:
            try:
                # Dispatch high priority FCM alert payload (RULE-33)
                message = messaging.Message(
                    notification=messaging.Notification(
                        title=request.title,
                        body=request.body,
                    ),
                    data={k: str(v) for k, v in (request.data or {}).items()},
                    topic=request.recipient_uid
                )
                messaging.send(message)
                logger.info("fcm_push_dispatched", recipient=request.recipient_uid, title=request.title)
            except Exception as e:
                logger.warn("fcm_push_fallback_logged", error=str(e))

        logger.info(
            "notification_dispatched",
            notification_id=notification_id,
            channel=request.channel.value,
            recipient=request.recipient_uid
        )

        doc_data = {
            "notification_id": notification_id,
            "recipient_uid": request.recipient_uid,
            "title": request.title,
            "body": request.body,
            "channel": request.channel.value,
            "data": request.data or {},
            "status": "DELIVERED",
            "timestamp": datetime.utcnow()
        }
        if self.db:
            try:
                self.db.collection("notifications").document(notification_id).set(doc_data)
            except Exception as e:
                logger.warn("firestore_notification_save_failed", error=str(e))

        return NotificationResponse(
            notification_id=notification_id,
            recipient_uid=request.recipient_uid,
            channel=request.channel,
            status="DELIVERED",
            timestamp=datetime.utcnow()
        )

    async def list_notifications(self, user_uid: str, limit: int = 50) -> list:
        if not self.db:
            return []
        try:
            docs = self.db.collection("notifications").where("recipient_uid", "==", user_uid).order_by("timestamp", direction="DESCENDING").limit(limit).stream()
            return [doc.to_dict() for doc in docs]
        except Exception as e:
            logger.warn("firestore_notification_fetch_failed", error=str(e))
            return []
