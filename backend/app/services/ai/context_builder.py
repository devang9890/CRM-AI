from __future__ import annotations

from sqlalchemy.orm import Session

from app.services.semantic_search_service import SemanticSearchService


class ContextBuilder:
    def __init__(self, db: Session):
        self.db = db
        self.semantic_search_service = SemanticSearchService(db)

    def build(
        self,
        user_id: int,
        question: str,
        limit: int = 5,
    ) -> str:
        emails = self.semantic_search_service.search(
            user_id=user_id,
            query=question,
            limit=limit,
        )

        if not emails:
            return "No relevant emails found."

        sections: list[str] = []

        for index, email in enumerate(emails, start=1):
            sender = email.sender or "Unknown"
            subject = email.subject or "(No Subject)"
            date = email.created_at.isoformat() if email.created_at else "Unknown"

            body = email.body_text or email.body_html or ""
            body = body.strip()

            if len(body) > 2000:
                body = body[:2000]

            sections.append(
                f"""
EMAIL {index}

From:
{sender}

Subject:
{subject}

Date:
{date}

Content:
{body}
""".strip()
            )

        return "\n\n-------------------------\n\n".join(sections)