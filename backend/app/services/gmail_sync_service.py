from sqlalchemy.orm import Session

from app.models.user import User
from app.repositories.email_repository import EmailRepository
from app.services.gmail_parser import GmailParser
from app.services.gmail_service import GmailService


class GmailSyncService:
    def __init__(self, db: Session):
        self.db = db
        self.repo = EmailRepository(db)

    def sync(
        self,
        user: User,
        max_results: int = 100,
    ):
        created = 0
        updated = 0

        message_ids = GmailService.list_message_ids(
            user=user,
            max_results=max_results,
        )

        for item in message_ids:
            gmail = GmailService.get_message(
                user=user,
                message_id=item["id"],
            )

            parsed = GmailParser.parse(gmail)

            email = self.repo.get_by_user_and_gmail_message_id(
                user.id,
                parsed["gmail_message_id"],
            )

            if email is None:
                self.repo.create(
                    user_id=user.id,
                    **parsed,
                )
                created += 1
                continue

            email.gmail_thread_id = parsed["gmail_thread_id"]
            email.subject = parsed["subject"]
            email.sender = parsed["sender"]
            email.recipients = parsed["recipients"]
            email.cc = parsed["cc"]
            email.bcc = parsed["bcc"]
            email.snippet = parsed["snippet"]
            email.body_text = parsed["body_text"]
            email.body_html = parsed["body_html"]
            email.labels = parsed["labels"]
            email.is_unread = parsed["is_unread"]
            email.internal_date = parsed["internal_date"]
            email.history_id = parsed["history_id"]

            self.repo.save(email)
            updated += 1

        return {
            "total": len(message_ids),
            "created": created,
            "updated": updated,
        }