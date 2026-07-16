from __future__ import annotations

from app.models.user import User
from app.services.tools.base_tool import BaseTool
from app.services.tools.gmail_tools import GmailTools


class SendEmailTool(BaseTool):
    name = "send_email"

    description = (
        "Send an email using the user's Gmail account."
    )

    def __init__(self, user: User):
        self.gmail = GmailTools(user)

    def invoke(
        self,
        to: str,
        subject: str,
        body: str,
    ) -> dict:
        result = self.gmail.send_email(
            to=to,
            subject=subject,
            body=body,
        )

        return {
            "id": result["id"],
            "thread_id": result["threadId"],
            "status": "sent",
        }