from typing import List, Dict, Any
from fastapi import APIRouter, Depends, status
from backend.repositories.admin_repository import AdminRepository
from backend.repositories.report_repository import ReportRepository
from backend.core.dependencies import get_report_repository

router = APIRouter(prefix="/admin", tags=["Admin Portal"])


def get_admin_repository() -> AdminRepository:
    return AdminRepository()


@router.get("/logs", response_model=List[Dict[str, Any]])
async def list_admin_logs(
    admin_repo: AdminRepository = Depends(get_admin_repository)
):
    """Fetches system audit logs from Firestore /AdminLogs."""
    return await admin_repo.list_admin_logs()


@router.get("/reports-moderation", response_model=List[Dict[str, Any]])
async def list_reports_for_moderation(
    report_repo: ReportRepository = Depends(get_report_repository)
):
    """Moderation endpoint for reviewing submitted community telemetry."""
    return await report_repo.get_all_reports()
