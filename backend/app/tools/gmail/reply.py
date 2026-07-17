from __future__ import annotations

from typing import Type
from pydantic import BaseModel, Field, PrivateAttr

from app.models.user import User
from app.services.gmail_tools import GmailTools
from app.tools.base import CRMTool


class ReplyEmailInput(BaseModel):
    thread_id: str = Field(..., description="Gmail thread ID to reply to")
    to: str = Field(..., description="Recipient email address")
    subject: str = Field(..., description="Subject of the thread (e.g. Re: subject)")
    body: str = Field(..., description="Body content of the reply email")


class ReplyEmailTool(CRMTool):
    name: str = "reply_email"
    description: str = "Reply to an existing Gmail conversation thread."

    args_schema: Type[BaseModel] = ReplyEmailInput
    _user: User = PrivateAttr()
    _gmail: GmailTools = PrivateAttr()

    def __init__(self, user: User):
        super().__init__()
        self._user = user
        self._gmail = GmailTools(user)

    def _run(
        self,
        thread_id: str,
        to: str,
        subject: str,
        body: str,
    ) -> dict:
        message = self._gmail.reply_email(
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
