from __future__ import annotations

from typing import Type
from pydantic import BaseModel, Field, PrivateAttr

from app.models.user import User
from app.services.gmail_tools import GmailTools
from app.tools.base import CRMTool


class SendEmailInput(BaseModel):
    to: str = Field(..., description="Recipient email address")
    subject: str = Field(..., description="Subject of the email")
    body: str = Field(..., description="Body content of the email")


class SendEmailTool(CRMTool):
    name: str = "send_email"
    description: str = "Send a new email using Gmail."

    args_schema: Type[BaseModel] = SendEmailInput
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
        result = self._gmail.send_email(
            to=to,
            subject=subject,
            body=body,
        )

        return {
            "id": result["id"],
            "thread_id": result["threadId"],
            "status": "sent",
        }
