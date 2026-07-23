from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase

from app.core.config import settings


import urllib.parse

import os

raw_url = settings.DATABASE_URL or os.getenv("DATABASE_URL")

if raw_url:
    # Remove unsupported pgbouncer query parameter for psycopg 3
    raw_url = raw_url.replace("?pgbouncer=true", "").replace("&pgbouncer=true", "")
    if raw_url.startswith("postgresql://"):
        DATABASE_URL = raw_url.replace("postgresql://", "postgresql+psycopg://", 1)
    elif raw_url.startswith("postgres://"):
        DATABASE_URL = raw_url.replace("postgres://", "postgresql+psycopg://", 1)
    else:
        DATABASE_URL = raw_url
else:
    DATABASE_URL = (
        f"postgresql+psycopg://"
        f"{urllib.parse.quote_plus(settings.DATABASE_USER)}:"
        f"{urllib.parse.quote_plus(settings.DATABASE_PASSWORD)}@"
        f"{settings.DATABASE_HOST}:"
        f"{settings.DATABASE_PORT}/"
        f"{settings.DATABASE_NAME}"
    )


engine = create_engine(
    DATABASE_URL,
    echo=settings.DEBUG,
    connect_args={"prepare_threshold": None},
)


SessionLocal = sessionmaker(
    bind=engine,
    autoflush=False,
    autocommit=False,
)


class Base(DeclarativeBase):
    pass