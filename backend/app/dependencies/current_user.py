from fastapi import Depends, HTTPException, Request, status
from jose import JWTError, jwt
from sqlalchemy.orm import Session

from app.core.config import settings
from app.db.session import get_db
from app.models.user import User


def get_current_user(
    request: Request,
    db: Session = Depends(get_db),
) -> User:
    """
    Get currently authenticated user from the access_token cookie.
    """

    token = request.cookies.get("access_token")

    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
        )

    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
    )

    try:
        payload = jwt.decode(
            token,
            settings.JWT_SECRET_KEY,
            algorithms=[settings.JWT_ALGORITHM],
        )

        print("JWT Payload:", payload)

        user_id = payload.get("sub")

        if user_id is None:
            raise Exception("Missing sub claim")

        user_id = int(user_id)

    except Exception as e:
        print("JWT ERROR:", repr(e))
        raise

    user = (
        db.query(User)
        .filter(User.id == user_id)
        .first()
    )

    print("Resolved user:", user)

    if user is None:
        raise credentials_exception

    return user