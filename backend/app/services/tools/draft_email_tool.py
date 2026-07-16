from __future__ import annotations

from app.models.user import User
from app.services.tools.base_tool import BaseTool
from app.services.tools.gmail_tools import GmailTools


class DraftEmailTool(BaseTool):
    name = "draft_email"

    description = (
        "Create a Gmail draft email."
    )

    def __init__(self, user: User):
        self.gmail = GmailTools(user)

    def invoke(
        self,
        to: str,
        subject: str,
        body: str,
    ) -> dict:
        draft = self.gmail.create_draft(
            to=to,
            subject=subject,
            body=body,
        )

        return {
            "draft_id": draft["id"],
            "message_id": draft["message"]["id"],
            "thread_id": draft["message"]["threadId"],
            "status": "draft_created",
        }