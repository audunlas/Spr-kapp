from unittest.mock import AsyncMock, MagicMock, patch

import pytest

from app.models.translation import TranslationCache
from app.services.translation import TranslationService


def _make_httpx_mock(translated: str):
    """Return a patched httpx.AsyncClient that returns `translated` from DeepL."""
    mock_response = MagicMock()
    mock_response.json.return_value = {"translations": [{"text": translated}]}

    mock_client = AsyncMock()
    mock_client.post = AsyncMock(return_value=mock_response)

    return patch(
        "app.services.translation.httpx.AsyncClient",
        return_value=AsyncMock(
            __aenter__=AsyncMock(return_value=mock_client),
            __aexit__=AsyncMock(return_value=False),
        ),
    )


# --- Unit tests for TranslationService ---

async def test_translate_cache_miss(db):
    """On a cache miss, DeepL is called and the result is stored in the DB."""
    with _make_httpx_mock("Hei"), patch("app.services.translation.settings") as mock_settings:
        mock_settings.deepl_api_key = "test-key"
        service = TranslationService(db)
        result, _alternatives, cached = await service.translate("Hola", "es", "no")

    assert result == "Hei"
    assert cached is False

    entry = db.query(TranslationCache).filter_by(source_text="hola").first()
    assert entry is not None
    assert entry.translated_text == "Hei"


async def test_translate_cache_hit(db):
    """On a cache hit, DeepL is NOT called."""
    db.add(TranslationCache(
        source_text="hola",
        source_lang="es",
        target_lang="no",
        translated_text="Hei",
    ))
    db.commit()

    with patch("app.services.translation.httpx.AsyncClient") as mock_cls:
        service = TranslationService(db)
        result, _alternatives, cached = await service.translate("hola", "es", "no")
        mock_cls.assert_not_called()

    assert result == "Hei"
    assert cached is True


async def test_translate_cache_hit_case_insensitive(db):
    """Cache lookup normalises source text to lowercase."""
    db.add(TranslationCache(
        source_text="buenos días",
        source_lang="es",
        target_lang="no",
        translated_text="God morgen",
    ))
    db.commit()

    with patch("app.services.translation.httpx.AsyncClient") as mock_cls:
        service = TranslationService(db)
        result, _alternatives, cached = await service.translate("Buenos Días", "es", "no")
        mock_cls.assert_not_called()

    assert result == "God morgen"
    assert cached is True


# --- Integration tests via HTTP endpoint ---

def test_translate_endpoint_success(client, auth_headers):
    with _make_httpx_mock("Hei"), patch("app.services.translation.settings") as mock_settings:
        mock_settings.deepl_api_key = "test-key"
        resp = client.post(
            "/translate",
            json={"text": "Hola", "source_lang": "es", "target_lang": "no"},
            headers=auth_headers,
        )
    assert resp.status_code == 200
    data = resp.json()
    assert data["source_text"] == "Hola"
    assert data["translated_text"] == "Hei"
    assert data["cached"] is False


def test_translate_endpoint_empty_text(client, auth_headers):
    resp = client.post(
        "/translate",
        json={"text": "  ", "source_lang": "es", "target_lang": "no"},
        headers=auth_headers,
    )
    assert resp.status_code == 400


def test_translate_endpoint_unauthenticated(client):
    resp = client.post("/translate", json={"text": "hola", "source_lang": "es", "target_lang": "no"})
    assert resp.status_code == 401


def test_translate_second_call_uses_cache(client, auth_headers):
    with _make_httpx_mock("Takk"), patch("app.services.translation.settings") as mock_settings:
        mock_settings.deepl_api_key = "test-key"
        resp1 = client.post(
            "/translate",
            json={"text": "gracias", "source_lang": "es", "target_lang": "no"},
            headers=auth_headers,
        )
    assert resp1.status_code == 200
    assert resp1.json()["cached"] is False

    # Second call without mock: must use cache (not hit real API)
    resp2 = client.post(
        "/translate",
        json={"text": "gracias", "source_lang": "es", "target_lang": "no"},
        headers=auth_headers,
    )
    assert resp2.status_code == 200
    assert resp2.json()["cached"] is True
    assert resp2.json()["translated_text"] == "Takk"
