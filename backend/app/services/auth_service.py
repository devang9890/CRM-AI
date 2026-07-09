from datetime import datetime, timedelta, timezone

from sqlalchemy.orm import Session

from app.core.config import settings
from app.repositories.refresh_token_repository import RefreshTokenRepository
from app.repositories.user_repository import UserRepository
from app.schemas.auth import GoogleUser
from app.utils.jwt import JWTManager


class AuthService:
    def __init__(self, db: Session):
        self.user_repository = UserRepository(db)
        self.refresh_repository = RefreshTokenRepository(db)

    def login_with_google(
        self,
        google_user: GoogleUser,
    ) -> dict:

        user = self.user_repository.get_by_google_id(
            google_user.google_id
        )

        if not user:
            user = self.user_repository.create(
                google_id=google_user.google_id,
                email=google_user.email,
                full_name=google_user.full_name,
                profile_picture=google_user.profile_picture,
                email_verified=google_user.email_verified,
            )

        user.email = google_user.email
        user.full_name = google_user.full_name
        user.profile_picture = google_user.profile_picture
        user.email_verified = google_user.email_verified

        user.google_access_token = google_user.google_access_token

        if google_user.google_refresh_token:
            user.google_refresh_token = google_user.google_refresh_token

        if google_user.google_token_expiry:
            user.google_token_expiry = datetime.fromtimestamp(
                google_user.google_token_expiry,
                tz=timezone.utc,
            )

        user.google_scopes = google_user.google_scopes

        self.user_repository.update(user)

        access_token = JWTManager.generate_access_token(str(user.id))
        refresh_token = JWTManager.generate_refresh_token(str(user.id))

        expires_at = datetime.now(timezone.utc) + timedelta(
            days=settings.JWT_REFRESH_TOKEN_EXPIRE_DAYS
        )

        self.refresh_repository.create(
            user_id=user.id,
            refresh_token=refresh_token,
            expires_at=expires_at,
        )

        return {
            "user": user,
            "access_token": access_token,
            "refresh_token": refresh_token,
        }

    def refresh_session(self, refresh_token: str) -> dict:
        try:
            payload = JWTManager.verify_refresh(refresh_token)
            user_id = payload.get("sub")
            if not user_id:
                raise ValueError("Invalid refresh token payload")
        except Exception:
            raise ValueError("Invalid or expired refresh token")

        db_token = self.refresh_repository.get_by_token(refresh_token)
        if not db_token:
            raise ValueError("Refresh token not found")

        if db_token.is_revoked:
            self.refresh_repository.revoke_all_for_user(db_token.user_id)
            raise ValueError(
                "Refresh token has been revoked due to potential compromise"
            )

        expires_at = db_token.expires_at
        if expires_at.tzinfo is None:
            expires_at = expires_at.replace(tzinfo=timezone.utc)

        if expires_at < datetime.now(timezone.utc):
            raise ValueError("Refresh token has expired")

        self.refresh_repository.revoke(db_token)

        new_access_token = JWTManager.generate_access_token(user_id)
        new_refresh_token = JWTManager.generate_refresh_token(user_id)

        new_expires_at = datetime.now(timezone.utc) + timedelta(
            days=settings.JWT_REFRESH_TOKEN_EXPIRE_DAYS
        )

        self.refresh_repository.create(
            user_id=db_token.user_id,
            refresh_token=new_refresh_token,
            expires_at=new_expires_at,
        )

        return {
            "access_token": new_access_token,
            "refresh_token": new_refresh_token,
        }