from fastapi import FastAPI
from app.api.v1 import alerts

app = FastAPI(title="SENDA Backend API")

app.include_router(alerts.router, prefix="/api/v1")