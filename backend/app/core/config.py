import json
from typing import List, TYPE_CHECKING

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

if TYPE_CHECKING:
    BackendCorsOrigins = List[str]
else:
    BackendCorsOrigins = List[str] | str


class Settings(BaseSettings):
    # ==========================================
    # Application
    # ==========================================
    APP_NAME: str
    APP_VERSION: str
    APP_DESCRIPTION: str

    ENVIRONMENT: str
    DEBUG: bool

    API_V1_PREFIX: str

    # ==========================================
    # CORS
    # ==========================================
    BACKEND_CORS_ORIGINS: BackendCorsOrigins
    FRONTEND_URL: str

    # ==========================================
    # PostgreSQL
    # ==========================================
    DATABASE_HOST: str
    DATABASE_PORT: int
    DATABASE_NAME: str
    DATABASE_USER: str
    DATABASE_PASSWORD: str

    # ==========================================
    # JWT
    # ==========================================
    JWT_SECRET_KEY: str
    JWT_ALGORITHM: str = "HS256"
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = 15
    JWT_REFRESH_TOKEN_EXPIRE_DAYS: int = 30

    # ==========================================
    # Google OAuth
    # ==========================================
    GOOGLE_CLIENT_ID: str
    GOOGLE_CLIENT_SECRET: str
    GOOGLE_REDIRECT_URI: str
    DEV_RETURN_JSON_AUTH: bool = True

    model_config = SettingsConfigDict(
        env_file=".env",
        case_sensitive=True,
        extra="ignore"
    )

    @field_validator("BACKEND_CORS_ORIGINS", mode="before")
    @classmethod
    def parse_cors(cls, value):
        if isinstance(value, str):
            if value.startswith("[") and value.endswith("]"):
                try:
                    return json.loads(value)
                except Exception:
                    pass
            return [origin.strip() for origin in value.split(",")]
        return value


settings = Settings()