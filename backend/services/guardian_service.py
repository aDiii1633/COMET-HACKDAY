import uuid
from datetime import datetime
from typing import Dict, Any, List, Optional
from backend.schemas.guardian import GuardianAlertPayload, GuardianCreateRequest, GuardianResponse
from backend.repositories.user_repository import UserRepository
from backend.services.openai_service import OpenAIService
from backend.core.logging import logger


class GuardianService:
    """Guardian Circle Service handling contact management & rich contextual emergency dispatches."""

    def __init__(self, user_repo: UserRepository = None, xai_service: OpenAIService = None):
        self.user_repo = user_repo or UserRepository()
        self.xai_service = xai_service or OpenAIService()

    async def add_guardian(self, user_uid: str, request: GuardianCreateRequest) -> GuardianResponse:
        user = await self.user_repo.get_by_id(user_uid)
        if not user:
            # Create a minimal user object since they don't exist yet
            user = {
                "uid": user_uid,
                "full_name": "New User",
                "guardians": []
            }
            await self.user_repo.create(user_uid, user)

        guardian_id = f"grd_{uuid.uuid4().hex[:8]}"
        new_guardian = {
            "guardian_id": guardian_id,
            "name": request.name,
            "relation": request.relation,
            "phone_number": request.phone_number,
            "fcm_token": request.fcm_token or f"fcm_token_{guardian_id}",
            "status": "ACTIVE_GUARD",
            "created_at": datetime.utcnow().isoformat()
        }

        user["guardians"].append(new_guardian)
        await self.user_repo.update(user_uid, user)

        return GuardianResponse(
            guardian_id=guardian_id,
            name=request.name,
            relation=request.relation,
            phone_number=request.phone_number,
            fcm_token=new_guardian["fcm_token"],
            status="ACTIVE_GUARD"
        )

    async def get_user_guardians(self, user_uid: str) -> List[GuardianResponse]:
        user = await self.user_repo.get_by_id(user_uid)
        if not user or "guardians" not in user:
            return []
        return [GuardianResponse(**g) for g in user["guardians"]]

    async def generate_emergency_alert(
        self,
        user_uid: str,
        current_lat: float,
        current_lng: float,
        area_name: str = "4th Street Alley Corridor",
        risk_score: float = 78.0
    ) -> GuardianAlertPayload:
        user = await self.user_repo.get_by_id(user_uid)
        user_name = user.get("full_name", "Guardian") if user else "Guardian"

        # Generate XAI Context Rationale
        xai_bullets = await self.xai_service.generate_explanation(
            risk_score, "DANGER", {"illumination_score": 12.0, "community_score": 84.0}
        )

        tracking_token = f"trk_live_{uuid.uuid4().hex[:12]}"

        payload = GuardianAlertPayload(
            alert_id=f"alt_{uuid.uuid4().hex[:8]}",
            user_uid=user_uid,
            user_name=user_name,
            current_location={"latitude": current_lat, "longitude": current_lng},
            area_name=area_name,
            risk_score=risk_score,
            risk_level="HIGH DANGER",
            xai_reason=" • ".join(xai_bullets),
            historical_summary="14 harassment reports in past 30 days. Area has zero municipal streetlights.",
            live_tracking_token=tracking_token,
            timestamp=datetime.utcnow()
        )

        logger.info(
            "guardian_alert_generated",
            alert_id=payload.alert_id,
            user_uid=user_uid,
            risk_score=risk_score,
            tracking_token=tracking_token
        )

        return payload
