from __future__ import annotations

from app.models.user import User
from app.services.tools.base_tool import BaseTool
from app.services.tools.gmail_tools import GmailTools


class ReplyEmailTool(BaseTool):
    name = "reply_email"

    description = (
        "Reply to an existing Gmail conversation."
    )

    def __init__(self, user: User):
        self.gmail = GmailTools(user)

    def invoke(
        self,
        thread_id: str,
        to: str,
        subject: str,
        body: str,
    ) -> dict:
        message = self.gmail.reply_email(
            thread_id=thread_id,
            to=to,
            subject=subject,
            body=body,
        )

        return {
            "message_id": message["id"],
            "thread_id": message["threadId"],
            "status": "replied",
        }