from typing import TypedDict


class AgentState(TypedDict):
    user_id: int
    question: str
    context: str
    answer: str