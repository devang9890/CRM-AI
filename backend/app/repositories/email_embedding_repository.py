from sqlalchemy import update
from sqlalchemy.orm import Session

from app.models.email import Email


class EmailEmbeddingRepository:
    def __init__(self, db: Session):
        self.db = db

    def update_embedding(
        self,
        email_id: int,
        embedding: list[float],
    ) -> None:
        self.db.execute(
            update(Email)
            .where(Email.id == email_id)
            .values(embedding=embedding)
        )

        self.db.commit()