from __future__ import annotations

from app.models.user import User
from app.services.tools.base_tool import BaseTool
from app.services.tools.gmail_tools import GmailTools


class LabelEmailTool(BaseTool):
    name = "label_email"

    description = (
        "Add or remove Gmail labels."
    )

    def __init__(self, user: User):
        self.gmail = GmailTools(user)

    def invoke(
        self,
        message_id: str,
        add_labels: list[str] | None = None,
        remove_labels: list[str] | None = None,
    ) -> dict:
        add_labels = add_labels or []
        remove_labels = remove_labels or []

        for label in add_labels:
            self.gmail.add_label(
                message_id=message_id,
                label_id=label,
            )

        for label in remove_labels:
            self.gmail.remove_label(
                message_id=message_id,
                label_id=label,
            )

        return {
            "message_id": message_id,
            "added_labels": add_labels,
            "removed_labels": remove_labels,
            "status": "updated",
        }