from fastapi import FastAPI

app = FastAPI(
    title="AI CRM Assistant API",
    description="Backend API for AI CRM Assistant",
    version="1.0.0"
)


@app.get("/")
def root():
    return {
        "message": "Welcome to AI CRM Assistant API 🚀"
    }


@app.get("/health")
def health():
    return {
        "status": "healthy"
    }