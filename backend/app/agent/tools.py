from app.agent.registry import ToolRegistry
from app.models.user import User

from app.services.tools.gmail.read import ReadEmailTool


def build_tool_registry(user: User) -> ToolRegistry:
    registry = ToolRegistry()

    registry.register(ReadEmailTool(user))

    return registry