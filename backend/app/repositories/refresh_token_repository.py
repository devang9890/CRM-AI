import hashlib
from datetime import datetime
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.refresh_token import RefreshToken


class RefreshTokenRepository:
    def __init__(self, db: Session):
        self.db = db

    @staticmethod
    def hash_token(token: str) -> str:
        return hashlib.sha256(token.encode()).hexdigest()

    def create(
        self,
        *,
        user_id: UUID,
        refresh_token: str,
        expires_at: datetime,
        device_name: str | None = None,
        browser: str | None = None,
        operating_system: str | None = None,
        ip_address: str | None = None,
        user_agent: str | None = None,
    ) -> RefreshToken:

        token = RefreshToken(
            user_id=user_id,
            token_hash=self.hash_token(refresh_token),
            expires_at=expires_at,
            device_name=device_name,
            browser=browser,
            operating_system=operating_system,
            ip_address=ip_address,
            user_agent=user_agent,
            last_used_at=datetime.utcnow(),
        )

        self.db.add(token)
        self.db.commit()
        self.db.refresh(token)

        return token

    def get_by_token(
        self,
        refresh_token: str,
    ) -> RefreshToken | None:

        token_hash = self.hash_token(refresh_token)

        result = self.db.execute(
            select(RefreshToken).where(
                RefreshToken.token_hash == token_hash
            )
        )

        return result.scalar_one_or_none()

    def update_last_used(
        self,
        token: RefreshToken,
    ) -> None:

        token.last_used_at = datetime.utcnow()
        self.db.commit()

    def revoke(
        self,
        token: RefreshToken,
    ) -> None:

        token.is_revoked = True
        self.db.commit()

    def revoke_all_for_user(
        self,
        user_id: UUID,
    ) -> None:

        result = self.db.execute(
            select(RefreshToken).where(
                RefreshToken.user_id == user_id,
                RefreshToken.is_revoked.is_(False),
            )
        )

        tokens = result.scalars().all()

        for token in tokens:
            token.is_revoked = True

        self.db.commit()

    def delete_expired(self) -> None:

        result = self.db.execute(
            select(RefreshToken).where(
                RefreshToken.expires_at < datetime.utcnow()
            )
        )

        tokens = result.scalars().all()

        for token in tokens:
            self.db.delete(token)

        self.db.commit()