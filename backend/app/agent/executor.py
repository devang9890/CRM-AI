from __future__ import annotations

from langgraph.prebuilt import ToolNode


def build_executor(tools):
    """
    Build the tools execution node.
    """
    return ToolNode(tools)