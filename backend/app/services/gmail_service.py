from email.utils import parsedate_to_datetime

from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build

from app.core.config import settings
from app.models.user import User


class GmailService:
    @staticmethod
    def get_client(user: User):
        credentials = Credentials(
            token=user.google_access_token,
            refresh_token=user.google_refresh_token,
            token_uri="https://oauth2.googleapis.com/token",
            client_id=settings.GOOGLE_CLIENT_ID,
            client_secret=settings.GOOGLE_CLIENT_SECRET,
            scopes=user.google_scopes.split() if user.google_scopes else [],
        )

        if credentials.expired and credentials.refresh_token:
            credentials.refresh(Request())

            user.google_access_token = credentials.token

            if credentials.expiry:
                user.google_token_expiry = credentials.expiry

        return build(
            "gmail",
            "v1",
            credentials=credentials,
            cache_discovery=False,
        )

    @staticmethod
    def get_message(
        user: User,
        message_id: str,
    ):
        service = GmailService.get_client(user)

        return (
            service.users()
            .messages()
            .get(
                userId="me",
                id=message_id,
                format="full",
            )
            .execute()
        )

    @staticmethod
    def list_message_ids(
        user: User,
        max_results: int = 100,
    ):
        service = GmailService.get_client(user)

        response = (
            service.users()
            .messages()
            .list(
                userId="me",
                maxResults=max_results,
            )
            .execute()
        )

        return response.get("messages", [])

    @staticmethod
    def list_messages(
        user: User,
        max_results: int = 10,
    ):
        service = GmailService.get_client(user)

        response = (
            service.users()
            .messages()
            .list(
                userId="me",
                maxResults=max_results,
            )
            .execute()
        )

        messages = []

        for item in response.get("messages", []):
            message = (
                service.users()
                .messages()
                .get(
                    userId="me",
                    id=item["id"],
                    format="metadata",
                    metadataHeaders=[
                        "Subject",
                        "From",
                        "To",
                        "Date",
                    ],
                )
                .execute()
            )

            headers = {
                h["name"]: h["value"]
                for h in message.get("payload", {}).get("headers", [])
            }

            date = headers.get("Date")

            try:
                parsed_date = (
                    parsedate_to_datetime(date).isoformat()
                    if date
                    else None
                )
            except Exception:
                parsed_date = date

            messages.append(
                {
                    "id": message["id"],
                    "thread_id": message["threadId"],
                    "subject": headers.get("Subject"),
                    "from": headers.get("From"),
                    "to": headers.get("To"),
                    "date": parsed_date,
                    "snippet": message.get("snippet"),
                    "label_ids": message.get("labelIds", []),
                    "is_unread": "UNREAD" in message.get("labelIds", []),
                    "internal_date": message.get("internalDate"),
                }
            )

        return messages

    @staticmethod
    def list_history(
        user: User,
        history_id: str,
    ):
        service = GmailService.get_client(user)

        messages = []
        page_token = None

        while True:
            response = (
                service.users()
                .history()
                .list(
                    userId="me",
                    startHistoryId=history_id,
                    historyTypes=["messageAdded"],
                    pageToken=page_token,
                )
                .execute()
            )

            for history in response.get("history", []):
                for added in history.get("messagesAdded", []):
                    if "message" in added:
                        messages.append(added["message"])

            page_token = response.get("nextPageToken")
            if not page_token:
                break

        return messages