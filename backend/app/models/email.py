from datetime import datetime

from pgvector.sqlalchemy import Vector
from sqlalchemy import (
    Boolean,
    DateTime,
    ForeignKey,
    Index,
    String,
    Text,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.database import Base


class Email(Base):
    __tablename__ = "emails"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)

    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        index=True,
    )

    gmail_message_id: Mapped[str] = mapped_column(
        String(255),
        unique=True,
        index=True,
        nullable=False,
    )

    gmail_thread_id: Mapped[str] = mapped_column(
        String(255),
        index=True,
        nullable=False,
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
        default=True,
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

    embedding: Mapped[list[float] | None] = mapped_column(
        Vector(384),
        nullable=True,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=datetime.utcnow,
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
    )

    user = relationship("User", back_populates="emails")


# Define model indexes matching the PostgreSQL database schema
Index("ix_emails_user_sender", Email.user_id, Email.sender)
Index("ix_emails_user_thread", Email.user_id, Email.gmail_thread_id)