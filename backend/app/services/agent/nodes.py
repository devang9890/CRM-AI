from sqlalchemy.orm import Session

from app.services.ai.context_builder import ContextBuilder
from app.services.ai.gemini_service import GeminiService
from app.services.ai.prompt_builder import PromptBuilder
from app.services.agent.state import AgentState


class AgentNodes:
    def __init__(self, db: Session):
        self.context_builder = ContextBuilder(db)
        self.gemini = GeminiService()

    def retrieve(self, state: AgentState) -> AgentState:
        context = self.context_builder.build(
            user_id=state["user_id"],
            question=state["question"],
        )

        state["context"] = context
        return state

    def generate(self, state: AgentState) -> AgentState:
        prompt = PromptBuilder.build(
            question=state["question"],
            context=state["context"],
        )

        state["answer"] = self.gemini.generate(prompt)

        return state