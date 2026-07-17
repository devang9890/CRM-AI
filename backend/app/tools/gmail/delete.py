from __future__ import annotations

from typing import Type
from pydantic import BaseModel, Field, PrivateAttr

from app.models.user import User
from app.services.gmail_tools import GmailTools
from app.tools.base import CRMTool


class DeleteEmailInput(BaseModel):
    message_id: str = Field(..., description="Gmail message ID to delete")


class DeleteEmailTool(CRMTool):
    name: str = "delete_email"
    description: str = "Delete a Gmail email message."

    args_schema: Type[BaseModel] = DeleteEmailInput
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
        self._gmail.delete_email(message_id)

        return {
            "message_id": message_id,
            "status": "deleted",
        }
