from fastapi import APIRouter, Depends, HTTPException, Request, Response, status
from fastapi.responses import JSONResponse, RedirectResponse
from sqlalchemy.orm import Session

from app.core.config import settings
from app.db.session import get_db
from app.dependencies.current_user import get_current_user
from app.models.user import User
from app.schemas.auth import (
    GoogleLoginJSONResponse,
    GoogleUser,
    UserAuthResponse,
)
from app.services.auth_service import AuthService
from app.services.google_oauth_service import GoogleOAuthService
from app.services.token_service import TokenService

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"],
)


@router.get("/google/login")
async def google_login(request: Request):
    """
    Redirect user to Google OAuth consent screen.
    """

    redirect_uri = settings.GOOGLE_REDIRECT_URI

    if "localhost" in redirect_uri and request.url.hostname == "127.0.0.1":
        port = f":{request.url.port}" if request.url.port else ""
        return RedirectResponse(
            f"{request.url.scheme}://localhost{port}{request.url.path}"
        )

    if "127.0.0.1" in redirect_uri and request.url.hostname == "localhost":
        port = f":{request.url.port}" if request.url.port else ""
        return RedirectResponse(
            f"{request.url.scheme}://127.0.0.1{port}{request.url.path}"
        )

    return await GoogleOAuthService.get_authorization_redirect(request)


@router.get(
    "/google/callback",
    responses={
        302: {"description": "Redirects to frontend"},
        200: {"model": GoogleLoginJSONResponse},
    },
)
async def google_callback(
    request: Request,
    db: Session = Depends(get_db),
):
    google_user_data = await GoogleOAuthService.authenticate(request)

    google_user = GoogleUser(**google_user_data)

    auth_service = AuthService(db)

    tokens = auth_service.login_with_google(google_user)

    if settings.DEV_RETURN_JSON_AUTH:
        payload = GoogleLoginJSONResponse(
            success=True,
            message="Google login successful",
            user=UserAuthResponse.model_validate(tokens["user"]),
            tokens={
                "access_token": tokens["access_token"],
                "refresh_token": tokens["refresh_token"],
                "token_type": "bearer",
            },
        )

        response = JSONResponse(
            status_code=status.HTTP_200_OK,
            content=payload.model_dump(mode="json"),
        )

    else:
        response = RedirectResponse(
            url=f"{settings.FRONTEND_URL}/auth/callback",
            status_code=status.HTTP_302_FOUND,
        )

    is_production = settings.ENVIRONMENT == "production"

    response.set_cookie(
        key="access_token",
        value=tokens["access_token"],
        httponly=True,
        secure=is_production,
        samesite="lax",
        max_age=settings.JWT_ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        path="/",
    )

    response.set_cookie(
        key="refresh_token",
        value=tokens["refresh_token"],
        httponly=True,
        secure=is_production,
        samesite="lax",
        max_age=settings.JWT_REFRESH_TOKEN_EXPIRE_DAYS * 24 * 60 * 60,
        path="/",
    )

    return response


@router.post("/refresh")
async def refresh_token(
    request: Request,
    response: Response,
    db: Session = Depends(get_db),
):
    refresh_token = request.cookies.get("refresh_token")

    if not refresh_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token missing",
        )

    tokens = TokenService.rotate_refresh_token(db, refresh_token)

    if not tokens:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token",
        )

    is_production = settings.ENVIRONMENT == "production"

    response.set_cookie(
        key="access_token",
        value=tokens["access_token"],
        httponly=True,
        secure=is_production,
        samesite="lax",
        max_age=settings.JWT_ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        path="/",
    )

    response.set_cookie(
        key="refresh_token",
        value=tokens["refresh_token"],
        httponly=True,
        secure=is_production,
        samesite="lax",
        max_age=settings.JWT_REFRESH_TOKEN_EXPIRE_DAYS * 24 * 60 * 60,
        path="/",
    )

    return {
        "message": "Token refreshed successfully"
    }


@router.post("/logout")
async def logout(
    request: Request,
    response: Response,
    db: Session = Depends(get_db),
):
    refresh_token = request.cookies.get("refresh_token")

    if refresh_token:
        TokenService.revoke_refresh_token(db, refresh_token)

    is_production = settings.ENVIRONMENT == "production"

    response.delete_cookie(
        key="access_token",
        path="/",
        httponly=True,
        secure=is_production,
        samesite="lax",
    )

    response.delete_cookie(
        key="refresh_token",
        path="/",
        httponly=True,
        secure=is_production,
        samesite="lax",
    )

    return {
        "message": "Logged out successfully"
    }


@router.get("/me", response_model=UserAuthResponse)
async def get_me(
    current_user: User = Depends(get_current_user),
):
    return current_user