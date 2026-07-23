from sqlalchemy import desc, select
from sqlalchemy.orm import Session

from app.models.email import Email


from sqlalchemy.orm import defer


class EmailReadRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_user_emails(
        self,
        user_id: int,
        limit: int = 50,
        offset: int = 0,
    ) -> list[Email]:
        result = self.db.execute(
            select(Email)
            .options(
                defer(Email.body_html),
                defer(Email.body_text),
                defer(Email.embedding),
            )
            .where(Email.user_id == user_id)
            .order_by(desc(Email.id))
            .offset(offset)
            .limit(limit)
        )

        return list(result.scalars().all())