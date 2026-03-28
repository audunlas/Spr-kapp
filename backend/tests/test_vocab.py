import pytest


@pytest.fixture()
def auth_headers2(client):
    """Second user for ownership tests."""
    client.post("/auth/register", json={"username": "otheruser", "password": "otherpass123"})
    resp = client.post("/auth/login", json={"username": "otheruser", "password": "otherpass123"})
    token = resp.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


def create_list(client, auth_headers, name="My List", lang="es"):
    resp = client.post(
        "/vocab/lists",
        json={"name": name, "target_language": lang},
        headers=auth_headers,
    )
    assert resp.status_code == 201
    return resp.json()


class TestCreateList:
    def test_create_list(self, client, auth_headers):
        data = create_list(client, auth_headers)
        assert data["name"] == "My List"
        assert data["target_language"] == "es"
        assert data["entries"] == []
        assert "id" in data

    def test_create_list_requires_auth(self, client):
        resp = client.post("/vocab/lists", json={"name": "x", "target_language": "es"})
        assert resp.status_code == 401


class TestListLists:
    def test_list_all(self, client, auth_headers):
        create_list(client, auth_headers, "Spanish List", "es")
        create_list(client, auth_headers, "French List", "fr")
        resp = client.get("/vocab/lists", headers=auth_headers)
        assert resp.status_code == 200
        names = [l["name"] for l in resp.json()]
        assert "Spanish List" in names
        assert "French List" in names

    def test_list_filter_by_language(self, client, auth_headers):
        create_list(client, auth_headers, "Spanish List", "es")
        create_list(client, auth_headers, "French List", "fr")
        resp = client.get("/vocab/lists?target_language=es", headers=auth_headers)
        assert resp.status_code == 200
        data = resp.json()
        assert len(data) == 1
        assert data[0]["name"] == "Spanish List"

    def test_list_empty_for_new_user(self, client, auth_headers):
        resp = client.get("/vocab/lists", headers=auth_headers)
        assert resp.status_code == 200
        assert resp.json() == []


class TestGetList:
    def test_get_list_detail(self, client, auth_headers):
        created = create_list(client, auth_headers)
        resp = client.get(f"/vocab/lists/{created['id']}", headers=auth_headers)
        assert resp.status_code == 200
        assert resp.json()["name"] == "My List"

    def test_get_list_with_entries(self, client, auth_headers):
        created = create_list(client, auth_headers)
        client.post(
            f"/vocab/lists/{created['id']}/entries",
            json={"raw": "hello:hola\ngoodbye:adios"},
            headers=auth_headers,
        )
        resp = client.get(f"/vocab/lists/{created['id']}", headers=auth_headers)
        assert resp.status_code == 200
        entries = resp.json()["entries"]
        assert len(entries) == 2

    def test_get_list_not_found(self, client, auth_headers):
        resp = client.get("/vocab/lists/9999", headers=auth_headers)
        assert resp.status_code == 404

    def test_get_list_wrong_owner(self, client, auth_headers, auth_headers2):
        created = create_list(client, auth_headers)
        resp = client.get(f"/vocab/lists/{created['id']}", headers=auth_headers2)
        assert resp.status_code == 403


class TestAddEntries:
    def test_add_single_entry(self, client, auth_headers):
        created = create_list(client, auth_headers)
        resp = client.post(
            f"/vocab/lists/{created['id']}/entries",
            json={"raw": "cat:gato"},
            headers=auth_headers,
        )
        assert resp.status_code == 200
        entries = resp.json()["entries"]
        assert len(entries) == 1
        assert entries[0]["native_word"] == "cat"
        assert entries[0]["target_word"] == "gato"

    def test_add_multi_line(self, client, auth_headers):
        created = create_list(client, auth_headers)
        resp = client.post(
            f"/vocab/lists/{created['id']}/entries",
            json={"raw": "cat:gato\ndog:perro\nbird:pájaro"},
            headers=auth_headers,
        )
        assert resp.status_code == 200
        assert len(resp.json()["entries"]) == 3

    def test_skip_empty_lines(self, client, auth_headers):
        created = create_list(client, auth_headers)
        resp = client.post(
            f"/vocab/lists/{created['id']}/entries",
            json={"raw": "cat:gato\n\n\ndog:perro"},
            headers=auth_headers,
        )
        assert resp.status_code == 200
        assert len(resp.json()["entries"]) == 2

    def test_skip_invalid_lines(self, client, auth_headers):
        created = create_list(client, auth_headers)
        resp = client.post(
            f"/vocab/lists/{created['id']}/entries",
            json={"raw": "cat:gato\nnocolon\ndog:perro"},
            headers=auth_headers,
        )
        assert resp.status_code == 200
        assert len(resp.json()["entries"]) == 2

    def test_add_entries_wrong_owner(self, client, auth_headers, auth_headers2):
        created = create_list(client, auth_headers)
        resp = client.post(
            f"/vocab/lists/{created['id']}/entries",
            json={"raw": "cat:gato"},
            headers=auth_headers2,
        )
        assert resp.status_code == 403


class TestDeleteEntry:
    def test_delete_entry(self, client, auth_headers):
        created = create_list(client, auth_headers)
        list_resp = client.post(
            f"/vocab/lists/{created['id']}/entries",
            json={"raw": "cat:gato\ndog:perro"},
            headers=auth_headers,
        )
        entry_id = list_resp.json()["entries"][0]["id"]
        resp = client.delete(
            f"/vocab/lists/{created['id']}/entries/{entry_id}",
            headers=auth_headers,
        )
        assert resp.status_code == 204

        # Verify deleted
        detail = client.get(f"/vocab/lists/{created['id']}", headers=auth_headers)
        assert len(detail.json()["entries"]) == 1

    def test_delete_entry_not_found(self, client, auth_headers):
        created = create_list(client, auth_headers)
        resp = client.delete(
            f"/vocab/lists/{created['id']}/entries/9999",
            headers=auth_headers,
        )
        assert resp.status_code == 404


class TestRenameList:
    def test_rename_list(self, client, auth_headers):
        created = create_list(client, auth_headers)
        resp = client.patch(
            f"/vocab/lists/{created['id']}",
            json={"name": "Renamed List"},
            headers=auth_headers,
        )
        assert resp.status_code == 200
        assert resp.json()["name"] == "Renamed List"

    def test_rename_wrong_owner(self, client, auth_headers, auth_headers2):
        created = create_list(client, auth_headers)
        resp = client.patch(
            f"/vocab/lists/{created['id']}",
            json={"name": "Hacked"},
            headers=auth_headers2,
        )
        assert resp.status_code == 403


class TestDeleteList:
    def test_delete_list(self, client, auth_headers):
        created = create_list(client, auth_headers)
        resp = client.delete(f"/vocab/lists/{created['id']}", headers=auth_headers)
        assert resp.status_code == 204

        # Verify gone
        resp2 = client.get(f"/vocab/lists/{created['id']}", headers=auth_headers)
        assert resp2.status_code == 404

    def test_delete_wrong_owner(self, client, auth_headers, auth_headers2):
        created = create_list(client, auth_headers)
        resp = client.delete(f"/vocab/lists/{created['id']}", headers=auth_headers2)
        assert resp.status_code == 403
