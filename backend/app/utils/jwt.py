from app.core.security import (
    create_access_token,
    create_refresh_token,
    verify_access_token,
    verify_refresh_token,
)


class JWTManager:
    @staticmethod
    def generate_access_token(user_id: str) -> str:
        return create_access_token(subject=user_id)

    @staticmethod
    def generate_refresh_token(user_id: str) -> str:
        return create_refresh_token(subject=user_id)

    @staticmethod
    def generate_token_pair(user_id: str) -> dict[str, str]:
        access_token = create_access_token(subject=user_id)
        refresh_token = create_refresh_token(subject=user_id)

        return {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "bearer",
        }

    @staticmethod
    def verify_access(token: str) -> dict:
        return verify_access_token(token)

    @staticmethod
    def verify_refresh(token: str) -> dict:
        return verify_refresh_token(token)