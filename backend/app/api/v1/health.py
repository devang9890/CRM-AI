from fastapi import APIRouter

router = APIRouter(
    tags=["Health"]
)


@router.get("/health")
def health():
    return {
        "status": "healthy"
    }


@router.get("/")
def root():
    return {
        "message": "AI CRM Backend Running 🚀"
    }