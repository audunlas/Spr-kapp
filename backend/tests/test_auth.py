def test_register_success(client):
    resp = client.post("/auth/register", json={"username": "alice", "password": "secret123"})
    assert resp.status_code == 201
    data = resp.json()
    assert data["username"] == "alice"
    assert "id" in data
    assert "hashed_password" not in data


def test_register_duplicate_username(client):
    client.post("/auth/register", json={"username": "alice", "password": "secret123"})
    resp = client.post("/auth/register", json={"username": "alice", "password": "other"})
    assert resp.status_code == 400


def test_register_with_email(client):
    resp = client.post(
        "/auth/register",
        json={"username": "bob", "password": "pass", "email": "bob@example.com"},
    )
    assert resp.status_code == 201
    assert resp.json()["email"] == "bob@example.com"


def test_login_success(client):
    client.post("/auth/register", json={"username": "alice", "password": "secret123"})
    resp = client.post("/auth/login", json={"username": "alice", "password": "secret123"})
    assert resp.status_code == 200
    data = resp.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"


def test_login_wrong_password(client):
    client.post("/auth/register", json={"username": "alice", "password": "secret123"})
    resp = client.post("/auth/login", json={"username": "alice", "password": "wrong"})
    assert resp.status_code == 401


def test_login_unknown_user(client):
    resp = client.post("/auth/login", json={"username": "ghost", "password": "pass"})
    assert resp.status_code == 401


def test_get_me_authenticated(client, auth_headers):
    resp = client.get("/auth/me", headers=auth_headers)
    assert resp.status_code == 200
    assert resp.json()["username"] == "testuser"


def test_get_me_unauthenticated(client):
    resp = client.get("/auth/me")
    assert resp.status_code == 401


def test_get_me_invalid_token(client):
    resp = client.get("/auth/me", headers={"Authorization": "Bearer invalid.token.here"})
    assert resp.status_code == 401
