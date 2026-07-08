from datetime import datetime, timedelta, timezone
from hashlib import sha256
from jose import jwt, JWTError
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.refresh_token import RefreshToken


class TokenService:

    @staticmethod
    def hash_token(token: str) -> str:
        return sha256(token.encode()).hexdigest()

    @staticmethod
    def create_access_token(data: dict) -> str:
        payload = data.copy()
        payload["exp"] = datetime.now(timezone.utc) + timedelta(
            minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
        )

        return jwt.encode(
            payload,
            settings.JWT_SECRET_KEY,
            algorithm=settings.JWT_ALGORITHM,
        )

    @staticmethod
    def create_refresh_token(data: dict) -> str:
        payload = data.copy()
        payload["exp"] = datetime.now(timezone.utc) + timedelta(
            days=settings.REFRESH_TOKEN_EXPIRE_DAYS
        )

        return jwt.encode(
            payload,
            settings.JWT_REFRESH_SECRET_KEY,
            algorithm=settings.JWT_ALGORITHM,
        )

    @staticmethod
    def verify_refresh_token(token: str):
        try:
            return jwt.decode(
                token,
                settings.JWT_REFRESH_SECRET_KEY,
                algorithms=[settings.JWT_ALGORITHM],
            )
        except JWTError:
            return None

    @staticmethod
    def rotate_refresh_token(db: Session, refresh_token: str):

        payload = TokenService.verify_refresh_token(refresh_token)

        if not payload:
            return None

        token_hash = TokenService.hash_token(refresh_token)

        db_token = (
            db.query(RefreshToken)
            .filter(RefreshToken.token_hash == token_hash)
            .first()
        )

        if not db_token:
            return None

        db.delete(db_token)
        db.commit()

        new_access = TokenService.create_access_token(
            {"sub": str(db_token.user_id)}
        )

        new_refresh = TokenService.create_refresh_token(
            {"sub": str(db_token.user_id)}
        )

        new_db_token = RefreshToken(
            user_id=db_token.user_id,
            token_hash=TokenService.hash_token(new_refresh),
            expires_at=datetime.now(timezone.utc)
            + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS),
        )

        db.add(new_db_token)
        db.commit()

        return {
            "access_token": new_access,
            "refresh_token": new_refresh,
        }

    @staticmethod
    def revoke_refresh_token(db: Session, refresh_token: str):

        token_hash = TokenService.hash_token(refresh_token)

        db_token = (
            db.query(RefreshToken)
            .filter(RefreshToken.token_hash == token_hash)
            .first()
        )

        if db_token:
            db.delete(db_token)
            db.commit()

        return True