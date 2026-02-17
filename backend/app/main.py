from __future__ import annotations
import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded

from app.config import CORS_ORIGINS
from app.routes.graph import router as graph_router
from app.routes.persistence import router as persistence_router
from app.middleware.errors import error_handler
from app.middleware.rate_limit import limiter

logging.basicConfig(level=logging.INFO)

app = FastAPI(title="Arch API", version="0.1.0")

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.middleware("http")(error_handler)

app.include_router(graph_router)
app.include_router(persistence_router)


@app.get("/health")
async def health():
    return {"status": "ok"}
