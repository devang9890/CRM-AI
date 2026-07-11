from sqlalchemy.orm import Session
from langgraph.graph import END, StateGraph

from app.services.agent.nodes import AgentNodes
from app.services.agent.state import AgentState


class CRMAgent:
    def __init__(self, db: Session):
        nodes = AgentNodes(db)

        workflow = StateGraph(AgentState)

        workflow.add_node("retrieve", nodes.retrieve)
        workflow.add_node("generate", nodes.generate)

        workflow.set_entry_point("retrieve")

        workflow.add_edge("retrieve", "generate")
        workflow.add_edge("generate", END)

        self.graph = workflow.compile()

    def run(
        self,
        user_id: int,
        question: str,
    ) -> dict:
        result = self.graph.invoke(
            {
                "user_id": user_id,
                "question": question,
                "context": "",
                "answer": "",
            }
        )

        return result