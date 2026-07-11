from pydantic import BaseModel


class AskAIRequest(BaseModel):
    question: str


class AskAIResponse(BaseModel):
    question: str
    answer: str
    context: str