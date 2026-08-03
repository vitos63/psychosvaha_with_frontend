from pydantic import BaseModel


class ProblemReportRequest(BaseModel):
    tg_username: str
    problem_description: str
