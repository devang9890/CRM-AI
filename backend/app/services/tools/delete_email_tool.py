from __future__ import annotations

from app.models.user import User
from app.services.tools.base_tool import BaseTool
from app.services.tools.gmail_tools import GmailTools


class DeleteEmailTool(BaseTool):
    name = "delete_email"

    description = (
        "Delete a Gmail email."
    )

    def __init__(self, user: User):
        self.gmail = GmailTools(user)

    def invoke(
        self,
        message_id: str,
    ) -> dict:
        self.gmail.delete_email(message_id)

        return {
            "message_id": message_id,
            "status": "deleted",
        }