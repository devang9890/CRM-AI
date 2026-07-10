from sqlalchemy.orm import Session

from app.repositories.email_semantic_repository import (
    EmailSemanticRepository,
)
from app.services.embedding_service import EmbeddingService


class SemanticSearchService:
    def __init__(self, db: Session):
        self.db = db
        self.embedding_service = EmbeddingService()
        self.repository = EmailSemanticRepository(db)

    def search(
        self,
        user_id: int,
        query: str,
        limit: int = 10,
    ):
        query_embedding = self.embedding_service.embed_query(query)

        return self.repository.semantic_search(
            user_id=user_id,
            embedding=query_embedding,
            limit=limit,
        )