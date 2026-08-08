import uuid
import h3
from datetime import datetime
from typing import List
from backend.schemas.report import ReportCreateRequest, CommunityReportResponse
from backend.repositories.report_repository import ReportRepository
from backend.core.logging import logger


class CommunityService:
    """Community Telemetry Service handling incident moderation & verification scoring."""

    def __init__(self, report_repo: ReportRepository = None):
        self.report_repo = report_repo or ReportRepository()

    async def submit_report(self, request: ReportCreateRequest, user_uid: str = "anon") -> CommunityReportResponse:
        h3_index = h3.geo_to_h3(request.latitude, request.longitude, 9)
        report_id = f"rep_{uuid.uuid4().hex[:8]}"

        # Mock image URL mapping since we don't have cloud storage
        image_url = None
        if request.image_b64:
            # Simulated URL for demo purposes. Real impl would upload to Firebase Storage
            image_url = f"https://storage.safesphere.demo/reports/{report_id}.jpg"

        report_data = {
            "report_id": report_id,
            "category": request.category.value,
            "severity": request.severity,
            "description": request.description,
            "latitude": request.latitude,
            "longitude": request.longitude,
            "h3_index": h3_index,
            "verification_count": 1,
            "status": "VERIFIED",
            "image_url": image_url,
            "created_at": datetime.utcnow().isoformat()
        }

        await self.report_repo.create(report_id, report_data)

        logger.info(
            "community_report_submitted",
            report_id=report_id,
            category=request.category.value,
            h3_index=h3_index
        )

        return CommunityReportResponse(**report_data)

    async def list_reports(self, limit: int = 50) -> List[CommunityReportResponse]:
        raw_reports = await self.report_repo.get_all_reports(limit)
        return [CommunityReportResponse(**r) for r in raw_reports]
