from typing import Annotated

from fastapi import Depends, status
from fastapi.routing import APIRouter

from server.dependencies import problem_report_service
from service.problem_report import ProblemReportService

from .request import ProblemReportRequest


problem_report_router = APIRouter(prefix="/v1/send-problem-report", tags=["problem-report"])


@problem_report_router.post("/")
async def problem_report_request(service: Annotated[ProblemReportService, Depends(problem_report_service)],
                                 problem_request: ProblemReportRequest):
    await service.send_report_to_admin(tg_username=problem_request.tg_username,
                                       problem_description=problem_request.problem_description)
    return status.HTTP_204_NO_CONTENT
