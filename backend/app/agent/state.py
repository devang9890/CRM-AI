from __future__ import annotations

from langgraph.graph import MessagesState


class AgentState(MessagesState):
    """
    Global state shared across the CRM LangGraph workflow.
    Inherits 'messages' from MessagesState.
    """

    # Authenticated user ID
    user_id: int

    # Retrieved RAG/semantic search context
    context: str

    # Whether a tool requires human confirmation
    requires_confirmation: bool

    # Pending tool name if interrupted
    pending_tool: str | None

    # Pending tool arguments if interrupted
    pending_tool_args: dict

    # Final response for the API
    final_response: str
