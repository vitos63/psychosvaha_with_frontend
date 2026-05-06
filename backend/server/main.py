from fastapi import FastAPI, Request
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi_admin.app import app as admin_app
from fastapi_admin.providers.login import UsernamePasswordProvider
from database.models import Admin
from fastapi_admin.resources import Model
from contextlib import asynccontextmanager
from database.engine import redis

from server.handlers.v1.admin.controller import admin_router
from server.handlers.v1.client_requests.controller import (
    router as client_requests_router,
)
from server.handlers.v1.therapist.controller import router as therapist_router
from server.handlers.v1.tg_webapp.controller import router as tg_webapp_router
from server.admin_panel.models import (
    TagAdmin,
    AdminAdmin,
    TherapistsAdmin,
    ClientRequestsAdmin,
)


origins = [
    "http://localhost:3000",
]


@asynccontextmanager
async def lifespan(_: FastAPI):
    await admin_app(
        admin_app,
        redis=redis,
        providers=[
            UsernamePasswordProvider(
                admin_model=Admin,
            )
        ],
    )
    admin_app.register(Model(Admin))
    admin_app.register(TagAdmin)
    admin_app.register(TherapistsAdmin)
    admin_app.register(ClientRequestsAdmin)
    admin_app.register(AdminAdmin)
    yield

app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(client_requests_router)
app.include_router(therapist_router)
app.include_router(tg_webapp_router)

app.include_router(admin_router)


app.mount("/media", StaticFiles(directory="media"), name="media")
app.mount('admin', admin_app, name='admin')


@app.exception_handler(Exception)
async def domain_error_handler(_: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={"error": str(exc)},
    )
