from __future__ import annotations

import logging
from sqlalchemy.orm import Session
from langchain_core.messages import HumanMessage, ToolMessage

from app.agent.graph import build_graph
from app.agent.memory import memory
from app.agent.model import build_llm
from app.tools.registry import build_tool_registry
from app.models.user import User

logger = logging.getLogger(__name__)


class CRMAgent:
    """
    Main agent class that coordinates reasoning, tool execution, checkpointing,
    and human-in-the-loop approval.
    """

    def __init__(
        self,
        user: User,
        db: Session,
    ):
        self.user = user
        self.db = db

        # Build tool registry and list of tools
        registry = build_tool_registry(user, db)
        self.tools = registry.all()

        # Build LLM bound with tools
        self.llm = build_llm(self.tools)

        # Assemble compiled graph
        self.graph = build_graph(
            llm=self.llm,
            tools=self.tools,
            checkpointer=memory,
        )

    def invoke(
        self,
        question: str,
        thread_id: str,
    ) -> str:
        config = {
            "configurable": {
                "thread_id": thread_id,
            }
        }

        # 1. Fetch current thread state
        state = self.graph.get_state(config)

        # 2. Check if we are resumed from a write-tool confirmation interrupt
        if state.next and "tools" in state.next:
            clean_input = question.strip().lower()

            if clean_input in ["yes", "confirm", "proceed", "y", "ok", "go ahead"]:
                logger.info(f"User approved execution of pending tools for thread {thread_id}")
                # User confirmed, resume the graph
                self.graph.invoke(None, config)
            elif clean_input in ["no", "cancel", "stop", "n"]:
                logger.info(f"User denied execution of pending tools for thread {thread_id}")
                # User cancelled. Inject tool cancellation messages
                last_message = state.values["messages"][-1]
                tool_calls = getattr(last_message, "tool_calls", [])

                cancel_messages = [
                    ToolMessage(
                        content="Action cancelled by user.",
                        tool_call_id=tc["id"],
                        name=tc.get("name"),
                        status="error",
                    )
                    for tc in tool_calls
                ]

                # Pass cancellation messages to the graph and resume
                self.graph.invoke(
                    {"messages": cancel_messages},
                    config,
                )
            else:
                return "Please reply with 'yes' to confirm and proceed, or 'no' to cancel."
        else:
            # 3. New request, invoke the graph with the user's message
            self.graph.invoke(
                {
                    "messages": [HumanMessage(content=question)],
                    "user_id": self.user.id,
                },
                config,
            )

        # 4. Process loop for handling checkpointer interrupts and read-only tools auto-resume
        write_tools = [
            "send_email",
            "reply_email",
            "draft_email",
            "delete_email",
            "archive_email",
            "label_email",
        ]

        while True:
            state = self.graph.get_state(config)

            # If graph is not at an interrupt point or has finished, stop
            if not state.next or "tools" not in state.next:
                break

            last_message = state.values["messages"][-1]
            tool_calls = getattr(last_message, "tool_calls", [])

            # Check if any tool call requires human confirmation
            requires_confirm = any(tc.get("name") in write_tools for tc in tool_calls)

            if requires_confirm:
                # Compile a human-readable summary of the actions needing approval
                pending_actions = []
                for tc in tool_calls:
                    name = tc.get("name")
                    args = tc.get("args", {})
                    if name in write_tools:
                        if name == "send_email":
                            pending_actions.append(f"Send email to {args.get('to')} with subject '{args.get('subject')}'")
                        elif name == "reply_email":
                            pending_actions.append(f"Reply to thread {args.get('thread_id')} (To: {args.get('to')}, Subject: '{args.get('subject')}')")
                        elif name == "draft_email":
                            pending_actions.append(f"Create draft email to {args.get('to')} with subject '{args.get('subject')}'")
                        elif name == "delete_email":
                            pending_actions.append(f"Delete email message ID {args.get('message_id')}")
                        elif name == "archive_email":
                            pending_actions.append(f"Archive email message ID {args.get('message_id')}")
                        elif name == "label_email":
                            pending_actions.append(f"Modify labels for email {args.get('message_id')} (Add: {args.get('add_labels')}, Remove: {args.get('remove_labels')})")
                    else:
                        pending_actions.append(f"Run read/search tool '{name}'")

                actions_str = "\n- ".join(pending_actions)
                return (
                    f"I need your confirmation to perform the following action(s):\n- {actions_str}\n\n"
                    "Do you want to proceed? (yes/no)"
                )
            else:
                # All pending tool calls are read-only; auto-resume graph execution immediately
                self.graph.invoke(None, config)

        # 5. Graph execution finished. Return final response
        state = self.graph.get_state(config)
        messages = state.values.get("messages", [])
        if messages:
            return messages[-1].content

        return "No response generated."