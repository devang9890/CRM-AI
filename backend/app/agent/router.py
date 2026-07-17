from __future__ import annotations

from langgraph.graph import END


def route(state):
    """
    Route based on whether the last message contains tool calls.
    """
    last = state["messages"][-1]

    if getattr(last, "tool_calls", None):
        return "tools"

    return END