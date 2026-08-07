# pyright: reportMissingImports=false

import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import auth, generations
from app.core.config import settings

app = FastAPI(
    title="AI Product Image Generator API",
    version="0.1.0",
)

# =====================================
# CORS
# =====================================

allowed_origins = [
    "http://localhost:3000",
    "https://ai-product-image-generator-dv36tdznj-abc-59c3.vercel.app",
]

# เพิ่ม origin จาก config ถ้ามี
if settings.frontend_origin:
    if settings.frontend_origin not in allowed_origins:
        allowed_origins.append(settings.frontend_origin)

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# =====================================
# Routers
# =====================================

app.include_router(
    auth.router,
    prefix="/api",
)

app.include_router(
    generations.router,
    prefix="/api",
)

# =====================================
# Health Check
# =====================================

@app.get("/api/health")
def health_check():
    return {"status": "ok"}


# =====================================
# Logging
# =====================================

logging.basicConfig(
    level=logging.INFO,
)