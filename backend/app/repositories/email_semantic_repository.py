from pgvector.sqlalchemy import Vector
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.email import Email


class EmailSemanticRepository:
    def __init__(self, db: Session):
        self.db = db

    def semantic_search(
        self,
        user_id: int,
        embedding: list[float],
        limit: int = 10,
    ):
        stmt = (
            select(Email)
            .where(
                Email.user_id == user_id,
                Email.embedding.is_not(None),
            )
            .order_by(
                Email.embedding.cosine_distance(embedding)
            )
            .limit(limit)
        )

        return self.db.execute(stmt).scalars().all()