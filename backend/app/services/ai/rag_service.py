from __future__ import annotations

from sqlalchemy.orm import Session

from app.agent.agent import CRMAgent
from app.db.database import SessionLocal
from app.models.user import User


class RAGService:
    """
    RAG service that wraps the CRM agent and manages database connection lifecycles.
    """

    def __init__(
        self,
        user: User,
        db: Session | None = None,
    ):
        self.user = user
        self._own_db = False

        if db is None:
            self.db = SessionLocal()
            self._own_db = True
        else:
            self.db = db

        self.agent = CRMAgent(user, self.db)

    def ask(
        self,
        question: str,
        thread_id: str,
    ) -> dict:
        try:
            answer = self.agent.invoke(
                question=question,
                thread_id=thread_id,
            )

            return {
                "answer": answer,
            }
        finally:
            if self._own_db:
                self.db.close()