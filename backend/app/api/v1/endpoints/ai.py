from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.dependencies.current_user import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.schemas.ai_schema import AskAIRequest, AskAIResponse
from app.services.ai.rag_service import RAGService

router = APIRouter(prefix="/ai", tags=["AI"])


@router.post(
    "/ask",
    response_model=AskAIResponse,
)
def ask_ai(
    request: AskAIRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    service = RAGService(db)

    result = service.ask(
        user_id=current_user.id,
        question=request.question,
    )

    return AskAIResponse(**result)