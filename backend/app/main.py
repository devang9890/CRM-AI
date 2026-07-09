from contextlib import asynccontextmanager
from app.tasks.scheduler import start_scheduler
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.sessions import SessionMiddleware

from app.api.router import api_router
from app.core.config import settings
from app.core.logger import logger


@asynccontextmanager
async def lifespan(app: FastAPI):

    logger.info("Starting AI CRM Backend...")

    start_scheduler()

    yield

    logger.info("Stopping AI CRM Backend...")


app = FastAPI(
    title=settings.APP_NAME,
    description=settings.APP_DESCRIPTION,
    version=settings.APP_VERSION,
    lifespan=lifespan
)

app.add_middleware(
    SessionMiddleware,
    secret_key=settings.JWT_SECRET_KEY,
    session_cookie="crm_session",
    same_site="lax",
    https_only=settings.ENVIRONMENT == "production"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

app.include_router(
    api_router,
    prefix=settings.API_V1_PREFIX
)

@app.get("/")
async def root():
    return {
        "message": "AI CRM Assistant Backend Running 🚀"
    }