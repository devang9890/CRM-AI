from sqlalchemy.orm import Session

from app.models.user import User
from app.repositories.email_repository import EmailRepository
from app.services.gmail_parser import GmailParser
from app.services.gmail_service import GmailService


from app.services.embedding_service import EmbeddingService


class GmailSyncService:
    def __init__(self, db: Session):
        self.db = db
        self.repo = EmailRepository(db)

    def sync(
        self,
        user: User,
        max_results: int = 25,
    ):
        created = 0
        updated = 0
        embedding_service = EmbeddingService()

        if user.gmail_history_id:
            try:
                message_ids = GmailService.list_history(
                    user=user,
                    history_id=user.gmail_history_id,
                )
            except Exception as e:
                import logging
                logging.getLogger(__name__).warning(
                    f"Failed to fetch history for user {user.id}, falling back to full sync: {e}"
                )
                message_ids = GmailService.list_message_ids(
                    user=user,
                    max_results=max_results,
                )
        else:
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
                    embedding_service=embedding_service,
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

            self.repo.save(email, embedding_service=embedding_service)
            updated += 1

        service = GmailService.get_client(user)

        profile = (
            service.users()
            .getProfile(userId="me")
            .execute()
        )

        user.gmail_history_id = profile["historyId"]

        self.db.commit()

        return {
            "total": len(message_ids),
            "created": created,
            "updated": updated,
        }