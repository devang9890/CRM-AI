from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.user import User


class UserRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, user_id: UUID) -> User | None:
        result = self.db.execute(
            select(User).where(User.id == user_id)
        )
        return result.scalar_one_or_none()

    def get_by_email(self, email: str) -> User | None:
        result = self.db.execute(
            select(User).where(User.email == email)
        )
        return result.scalar_one_or_none()

    def get_by_google_id(self, google_id: str) -> User | None:
        result = self.db.execute(
            select(User).where(User.google_id == google_id)
        )
        return result.scalar_one_or_none()

    def create(
        self,
        *,
        google_id: str,
        email: str,
        full_name: str,
        profile_picture: str | None,
        email_verified: bool,
    ) -> User:

        user = User(
            google_id=google_id,
            email=email,
            full_name=full_name,
            profile_picture=profile_picture,
            email_verified=email_verified,
            is_active=True,
        )

        self.db.add(user)
        self.db.commit()
        self.db.refresh(user)

        return user

    def update(self, user: User) -> User:
        self.db.commit()
        self.db.refresh(user)
        return user