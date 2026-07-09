from pydantic import BaseModel, ConfigDict


class EmailResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    gmail_message_id: str
    gmail_thread_id: str
    subject: str | None
    sender: str | None
    recipients: str | None
    snippet: str | None
    labels: str | None
    is_unread: bool
    internal_date: str | None


class EmailDetailResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    gmail_message_id: str
    gmail_thread_id: str

    subject: str | None

    sender: str | None
    recipients: str | None
    cc: str | None
    bcc: str | None

    snippet: str | None

    body_text: str | None
    body_html: str | None

    labels: str | None

    is_unread: bool

    internal_date: str | None
    history_id: str | None