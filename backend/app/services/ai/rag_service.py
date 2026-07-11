from __future__ import annotations

from sqlalchemy.orm import Session

from app.services.agent.graph import CRMAgent


class RAGService:
    def __init__(self, db: Session):
        self.agent = CRMAgent(db)

    def ask(
        self,
        user_id: int,
        question: str,
    ) -> dict:
        result = self.agent.run(
            user_id=user_id,
            question=question,
        )

        return {
            "question": question,
            "answer": result["answer"],
            "context": result["context"],
        }