from __future__ import annotations

from langchain_core.tools import BaseTool


class ToolRegistry:
    """
    Registry for organizing and accessing langchain tools.
    """

    def __init__(self):
        self._tools: dict[str, BaseTool] = {}

    def register(self, tool: BaseTool):
        self._tools[tool.name] = tool

    def get(self, name: str) -> BaseTool:
        return self._tools[name]

    def all(self) -> list[BaseTool]:
        return list(self._tools.values())