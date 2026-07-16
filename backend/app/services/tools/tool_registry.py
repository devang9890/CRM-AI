from __future__ import annotations

from app.models.user import User
from app.services.tools.archive_email_tool import ArchiveEmailTool
from app.services.tools.delete_email_tool import DeleteEmailTool
from app.services.tools.draft_email_tool import DraftEmailTool
from app.services.tools.label_email_tool import LabelEmailTool
from app.services.tools.read_email_tool import ReadEmailTool
from app.services.tools.reply_email_tool import ReplyEmailTool
from app.services.tools.send_email_tool import SendEmailTool


class ToolRegistry:
    def __init__(self, user: User):
        self.tools = {
            "read_email": ReadEmailTool(user),
            "send_email": SendEmailTool(user),
            "draft_email": DraftEmailTool(user),
            "reply_email": ReplyEmailTool(user),
            "archive_email": ArchiveEmailTool(user),
            "delete_email": DeleteEmailTool(user),
            "label_email": LabelEmailTool(user),
        }

    def get(self, name: str):
        return self.tools[name]

    def list(self):
        return [
            {
                "name": tool.name,
                "description": tool.description,
            }
            for tool in self.tools.values()
        ]