from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.dependencies.current_user import get_current_user
from app.models.user import User
from app.services.semantic_search_service import (
    SemanticSearchService,
)

router = APIRouter(
    prefix="/semantic-search",
    tags=["Semantic Search"],
)


@router.get("")
def semantic_search(
    query: str = Query(...),
    limit: int = Query(10),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    emails = SemanticSearchService(db).search(
        user_id=current_user.id,
        query=query,
        limit=limit,
    )

    return emails