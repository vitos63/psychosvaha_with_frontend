from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse

from server.handlers.v1.client_requests.controller import router as client_requests_router
from server.handlers.v1.therapist.controller import router as therapist_router

app = FastAPI()

app.include_router(client_requests_router)
app.include_router(therapist_router)


@app.exception_handler(Exception)
async def domain_error_handler(_: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={"error": str(exc)},
    )
