from fastapi import APIRouter, Depends

from app.dependencies.current_user import get_current_user
from app.models.user import User
from app.schemas.auth import UserAuthResponse

router = APIRouter(
    prefix="/users",
    tags=["Users"],
)


@router.get("/me", response_model=UserAuthResponse)
async def get_current_logged_in_user(
    current_user: User = Depends(get_current_user),
):
    return current_user