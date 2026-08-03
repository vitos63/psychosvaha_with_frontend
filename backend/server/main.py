from fastapi import FastAPI, Request
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from sqladmin import Admin

from server.handlers.v1.admin.controller import admin_router
from server.handlers.v1.client_requests.controller import (
    router as client_requests_router,
)
from server.handlers.v1.therapist.controller import router as therapist_router
from server.handlers.v1.tg_webapp.controller import router as tg_webapp_router
from server.handlers.v1.problem_report.controller import problem_report_router
from server.admin_panel.models import (
    TagAdmin,
    AdminAdmin,
    TherapistsAdmin,
    ClientRequestsAdmin,
)
from database.engine import engine
from server.admin_panel.auth import AdminAuth
from config import SECRET_KEY


origins = [
    "http://localhost:3000",
]


app = FastAPI()

admin = Admin(app, engine=engine, base_url="/v1/admin-panel", authentication_backend=AdminAuth(secret_key=SECRET_KEY))

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
app.include_router(problem_report_router)

app.include_router(admin_router)


app.mount("/media", StaticFiles(directory="media"), name="media")
admin.add_view(TagAdmin)
admin.add_view(TherapistsAdmin)
admin.add_view(ClientRequestsAdmin)
admin.add_view(AdminAdmin)


@app.exception_handler(Exception)
async def domain_error_handler(_: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={"error": str(exc)},
    )
