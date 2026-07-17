from fastapi import APIRouter, Depends, HTTPException, status

from app.core.logger import logger
from app.dependencies.current_user import get_current_user
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
):
    try:
        service = RAGService(current_user)

        result = service.ask(
            question=request.question,
            thread_id=str(current_user.id),
        )

        return AskAIResponse(
            question=request.question,
            answer=result["answer"],
            context="",
        )
    except Exception as e:
        error_msg = str(e).lower()
        logger.error(f"AI ask error: {repr(e)}")

        # Handle Gemini API overload / unavailability
        if "503" in str(e) or "unavailable" in error_msg or "overloaded" in error_msg:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="The AI model is temporarily unavailable due to high demand. Please try again in a few seconds.",
            )

        # Handle rate limiting
        if "429" in str(e) or "rate" in error_msg or "quota" in error_msg:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Too many requests to the AI model. Please wait a moment and try again.",
            )

        # Handle invalid API key
        if "401" in str(e) or "api key" in error_msg or "authentication" in error_msg:
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail="AI service authentication failed. Please check your API key configuration.",
            )

        # Generic fallback
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred while processing your request. Please try again.",
        )