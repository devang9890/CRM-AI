from __future__ import annotations

import logging
from app.core.config import settings

logger = logging.getLogger(__name__)


def build_llm(tools):
    """
    Build the LLM model bound with available tools.
    Supports Groq (using ChatGroq) and Google Gemini (using ChatGoogleGenerativeAI).
    """
    # If Groq is configured, prioritize it
    if settings.groq_api_key:
        logger.info(f"Initializing ChatGroq with model {settings.groq_model}")
        from langchain_groq import ChatGroq
        
        llm = ChatGroq(
            model=settings.groq_model,
            groq_api_key=settings.groq_api_key,
            temperature=0,
            timeout=30,
            max_retries=2,
        )
    else:
        logger.info(f"Initializing ChatGoogleGenerativeAI with model {settings.gemini_model}")
        from langchain_google_genai import ChatGoogleGenerativeAI
        
        llm = ChatGoogleGenerativeAI(
            model=settings.gemini_model,
            google_api_key=settings.gemini_api_key,
            temperature=0,
            timeout=30,
            max_retries=2,
        )

    return llm.bind_tools(tools)