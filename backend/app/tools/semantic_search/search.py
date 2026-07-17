from __future__ import annotations

from typing import Type
from pydantic import BaseModel, Field, PrivateAttr
from sqlalchemy.orm import Session

from app.models.user import User
from app.services.semantic_search_service import SemanticSearchService
from app.tools.base import CRMTool


class SemanticSearchInput(BaseModel):
    query: str = Field(..., description="Query string to search for emails semantically")
    limit: int | str = Field(default=5, description="Maximum number of search results to return")


class SemanticSearchTool(CRMTool):
    name: str = "semantic_search"
    description: str = (
        "Search the user's synced email messages semantically. "
        "Use this tool whenever the user asks about content, topics, "
        "history, or information contained within their emails."
    )

    args_schema: Type[BaseModel] = SemanticSearchInput
    _db: Session = PrivateAttr()
    _user: User = PrivateAttr()
    _service: SemanticSearchService = PrivateAttr()

    def __init__(self, db: Session, user: User):
        super().__init__()
        self._db = db
        self._user = user
        self._service = SemanticSearchService(db)

    def _run(
        self,
        query: str,
        limit: int | str = 5,
    ) -> dict:
        try:
            limit_val = int(limit)
        except (ValueError, TypeError):
            limit_val = 5

        results = self._service.search(
            user_id=self._user.id,
            query=query,
            limit=limit_val,
        )

        formatted_results = []
        for email in results:
            body = email.body_text or email.body_html or ""
            if len(body) > 1000:
                body = body[:1000] + "... [Content Truncated due to Length]"
                
            formatted_results.append({
                "id": email.id,
                "subject": email.subject,
                "sender": email.sender,
                "snippet": email.snippet,
                "body": body,
                "created_at": email.created_at.isoformat() if email.created_at else None,
            })

        return {"results": formatted_results}
