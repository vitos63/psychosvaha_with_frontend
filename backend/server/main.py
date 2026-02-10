from fastapi import FastAPI, Request
from contextlib import asynccontextmanager
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware

from server.handlers.v1.client_requests.controller import router as client_requests_router
from server.handlers.v1.therapist.controller import router as therapist_router
from cron.queue.main import main


origins = [
    "http://localhost:3000",
]

@asynccontextmanager
async def lifespan(app: FastAPI):
    import asyncio
    consumer_task = asyncio.create_task(main())
    yield


app = FastAPI(lifespan=lifespan)

app.include_router(client_requests_router)
app.include_router(therapist_router)
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(Exception)
async def domain_error_handler(_: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={"error": str(exc)},
    )
