from typing import Optional
from backend.firebase.firebase_app import initialize_firebase
from backend.core.logging import logger


class FirestoreClientManager:
    """Manager for Firestore database operations."""
    _client = None

    @classmethod
    def get_client(cls):
        if cls._client:
            return cls._client

        app = initialize_firebase()
        if app:
            try:
                from firebase_admin import firestore
                cls._client = firestore.client()
                logger.info("firestore_client_connected")
            except Exception as e:
                logger.warn("firestore_connection_fallback", error=str(e))
                cls._client = None

        return cls._client


get_firestore_db = FirestoreClientManager.get_client
