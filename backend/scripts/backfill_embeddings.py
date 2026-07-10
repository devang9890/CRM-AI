import os
import sys

# Ensure backend directory is in the Python path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.db.database import SessionLocal
from app.models.email import Email
from app.services.embedding_service import EmbeddingService
from app.repositories.email_embedding_repository import EmailEmbeddingRepository


def sanitize_for_print(text: str | None) -> str:
    if not text:
        return ""
    encoding = sys.stdout.encoding or "utf-8"
    return text.encode(encoding, errors="replace").decode(encoding)


def main():
    db = SessionLocal()
    embedding_service = EmbeddingService()
    embedding_repo = EmailEmbeddingRepository(db)

    try:
        # Load emails where embedding is NULL
        emails = (
            db.query(Email)
            .filter(Email.embedding.is_(None))
            .all()
        )

        total_emails = len(emails)
        print(f"Found {total_emails} emails with missing embeddings.")

        if total_emails == 0:
            print("All emails already have embeddings. Nothing to do!")
            return

        for index, email in enumerate(emails, start=1):
            subject_safe = sanitize_for_print(email.subject)
            print(
                f"[{index}/{total_emails}] Processing email ID {email.id} (Subject: {subject_safe})...",
                end="",
                flush=True,
            )
            try:
                # Generate embedding
                embedding = embedding_service.embed(
                    subject=email.subject,
                    sender=email.sender,
                    body=email.body_text or email.snippet,
                )

                # Save embedding to PostgreSQL using Repository
                embedding_repo.update_embedding(email.id, embedding)
                print(" Done.")
            except Exception as inner_err:
                print(f" Failed: {inner_err}")

        print("Embeddings backfill completed successfully.")

    except Exception as e:
        print(f"An error occurred: {e}", file=sys.stderr)
    finally:
        db.close()


if __name__ == "__main__":
    main()
