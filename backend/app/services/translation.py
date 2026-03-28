import asyncio

import httpx
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.translation import TranslationCache

DEEPL_URL = "https://api-free.deepl.com/v2/translate"
MYMEMORY_URL = "https://api.mymemory.translated.net/get"

# DeepL uses uppercase language codes; Norwegian Bokmål is "NB" not "NO"
_DEEPL_LANG_MAP = {"no": "NB", "nb": "NB"}


def _deepl_lang(lang: str) -> str:
    return _DEEPL_LANG_MAP.get(lang.lower(), lang.upper())


class TranslationService:
    def __init__(self, db: Session):
        self.db = db

    async def translate(
        self, text: str, source_lang: str, target_lang: str
    ) -> tuple[str, list[str], bool]:
        """
        Translate text. Returns (translated_text, alternatives, cached).
        Uses DeepL if DEEPL_API_KEY is set, otherwise falls back to MyMemory.
        """
        key = text.strip()
        key_lower = key.lower()

        cached = (
            self.db.query(TranslationCache)
            .filter_by(source_text=key_lower, source_lang=source_lang, target_lang=target_lang)
            .first()
        )
        if cached:
            return cached.translated_text, [], True

        if settings.deepl_api_key:
            translated, alternatives = await self._call_deepl(key, source_lang, target_lang)
        else:
            translated, alternatives = await self._call_mymemory(key, source_lang, target_lang)

        entry = TranslationCache(
            source_text=key_lower,
            source_lang=source_lang,
            target_lang=target_lang,
            translated_text=translated,
        )
        self.db.add(entry)
        self.db.commit()

        return translated, alternatives, False

    async def _call_deepl(self, text: str, source_lang: str, target_lang: str) -> tuple[str, list[str]]:
        headers = {"Authorization": f"DeepL-Auth-Key {settings.deepl_api_key}"}
        payload = {
            "text": [text],
            "source_lang": _deepl_lang(source_lang),
            "target_lang": _deepl_lang(target_lang),
        }
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.post(DEEPL_URL, json=payload, headers=headers)
            response.raise_for_status()
            data = response.json()

        translated = data.get("translations", [{}])[0].get("text", "")
        if not translated:
            raise ValueError("Empty translation response from DeepL")
        return translated, []

    async def _call_mymemory(self, text: str, source_lang: str, target_lang: str) -> tuple[str, list[str]]:
        params: dict = {"q": text, "langpair": f"{source_lang}|{target_lang}"}
        if settings.mymemory_email:
            params["de"] = settings.mymemory_email

        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(MYMEMORY_URL, params=params)
            response.raise_for_status()
            data = response.json()

        primary = data.get("responseData", {}).get("translatedText", "")
        if not primary:
            raise ValueError("Empty translation response from MyMemory")

        seen: set[str] = {primary.lower()}
        alternatives: list[str] = []
        matches = sorted(
            data.get("matches", []),
            key=lambda m: float(m.get("match", 0)),
            reverse=True,
        )
        for match in matches:
            t = (match.get("translation") or "").strip()
            if t and t.lower() not in seen and float(match.get("match", 0)) >= 0.3:
                seen.add(t.lower())
                alternatives.append(t)
            if len(alternatives) >= 4:
                break

        return primary, alternatives


async def translate_pages(
    texts: list[str], source_lang: str, target_lang: str
) -> list[str]:
    """Translate a list of page texts via DeepL in parallel. Falls back to originals on error."""
    if not settings.deepl_api_key or source_lang == target_lang:
        return texts

    async def _one(text: str) -> str:
        headers = {"Authorization": f"DeepL-Auth-Key {settings.deepl_api_key}"}
        payload = {
            "text": [text],
            "source_lang": _deepl_lang(source_lang),
            "target_lang": _deepl_lang(target_lang),
        }
        async with httpx.AsyncClient(timeout=30.0) as client:
            r = await client.post(DEEPL_URL, json=payload, headers=headers)
            r.raise_for_status()
            return r.json().get("translations", [{}])[0].get("text", text)

    results = await asyncio.gather(*[_one(t) for t in texts], return_exceptions=True)
    return [r if isinstance(r, str) else texts[i] for i, r in enumerate(results)]
