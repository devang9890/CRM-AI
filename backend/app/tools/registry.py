from __future__ import annotations

from sqlalchemy.orm import Session

from app.agent.registry import ToolRegistry
from app.models.user import User
from app.tools.gmail.read import ReadEmailTool
from app.tools.gmail.send import SendEmailTool
from app.tools.gmail.reply import ReplyEmailTool
from app.tools.gmail.draft import DraftEmailTool
from app.tools.gmail.archive import ArchiveEmailTool
from app.tools.gmail.delete import DeleteEmailTool
from app.tools.gmail.labels import LabelEmailTool
from app.tools.semantic_search.search import SemanticSearchTool


def build_tool_registry(user: User, db: Session) -> ToolRegistry:
    registry = ToolRegistry()

    registry.register(ReadEmailTool(user))
    registry.register(SendEmailTool(user))
    registry.register(ReplyEmailTool(user))
    registry.register(DraftEmailTool(user))
    registry.register(ArchiveEmailTool(user))
    registry.register(DeleteEmailTool(user))
    registry.register(LabelEmailTool(user))
    registry.register(SemanticSearchTool(db, user))

    return registry
