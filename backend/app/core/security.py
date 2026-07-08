from datetime import datetime, timedelta, timezone
from typing import Any

from jose import JWTError, jwt
from passlib.context import CryptContext

from app.core.config import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

ACCESS_SECRET_KEY = settings.JWT_SECRET_KEY
REFRESH_SECRET_KEY = settings.JWT_REFRESH_SECRET_KEY

ALGORITHM = settings.JWT_ALGORITHM

ACCESS_TOKEN_EXPIRE_MINUTES = settings.JWT_ACCESS_TOKEN_EXPIRE_MINUTES
REFRESH_TOKEN_EXPIRE_DAYS = settings.JWT_REFRESH_TOKEN_EXPIRE_DAYS


def create_access_token(subject: str) -> str:
    expire = datetime.now(timezone.utc) + timedelta(
        minutes=ACCESS_TOKEN_EXPIRE_MINUTES
    )

    payload = {
        "sub": subject,
        "type": "access",
        "iat": datetime.now(timezone.utc),
        "exp": expire,
    }

    return jwt.encode(
        payload,
        ACCESS_SECRET_KEY,
        algorithm=ALGORITHM,
    )


def create_refresh_token(subject: str) -> str:
    expire = datetime.now(timezone.utc) + timedelta(
        days=REFRESH_TOKEN_EXPIRE_DAYS
    )

    payload = {
        "sub": subject,
        "type": "refresh",
        "iat": datetime.now(timezone.utc),
        "exp": expire,
    }

    return jwt.encode(
        payload,
        REFRESH_SECRET_KEY,
        algorithm=ALGORITHM,
    )


def verify_access_token(token: str) -> dict[str, Any]:
    try:
        payload = jwt.decode(
            token,
            ACCESS_SECRET_KEY,
            algorithms=[ALGORITHM],
        )

        if payload.get("type") != "access":
            raise ValueError("Invalid access token")

        return payload

    except JWTError:
        raise ValueError("Invalid or expired access token")


def verify_refresh_token(token: str) -> dict[str, Any]:
    try:
        payload = jwt.decode(
            token,
            REFRESH_SECRET_KEY,
            algorithms=[ALGORITHM],
        )

        if payload.get("type") != "refresh":
            raise ValueError("Invalid refresh token")

        return payload

    except JWTError:
        raise ValueError("Invalid or expired refresh token")