from __future__ import annotations

from typing import Type
from pydantic import BaseModel, Field, PrivateAttr

from app.models.user import User
from app.services.gmail_tools import GmailTools
from app.tools.base import CRMTool


class LabelEmailInput(BaseModel):
    message_id: str = Field(..., description="Gmail message ID to modify labels on")
    add_labels: list[str] = Field(default_factory=list, description="List of labels to add")
    remove_labels: list[str] = Field(default_factory=list, description="List of labels to remove")


class LabelEmailTool(CRMTool):
    name: str = "label_email"
    description: str = "Add or remove labels from a Gmail email message."

    args_schema: Type[BaseModel] = LabelEmailInput
    _user: User = PrivateAttr()
    _gmail: GmailTools = PrivateAttr()

    def __init__(self, user: User):
        super().__init__()
        self._user = user
        self._gmail = GmailTools(user)

    def _run(
        self,
        message_id: str,
        add_labels: list[str] | None = None,
        remove_labels: list[str] | None = None,
    ) -> dict:
        add_labels = add_labels or []
        remove_labels = remove_labels or []

        for label in add_labels:
            self._gmail.add_label(
                message_id=message_id,
                label_id=label,
            )

        for label in remove_labels:
            self._gmail.remove_label(
                message_id=message_id,
                label_id=label,
            )

        return {
            "message_id": message_id,
            "added_labels": add_labels,
            "removed_labels": remove_labels,
            "status": "labels_updated",
        }
