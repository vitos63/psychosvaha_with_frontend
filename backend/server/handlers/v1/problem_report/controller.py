from typing import Annotated

from fastapi import Depends, status, Response
from fastapi.routing import APIRouter

from server.dependencies import problem_report_service
from service.problem_report import ProblemReportService

from .request import ProblemReportRequest


problem_report_router = APIRouter(prefix="/v1", tags=["problem-report"])


@problem_report_router.post("/send-problem-report", status_code=status.HTTP_204_NO_CONTENT)
async def problem_report_request(service: Annotated[ProblemReportService, Depends(problem_report_service)],
                                 problem_request: ProblemReportRequest) -> Response:
    await service.send_report_to_admin(tg_username=problem_request.tg_username,
                                       problem_description=problem_request.problem_description)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
