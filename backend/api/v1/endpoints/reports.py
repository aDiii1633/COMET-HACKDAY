from typing import List
from fastapi import APIRouter, Depends, status
from backend.schemas.report import ReportCreateRequest, CommunityReportResponse
from backend.services.community_service import CommunityService
from backend.core.dependencies import get_community_service, get_current_user_uid

router = APIRouter(prefix="/reports", tags=["Community Reports"])


@router.post("", response_model=CommunityReportResponse, status_code=status.HTTP_201_CREATED)
async def submit_community_report(
    request: ReportCreateRequest,
    user_uid: str = Depends(get_current_user_uid),
    community_service: CommunityService = Depends(get_community_service)
):
    return await community_service.submit_report(request, user_uid)


@router.get("", response_model=List[CommunityReportResponse])
async def list_community_reports(
    limit: int = 50,
    community_service: CommunityService = Depends(get_community_service)
):
    return await community_service.list_reports(limit)
