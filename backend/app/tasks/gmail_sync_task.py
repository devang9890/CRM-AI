from sqlalchemy.orm import Session

from app.db.session import SessionLocal
from app.models.user import User
from app.services.gmail_sync_service import GmailSyncService


def sync_all_users():
    db: Session = SessionLocal()

    try:
        users = (
            db.query(User)
            .filter(
                User.google_access_token.is_not(None),
                User.is_active.is_(True),
            )
            .all()
        )

        for user in users:
            try:
                GmailSyncService(db).sync(user=user)
            except Exception as e:
                print(
                    f"Gmail sync failed for user {user.id}: {e}"
                )

    finally:
        db.close()