from __future__ import annotations

from app.models.user import User
from app.services.tools.base_tool import BaseTool
from app.services.tools.gmail_tools import GmailTools


class ReadEmailTool(BaseTool):
    name = "read_email"

    description = (
        "Read a Gmail email by Gmail message ID."
    )

    def __init__(self, user: User):
        self.gmail = GmailTools(user)

    def invoke(
        self,
        message_id: str,
    ) -> dict:
        email = self.gmail.read_email(message_id)

        headers = email.get("payload", {}).get("headers", [])

        def header(name: str):
            for h in headers:
                if h["name"].lower() == name.lower():
                    return h["value"]
            return ""

        return {
            "id": email["id"],
            "thread_id": email["threadId"],
            "subject": header("Subject"),
            "from": header("From"),
            "to": header("To"),
            "date": header("Date"),
            "snippet": email.get("snippet", ""),
            "labels": email.get("labelIds", []),
        }