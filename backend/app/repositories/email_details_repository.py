from sqlalchemy import and_, select
from sqlalchemy.orm import Session

from app.models.email import Email


class EmailDetailsRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_email(
        self,
        user_id: int,
        email_id: int,
    ) -> Email | None:
        result = self.db.execute(
            select(Email).where(
                and_(
                    Email.id == email_id,
                    Email.user_id == user_id,
                )
            )
        )

        return result.scalar_one_or_none()