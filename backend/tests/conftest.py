import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

# Import models first so Base.metadata knows all tables, and so the 'app'
# name below ends up bound to the FastAPI instance (not the 'app' package).
import app.models.document  # noqa: F401
import app.models.translation  # noqa: F401
import app.models.user  # noqa: F401
import app.models.vocab  # noqa: F401

from app.core.database import Base, get_db
from app.main import app as fastapi_app

TEST_DATABASE_URL = "sqlite:///:memory:"

_engine = create_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=_engine)


@pytest.fixture(autouse=True)
def reset_db():
    Base.metadata.create_all(bind=_engine)
    yield
    Base.metadata.drop_all(bind=_engine)


@pytest.fixture()
def db():
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()


@pytest.fixture()
def client(db):
    def override_get_db():
        yield db

    fastapi_app.dependency_overrides[get_db] = override_get_db
    with TestClient(fastapi_app, raise_server_exceptions=True) as c:
        yield c
    fastapi_app.dependency_overrides.clear()


@pytest.fixture()
def auth_headers(client):
    client.post("/auth/register", json={"username": "testuser", "password": "testpass123"})
    resp = client.post("/auth/login", json={"username": "testuser", "password": "testpass123"})
    token = resp.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}
