from authlib.integrations.starlette_client import OAuth
from google.auth.transport import requests
from google.oauth2 import id_token

from app.core.config import settings

oauth = OAuth()

oauth.register(
    name="google",
    client_id=settings.GOOGLE_CLIENT_ID,
    client_secret=settings.GOOGLE_CLIENT_SECRET,
    server_metadata_url="https://accounts.google.com/.well-known/openid-configuration",
    client_kwargs={
        "scope": (
            "openid "
            "email "
            "profile "
            "https://www.googleapis.com/auth/gmail.readonly "
            "https://www.googleapis.com/auth/gmail.modify "
            "https://www.googleapis.com/auth/gmail.send "
            "https://www.googleapis.com/auth/gmail.labels "
            "https://www.googleapis.com/auth/calendar.readonly "
            "https://www.googleapis.com/auth/calendar.events"
        )
    },
)


class GoogleOAuthService:

    @staticmethod
    async def get_authorization_redirect(request):
        return await oauth.google.authorize_redirect(
            request,
            settings.GOOGLE_REDIRECT_URI,
            access_type="offline",
            prompt="consent",
        )

    @staticmethod
    async def authenticate(request):

        token = await oauth.google.authorize_access_token(request)

        user = token.get("userinfo")

        if not user:
            id_info = id_token.verify_oauth2_token(
                token["id_token"],
                requests.Request(),
                settings.GOOGLE_CLIENT_ID,
            )

            user = {
                "sub": id_info["sub"],
                "email": id_info["email"],
                "name": id_info["name"],
                "picture": id_info.get("picture"),
                "email_verified": id_info.get("email_verified", False),
            }

        return {
            "google_id": user["sub"],
            "email": user["email"],
            "full_name": user["name"],
            "profile_picture": user.get("picture"),
            "email_verified": user.get("email_verified", False),

            # Google OAuth Tokens
            "google_access_token": token.get("access_token"),
            "google_refresh_token": token.get("refresh_token"),
            "google_token_expiry": token.get("expires_at"),
            "google_scopes": token.get("scope"),
        }