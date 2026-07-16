from __future__ import annotations

import base64
from email.mime.text import MIMEText
from typing import Any

from googleapiclient.discovery import build

from app.models.user import User


class GmailTools:
    def __init__(self, user: User):
        self.user = user

        credentials = user.get_google_credentials()

        self.service = build(
            "gmail",
            "v1",
            credentials=credentials,
            cache_discovery=False,
        )

    def read_email(
        self,
        message_id: str,
    ) -> dict[str, Any]:
        return (
            self.service.users()
            .messages()
            .get(
                userId="me",
                id=message_id,
                format="full",
            )
            .execute()
        )

    def send_email(
        self,
        to: str,
        subject: str,
        body: str,
    ) -> dict[str, Any]:
        message = MIMEText(body)

        message["to"] = to
        message["subject"] = subject

        raw = base64.urlsafe_b64encode(
            message.as_bytes()
        ).decode()

        return (
            self.service.users()
            .messages()
            .send(
                userId="me",
                body={
                    "raw": raw,
                },
            )
            .execute()
        )

    def create_draft(
        self,
        to: str,
        subject: str,
        body: str,
    ) -> dict[str, Any]:
        message = MIMEText(body)

        message["to"] = to
        message["subject"] = subject

        raw = base64.urlsafe_b64encode(
            message.as_bytes()
        ).decode()

        return (
            self.service.users()
            .drafts()
            .create(
                userId="me",
                body={
                    "message": {
                        "raw": raw,
                    }
                },
            )
            .execute()
        )

    def archive_email(
        self,
        message_id: str,
    ) -> dict[str, Any]:
        return (
            self.service.users()
            .messages()
            .modify(
                userId="me",
                id=message_id,
                body={
                    "removeLabelIds": ["INBOX"],
                },
            )
            .execute()
        )

    def delete_email(
        self,
        message_id: str,
    ) -> None:
        (
            self.service.users()
            .messages()
            .delete(
                userId="me",
                id=message_id,
            )
            .execute()
        )

    def add_label(
        self,
        message_id: str,
        label_id: str,
    ) -> dict[str, Any]:
        return (
            self.service.users()
            .messages()
            .modify(
                userId="me",
                id=message_id,
                body={
                    "addLabelIds": [label_id],
                },
            )
            .execute()
        )

    def remove_label(
        self,
        message_id: str,
        label_id: str,
    ) -> dict[str, Any]:
        return (
            self.service.users()
            .messages()
            .modify(
                userId="me",
                id=message_id,
                body={
                    "removeLabelIds": [label_id],
                },
            )
            .execute()
        )

    def reply_email(
        self,
        thread_id: str,
        to: str,
        subject: str,
        body: str,
    ) -> dict:
        message = MIMEText(body)

        message["To"] = to

        if subject.lower().startswith("re:"):
            message["Subject"] = subject
        else:
            message["Subject"] = f"Re: {subject}"

        raw = base64.urlsafe_b64encode(
            message.as_bytes()
        ).decode()

        return (
            self.service.users()
            .messages()
            .send(
                userId="me",
                body={
                    "raw": raw,
                    "threadId": thread_id,
                },
            )
            .execute()
        )