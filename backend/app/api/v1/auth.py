from urllib.parse import urlencode

from fastapi import APIRouter, Depends, HTTPException, Request, Response, status
from fastapi.responses import JSONResponse, RedirectResponse
from sqlalchemy.orm import Session

from app.core.config import settings
from app.db.session import get_db
from app.schemas.auth import GoogleUser, GoogleLoginJSONResponse, UserAuthResponse
from app.services.auth_service import AuthService
from app.services.google_oauth_service import GoogleOAuthService

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

    # Keep host consistent (localhost vs 127.0.0.1)
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

    return await GoogleOAuthService.get_authorization_redirect(
        request
    )


@router.get(
    "/google/callback",
    responses={
        302: {"description": "Redirects to the frontend callback URL"},
        200: {"model": GoogleLoginJSONResponse}
    }
)
async def google_callback(
    request: Request,
    db: Session = Depends(get_db),
):
    """
    Google redirects here after successful login.
    """

    google_user_data = await GoogleOAuthService.authenticate(
        request
    )

    google_user = GoogleUser(**google_user_data)

    auth_service = AuthService(db)

    tokens = auth_service.login_with_google(
        google_user
    )

    if settings.DEV_RETURN_JSON_AUTH:
        user_auth_resp = UserAuthResponse.model_validate(tokens["user"])
        payload = GoogleLoginJSONResponse(
            success=True,
            message="Google login successful",
            user=user_auth_resp,
            tokens={
                "access_token": tokens["access_token"],
                "refresh_token": tokens["refresh_token"],
                "token_type": "bearer",
            }
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

    # Set Access Token cookie
    response.set_cookie(
        key="access_token",
        value=tokens["access_token"],
        httponly=True,
        secure=is_production,
        samesite="lax",
        max_age=settings.JWT_ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        path="/",
    )

    # Set Refresh Token cookie
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


@router.post("/logout")
async def logout(response: Response):
    """
    Clear access and refresh token cookies.
    """
    is_production = settings.ENVIRONMENT == "production"

    response.delete_cookie(
        "access_token",
        path="/",
        httponly=True,
        secure=is_production,
        samesite="lax",
    )
    response.delete_cookie(
        "refresh_token",
        path="/",
        httponly=True,
        secure=is_production,
        samesite="lax",
    )
    return {"message": "Successfully logged out"}


@router.post("/refresh")
async def refresh_token(
    request: Request,
    response: Response,
    db: Session = Depends(get_db),
):
    """
    Refresh access token using refresh token from cookies.
    """
    refresh_token = request.cookies.get("refresh_token")
    if not refresh_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token missing",
        )

    auth_service = AuthService(db)
    try:
        new_tokens = auth_service.refresh_session(refresh_token)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(e),
        )

    is_production = settings.ENVIRONMENT == "production"

    response.set_cookie(
        key="access_token",
        value=new_tokens["access_token"],
        httponly=True,
        secure=is_production,
        samesite="lax",
        max_age=settings.JWT_ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        path="/",
    )

    if "refresh_token" in new_tokens:
        response.set_cookie(
            key="refresh_token",
            value=new_tokens["refresh_token"],
            httponly=True,
            secure=is_production,
            samesite="lax",
            max_age=settings.JWT_REFRESH_TOKEN_EXPIRE_DAYS * 24 * 60 * 60,
            path="/",
        )

    return {"message": "Token refreshed successfully"}