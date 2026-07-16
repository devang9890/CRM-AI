from __future__ import annotations

from app.models.user import User
from app.services.tools.base_tool import BaseTool
from app.services.tools.gmail_tools import GmailTools


class ArchiveEmailTool(BaseTool):
    name = "archive_email"

    description = (
        "Archive a Gmail email."
    )

    def __init__(self, user: User):
        self.gmail = GmailTools(user)

    def invoke(
        self,
        message_id: str,
    ) -> dict:
        self.gmail.archive_email(message_id)

        return {
            "message_id": message_id,
            "status": "archived",
        }