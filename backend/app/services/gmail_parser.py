import base64
import re
from html import unescape


class GmailParser:
    @staticmethod
    def _decode(data: str | None) -> str | None:
        if not data:
            return None

        try:
            padding = "=" * (-len(data) % 4)

            return (
                base64.urlsafe_b64decode(data + padding)
                .decode("utf-8", errors="ignore")
            )
        except Exception:
            return None

    @staticmethod
    def _html_to_text(html: str | None) -> str | None:
        if not html:
            return None

        text = re.sub(
            r"<(script|style).*?>.*?</\1>",
            "",
            html,
            flags=re.DOTALL | re.IGNORECASE,
        )

        text = re.sub(r"<[^>]+>", " ", text)

        text = unescape(text)

        text = re.sub(r"\s+", " ", text).strip()

        return text

    @classmethod
    def _extract(cls, payload):
        text = None
        html = None

        mime = payload.get("mimeType", "")

        body = payload.get("body", {})

        if mime == "text/plain":
            text = cls._decode(body.get("data"))

        elif mime == "text/html":
            html = cls._decode(body.get("data"))

        for part in payload.get("parts", []):

            part_text, part_html = cls._extract(part)

            if part_text and not text:
                text = part_text

            if part_html and not html:
                html = part_html

        if not text and html:
            text = cls._html_to_text(html)

        return text, html

    @classmethod
    def parse(cls, message: dict):
        payload = message.get("payload", {})

        headers = {
            h["name"]: h["value"]
            for h in payload.get("headers", [])
        }

        text, html = cls._extract(payload)

        return {
            "gmail_message_id": message["id"],
            "gmail_thread_id": message["threadId"],
            "subject": headers.get("Subject"),
            "sender": headers.get("From"),
            "recipients": headers.get("To"),
            "cc": headers.get("Cc"),
            "bcc": headers.get("Bcc"),
            "snippet": message.get("snippet"),
            "body_text": text,
            "body_html": html,
            "labels": ",".join(message.get("labelIds", [])),
            "is_unread": "UNREAD" in message.get("labelIds", []),
            "internal_date": message.get("internalDate"),
            "history_id": message.get("historyId"),
        }