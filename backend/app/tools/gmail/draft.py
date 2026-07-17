from __future__ import annotations

from typing import Type
from pydantic import BaseModel, Field, PrivateAttr

from app.models.user import User
from app.services.gmail_tools import GmailTools
from app.tools.base import CRMTool


class DraftEmailInput(BaseModel):
    to: str = Field(..., description="Recipient email address")
    subject: str = Field(..., description="Subject of the email")
    body: str = Field(..., description="Body content of the draft email")


class DraftEmailTool(CRMTool):
    name: str = "draft_email"
    description: str = "Create a new Gmail draft email."

    args_schema: Type[BaseModel] = DraftEmailInput
    _user: User = PrivateAttr()
    _gmail: GmailTools = PrivateAttr()

    def __init__(self, user: User):
        super().__init__()
        self._user = user
        self._gmail = GmailTools(user)

    def _run(
        self,
        to: str,
        subject: str,
        body: str,
    ) -> dict:
        draft = self._gmail.create_draft(
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
