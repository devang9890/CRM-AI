from pydantic import BaseModel, ConfigDict, EmailStr

from app.schemas.token import TokenPair


class GoogleUser(BaseModel):
    google_id: str
    email: EmailStr
    full_name: str
    profile_picture: str | None = None
    email_verified: bool

    google_access_token: str | None = None
    google_refresh_token: str | None = None
    google_token_expiry: int | None = None
    google_scopes: str | None = None


class LoginResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class UserAuthResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    email: EmailStr
    full_name: str
    profile_picture: str | None = None
    email_verified: bool
    is_active: bool


class GoogleLoginJSONResponse(BaseModel):
    success: bool
    message: str
    user: UserAuthResponse
    tokens: TokenPair