from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase

from app.core.config import settings


import urllib.parse

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
)


SessionLocal = sessionmaker(
    bind=engine,
    autoflush=False,
    autocommit=False,
)


class Base(DeclarativeBase):
    pass