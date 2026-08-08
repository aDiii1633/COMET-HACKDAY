import firebase_admin
from firebase_admin import credentials, auth, firestore, db
from backend.core.config import settings
from backend.core.logging import logger

_firebase_app = None


def initialize_firebase():
    """Initializes Firebase Admin SDK with service account or mock fallback."""
    global _firebase_app
    if _firebase_app:
        return _firebase_app

    try:
        if not firebase_admin._apps:
            if settings.FIREBASE_CLIENT_EMAIL and settings.FIREBASE_PRIVATE_KEY:
                cred = credentials.Certificate({
                    "type": "service_account",
                    "project_id": settings.FIREBASE_PROJECT_ID,
                    "client_email": settings.FIREBASE_CLIENT_EMAIL,
                    "private_key": settings.FIREBASE_PRIVATE_KEY.replace("\\n", "\n"),
                })
                options = {}
                if settings.FIREBASE_DATABASE_URL:
                    options['databaseURL'] = settings.FIREBASE_DATABASE_URL
                _firebase_app = firebase_admin.initialize_app(cred, options)
                logger.info("firebase_admin_initialized", project_id=settings.FIREBASE_PROJECT_ID)
            else:
                # Initializing with default app config or mock fallback
                _firebase_app = firebase_admin.initialize_app(options={
                    'projectId': settings.FIREBASE_PROJECT_ID,
                })
                logger.info("firebase_admin_initialized_fallback", project_id=settings.FIREBASE_PROJECT_ID)
    except Exception as e:
        logger.warn("firebase_admin_init_warning", error=str(e))
        _firebase_app = None

    return _firebase_app
