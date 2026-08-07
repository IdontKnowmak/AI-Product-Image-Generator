# pyright: reportMissingImports=false
import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import auth, generations
from app.core.config import settings

app = FastAPI(title="AI Product Image Generator API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_origin],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api")
app.include_router(generations.router, prefix="/api")


@app.get("/api/health")
def health_check():
    return {"status": "ok"}

logging.basicConfig(
    level=logging.INFO
)