from datetime import datetime

from pgvector.sqlalchemy import Vector
from sqlalchemy import (
    BigInteger,
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

    id: Mapped[int] = mapped_column(primary_key=True)

    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        index=True,
    )

    gmail_id: Mapped[str] = mapped_column(String(255), unique=True, index=True)

    thread_id: Mapped[str] = mapped_column(String(255), index=True)

    history_id: Mapped[int] = mapped_column(BigInteger)

    subject: Mapped[str | None] = mapped_column(String(1000))

    sender: Mapped[str | None] = mapped_column(String(500))

    recipients: Mapped[str | None] = mapped_column(Text)

    cc: Mapped[str | None] = mapped_column(Text)

    bcc: Mapped[str | None] = mapped_column(Text)

    snippet: Mapped[str | None] = mapped_column(Text)

    body_plain: Mapped[str | None] = mapped_column(Text)

    body_html: Mapped[str | None] = mapped_column(Text)

    sent_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))

    is_read: Mapped[bool] = mapped_column(Boolean, default=False)

    labels: Mapped[str | None] = mapped_column(Text)

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


Index("ix_email_user_thread", Email.user_id, Email.thread_id)
Index("ix_email_user_sent", Email.user_id, Email.sent_at)