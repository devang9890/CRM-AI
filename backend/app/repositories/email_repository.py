from sqlalchemy import and_, select
from sqlalchemy.orm import Session

from app.models.email import Email


class EmailRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_gmail_message_id(
        self,
        gmail_message_id: str,
    ) -> Email | None:
        result = self.db.execute(
            select(Email).where(
                Email.gmail_message_id == gmail_message_id
            )
        )
        return result.scalar_one_or_none()

    def get_by_user_and_gmail_message_id(
        self,
        user_id: int,
        gmail_message_id: str,
    ) -> Email | None:
        result = self.db.execute(
            select(Email).where(
                and_(
                    Email.user_id == user_id,
                    Email.gmail_message_id == gmail_message_id,
                )
            )
        )
        return result.scalar_one_or_none()

    def create(
        self,
        *,
        user_id: int,
        gmail_message_id: str,
        gmail_thread_id: str,
        subject: str | None,
        sender: str | None,
        recipients: str | None,
        cc: str | None,
        bcc: str | None,
        snippet: str | None,
        body_text: str | None,
        body_html: str | None,
        labels: str | None,
        is_unread: bool,
        internal_date: str | None,
        history_id: str | None,
    ) -> Email:

        email = Email(
            user_id=user_id,
            gmail_message_id=gmail_message_id,
            gmail_thread_id=gmail_thread_id,
            subject=subject,
            sender=sender,
            recipients=recipients,
            cc=cc,
            bcc=bcc,
            snippet=snippet,
            body_text=body_text,
            body_html=body_html,
            labels=labels,
            is_unread=is_unread,
            internal_date=internal_date,
            history_id=history_id,
        )

        self.db.add(email)
        self.db.commit()
        self.db.refresh(email)

        return email

    def update(
        self,
        email: Email,
    ) -> Email:
        self.db.commit()
        self.db.refresh(email)
        return email

    def save(
        self,
        email: Email,
    ) -> Email:
        self.db.add(email)
        self.db.commit()
        self.db.refresh(email)
        return email