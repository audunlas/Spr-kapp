import io

import pytest
from fpdf import FPDF


def make_pdf(pages: list[str] = None) -> bytes:
    if pages is None:
        pages = ["Hola mundo. Esta es una prueba."]
    pdf = FPDF()
    for text in pages:
        pdf.add_page()
        pdf.set_font("Helvetica", size=12)
        pdf.cell(text=text)
    return bytes(pdf.output())


def upload(client, auth_headers, content=None, filename="test.pdf"):
    if content is None:
        content = make_pdf()
    return client.post(
        "/documents/upload",
        files={"file": (filename, io.BytesIO(content), "application/pdf")},
        headers=auth_headers,
    )


def test_upload_pdf(client, auth_headers):
    resp = upload(client, auth_headers)
    assert resp.status_code == 201
    data = resp.json()
    assert data["title"] == "test"
    assert data["page_count"] == 1
    assert "id" in data


def test_upload_keeps_title_without_extension(client, auth_headers):
    resp = upload(client, auth_headers, filename="mi_libro.pdf")
    assert resp.json()["title"] == "mi libro"


def test_upload_non_pdf_rejected(client, auth_headers):
    resp = client.post(
        "/documents/upload",
        files={"file": ("doc.pdf", io.BytesIO(b"not a pdf"), "application/pdf")},
        headers=auth_headers,
    )
    assert resp.status_code == 400


def test_upload_multi_page(client, auth_headers):
    content = make_pdf(["Página uno", "Página dos", "Página tres"])
    resp = upload(client, auth_headers, content=content)
    assert resp.json()["page_count"] == 3


def test_list_documents(client, auth_headers):
    upload(client, auth_headers, filename="a.pdf")
    upload(client, auth_headers, filename="b.pdf")
    resp = client.get("/documents", headers=auth_headers)
    assert resp.status_code == 200
    assert len(resp.json()) == 2


def test_list_documents_unauthenticated(client):
    resp = client.get("/documents")
    assert resp.status_code == 401


def test_get_document(client, auth_headers):
    doc_id = upload(client, auth_headers).json()["id"]
    resp = client.get(f"/documents/{doc_id}", headers=auth_headers)
    assert resp.status_code == 200
    assert resp.json()["id"] == doc_id


def test_get_document_not_found(client, auth_headers):
    resp = client.get("/documents/9999", headers=auth_headers)
    assert resp.status_code == 404


def test_get_document_wrong_user(client, auth_headers, db):
    doc_id = upload(client, auth_headers).json()["id"]

    # Register a second user and get their token
    client.post("/auth/register", json={"username": "other", "password": "pass"})
    token = client.post("/auth/login", json={"username": "other", "password": "pass"}).json()["access_token"]
    other_headers = {"Authorization": f"Bearer {token}"}

    resp = client.get(f"/documents/{doc_id}", headers=other_headers)
    assert resp.status_code == 403


def test_delete_document(client, auth_headers):
    doc_id = upload(client, auth_headers).json()["id"]
    resp = client.delete(f"/documents/{doc_id}", headers=auth_headers)
    assert resp.status_code == 204
    # Confirm gone
    assert client.get(f"/documents/{doc_id}", headers=auth_headers).status_code == 404


def test_delete_cascades_pages(client, auth_headers):
    content = make_pdf(["Uno", "Dos"])
    doc_id = upload(client, auth_headers, content=content).json()["id"]
    client.delete(f"/documents/{doc_id}", headers=auth_headers)
    # Pages should also be gone (tested indirectly via 404 on page endpoint)
    resp = client.get(f"/documents/{doc_id}/pages/1", headers=auth_headers)
    assert resp.status_code == 404


def test_get_page(client, auth_headers):
    doc_id = upload(client, auth_headers).json()["id"]
    resp = client.get(f"/documents/{doc_id}/pages/1", headers=auth_headers)
    assert resp.status_code == 200
    data = resp.json()
    assert data["page_number"] == 1
    assert "Hola" in data["text_content"]


def test_get_page_not_found(client, auth_headers):
    doc_id = upload(client, auth_headers).json()["id"]
    resp = client.get(f"/documents/{doc_id}/pages/99", headers=auth_headers)
    assert resp.status_code == 404


def test_get_page_wrong_user(client, auth_headers):
    doc_id = upload(client, auth_headers).json()["id"]

    client.post("/auth/register", json={"username": "other2", "password": "pass"})
    token = client.post("/auth/login", json={"username": "other2", "password": "pass"}).json()["access_token"]
    other_headers = {"Authorization": f"Bearer {token}"}

    resp = client.get(f"/documents/{doc_id}/pages/1", headers=other_headers)
    assert resp.status_code == 403
