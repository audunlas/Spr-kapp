from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.database import create_tables
from app.routers import auth, documents, translations, vocab


@asynccontextmanager
async def lifespan(app: FastAPI):
    import app.models.document  # noqa: F401
    import app.models.translation  # noqa: F401
    import app.models.user  # noqa: F401
    import app.models.vocab  # noqa: F401

    create_tables()
    yield


app = FastAPI(title="Språkapp", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins.split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(documents.router)
app.include_router(translations.router)
app.include_router(vocab.router)


@app.get("/health")
def health():
    return {"status": "ok"}
