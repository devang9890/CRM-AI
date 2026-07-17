from __future__ import annotations

from typing import Type
from pydantic import BaseModel, Field, PrivateAttr

from app.models.user import User
from app.services.gmail_tools import GmailTools
from app.tools.base import CRMTool


class ArchiveEmailInput(BaseModel):
    message_id: str = Field(..., description="Gmail message ID to archive")


class ArchiveEmailTool(CRMTool):
    name: str = "archive_email"
    description: str = "Archive a Gmail email (removes it from the Inbox)."

    args_schema: Type[BaseModel] = ArchiveEmailInput
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
        self._gmail.archive_email(message_id)

        return {
            "message_id": message_id,
            "status": "archived",
        }
