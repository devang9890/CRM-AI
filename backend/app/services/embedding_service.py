from functools import lru_cache
from typing import Any


MODEL_NAME = "sentence-transformers/all-MiniLM-L6-v2"


@lru_cache
def get_embedding_model() -> Any:
    from sentence_transformers import SentenceTransformer
    return SentenceTransformer(MODEL_NAME)


class EmbeddingService:
    @property
    def model(self):
        return get_embedding_model()

    def build_text(
        self,
        subject: str | None,
        sender: str | None,
        body: str | None,
    ) -> str:
        return "\n".join(
            filter(
                None,
                [
                    subject or "",
                    sender or "",
                    body or "",
                ],
            )
        )

    def embed(
        self,
        subject: str | None,
        sender: str | None,
        body: str | None,
    ) -> list[float]:

        text = self.build_text(subject, sender, body)

        if not text.strip():
            return [0.0] * 384

        vector = self.model.encode(
            text,
            normalize_embeddings=True,
            convert_to_numpy=True,
        )

        return vector.astype(float).tolist()

    def embed_query(self, query: str) -> list[float]:
        vector = self.model.encode(
            query,
            normalize_embeddings=True,
        )

        return vector.tolist()