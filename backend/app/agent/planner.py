from __future__ import annotations

from langchain_core.messages import SystemMessage

from app.agent.prompts import SYSTEM_PROMPT


def build_planner(llm):
    """
    Build the planner node function.
    """
    def planner_node(state):
        messages = [
            SystemMessage(content=SYSTEM_PROMPT),
            *state["messages"],
        ]

        response = llm.invoke(messages)

        return {
            "messages": [response],
        }

    return planner_node
