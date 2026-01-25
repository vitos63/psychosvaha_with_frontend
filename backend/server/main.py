import uvicorn
from fastapi import FastAPI

from server.handlers.client_requests.controller import router as client_requests_router

app = FastAPI()

app.include_router(client_requests_router)


if __name__ == "__main__":
    uvicorn.run(app)
