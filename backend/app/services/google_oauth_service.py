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
        "scope": "openid email profile",
    },
)


class GoogleOAuthService:
    @staticmethod
    async def get_authorization_redirect(request):
        redirect_uri = settings.GOOGLE_REDIRECT_URI

        return await oauth.google.authorize_redirect(
            request,
            redirect_uri,
        )

    @staticmethod
    async def authenticate(request):
        token = await oauth.google.authorize_access_token(request)

        user = token.get("userinfo")

        if user:
            return {
                "google_id": user["sub"],
                "email": user["email"],
                "full_name": user["name"],
                "profile_picture": user.get("picture"),
                "email_verified": user.get("email_verified", False),
            }

        id_info = id_token.verify_oauth2_token(
            token["id_token"],
            requests.Request(),
            settings.GOOGLE_CLIENT_ID,
        )

        return {
            "google_id": id_info["sub"],
            "email": id_info["email"],
            "full_name": id_info["name"],
            "profile_picture": id_info.get("picture"),
            "email_verified": id_info.get("email_verified", False),
        }