from __future__ import annotations

from langgraph.graph import StateGraph, START, END

from app.agent.state import AgentState
from app.agent.planner import build_planner
from app.agent.executor import build_executor
from app.agent.router import route


def build_graph(
    llm,
    tools,
    checkpointer=None,
):
    """
    Build and compile the LangGraph workflow.
    Interrupts execution before running any tools to allow human approval check.
    """
    workflow = StateGraph(AgentState)

    workflow.add_node(
        "planner",
        build_planner(llm),
    )

    workflow.add_node(
        "tools",
        build_executor(tools),
    )

    workflow.add_edge(
        START,
        "planner",
    )

    workflow.add_conditional_edges(
        "planner",
        route,
        {
            "tools": "tools",
            END: END,
        },
    )

    workflow.add_edge(
        "tools",
        "planner",
    )

    return workflow.compile(
        checkpointer=checkpointer,
        interrupt_before=["tools"],
    )