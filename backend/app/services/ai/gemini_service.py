from __future__ import annotations

import google.generativeai as genai

from app.core.config import settings


class GeminiService:
    def __init__(self):
        genai.configure(api_key=settings.gemini_api_key)
        self.model = genai.GenerativeModel(settings.gemini_model)

    def generate(self, prompt: str) -> str:
        response = self.model.generate_content(prompt)

        if not response:
            return ""

        text = getattr(response, "text", None)

        if text:
            return text.strip()

        candidates = getattr(response, "candidates", [])

        if candidates:
            parts = candidates[0].content.parts

            if parts:
                return "".join(
                    part.text
                    for part in parts
                    if hasattr(part, "text")
                ).strip()

        return ""