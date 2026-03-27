from pydantic import BaseModel


class TranslationRequest(BaseModel):
    text: str
    source_lang: str = "es"
    target_lang: str = "no"


class TranslationResponse(BaseModel):
    source_text: str
    translated_text: str
    alternatives: list[str] = []
    cached: bool
