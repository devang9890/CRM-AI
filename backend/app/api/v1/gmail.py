from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.dependencies.current_user import get_current_user
from app.models.user import User
from app.repositories.email_details_repository import EmailDetailsRepository
from app.repositories.email_read_repository import EmailReadRepository
from app.schemas.email import EmailDetailResponse, EmailResponse
from app.services.gmail_service import GmailService
from app.services.gmail_sync_service import GmailSyncService

router = APIRouter(
    prefix="/gmail",
    tags=["Gmail"],
)


@router.get("/messages")
async def list_messages(
    max_results: int = 10,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    service = GmailService.get_client(current_user)

    if service._http.credentials.token != current_user.google_access_token:
        current_user.google_access_token = service._http.credentials.token

        if service._http.credentials.expiry:
            current_user.google_token_expiry = service._http.credentials.expiry

        db.commit()

    return GmailService.list_messages(
        current_user,
        max_results=max_results,
    )


@router.post("/sync")
async def sync_gmail(
    max_results: int = 25,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return GmailSyncService(db).sync(
        user=current_user,
        max_results=max_results,
    )


@router.get(
    "/emails",
    response_model=list[EmailResponse],
)
async def get_emails(
    limit: int = 50,
    offset: int = 0,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return EmailReadRepository(db).get_user_emails(
        user_id=current_user.id,
        limit=limit,
        offset=offset,
    )


@router.get(
    "/emails/{email_id}",
    response_model=EmailDetailResponse,
)
async def get_email(
    email_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    email = EmailDetailsRepository(db).get_email(
        user_id=current_user.id,
        email_id=email_id,
    )

    if email is None:
        raise HTTPException(
            status_code=404,
            detail="Email not found",
        )

    return email