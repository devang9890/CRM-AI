from datetime import datetime, timedelta, timezone
from typing import Any

from jose import JWTError, jwt
from passlib.context import CryptContext

from app.core.config import settings

# -----------------------------------------------------------------------------
# Password Context
# (Kept for future use if password auth is ever added)
# -----------------------------------------------------------------------------

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


# -----------------------------------------------------------------------------
# JWT Configuration
# -----------------------------------------------------------------------------

SECRET_KEY = settings.JWT_SECRET_KEY
ALGORITHM = settings.JWT_ALGORITHM

ACCESS_TOKEN_EXPIRE_MINUTES = settings.JWT_ACCESS_TOKEN_EXPIRE_MINUTES
REFRESH_TOKEN_EXPIRE_DAYS = settings.JWT_REFRESH_TOKEN_EXPIRE_DAYS


# -----------------------------------------------------------------------------
# Token Creation
# -----------------------------------------------------------------------------

def create_access_token(subject: str) -> str:
    expire = datetime.now(timezone.utc) + timedelta(
        minutes=ACCESS_TOKEN_EXPIRE_MINUTES
    )

    payload = {
        "sub": subject,
        "type": "access",
        "exp": expire,
        "iat": datetime.now(timezone.utc),
    }

    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


def create_refresh_token(subject: str) -> str:
    expire = datetime.now(timezone.utc) + timedelta(
        days=REFRESH_TOKEN_EXPIRE_DAYS
    )

    payload = {
        "sub": subject,
        "type": "refresh",
        "exp": expire,
        "iat": datetime.now(timezone.utc),
    }

    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


# -----------------------------------------------------------------------------
# Token Verification
# -----------------------------------------------------------------------------

def decode_token(token: str) -> dict[str, Any]:
    try:
        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM],
        )

        return payload

    except JWTError:
        raise ValueError("Invalid or expired token")


# -----------------------------------------------------------------------------
# Token Helpers
# -----------------------------------------------------------------------------

def verify_access_token(token: str) -> dict[str, Any]:
    payload = decode_token(token)

    if payload.get("type") != "access":
        raise ValueError("Invalid access token")

    return payload


def verify_refresh_token(token: str) -> dict[str, Any]:
    payload = decode_token(token)

    if payload.get("type") != "refresh":
        raise ValueError("Invalid refresh token")

    return payload