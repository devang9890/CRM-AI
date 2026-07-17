from __future__ import annotations

from typing import Type
from pydantic import BaseModel, Field, PrivateAttr

from app.models.user import User
from app.services.gmail_tools import GmailTools
from app.tools.base import CRMTool


class ReadEmailInput(BaseModel):
    message_id: str = Field(..., description="Gmail message ID")


class ReadEmailTool(CRMTool):
    name: str = "read_email"
    description: str = (
        "Read a Gmail email by message ID. "
        "Returns headers (subject, from, to, date), snippet, and labels."
    )

    args_schema: Type[BaseModel] = ReadEmailInput
    _user: User = PrivateAttr()
    _gmail: GmailTools = PrivateAttr()

    def __init__(self, user: User):
        super().__init__()
        self._user = user
        self._gmail = GmailTools(user)

    def _run(
        self,
        message_id: str,
    ) -> dict:
        email = self._gmail.read_email(message_id)

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
