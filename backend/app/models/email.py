from sqlalchemy import Boolean, ForeignKey, Index, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base_model import BaseModel


class Email(BaseModel):
    __tablename__ = "emails"

    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    gmail_message_id: Mapped[str] = mapped_column(
        String(255),
        unique=True,
        nullable=False,
        index=True,
    )

    gmail_thread_id: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
        index=True,
    )

    subject: Mapped[str | None] = mapped_column(
        String(1000),
        nullable=True,
    )

    sender: Mapped[str | None] = mapped_column(
        String(500),
        nullable=True,
    )

    recipients: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    cc: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    bcc: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    snippet: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    body_text: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    body_html: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    labels: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    is_unread: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False,
    )

    internal_date: Mapped[str | None] = mapped_column(
        String(50),
        nullable=True,
    )

    history_id: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
    )

    user = relationship(
        "User",
        back_populates="emails",
    )


Index("ix_emails_user_thread", Email.user_id, Email.gmail_thread_id)
Index("ix_emails_user_sender", Email.user_id, Email.sender)