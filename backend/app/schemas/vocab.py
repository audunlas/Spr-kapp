from datetime import datetime
from pydantic import BaseModel


class VocabEntryOut(BaseModel):
    id: int
    list_id: int
    native_word: str
    target_word: str
    model_config = {"from_attributes": True}


class VocabListOut(BaseModel):
    id: int
    name: str
    target_language: str
    entries: list[VocabEntryOut] = []
    created_at: datetime
    model_config = {"from_attributes": True}


class CreateVocabListRequest(BaseModel):
    name: str
    target_language: str


class RenameVocabListRequest(BaseModel):
    name: str


class AddEntriesRequest(BaseModel):
    raw: str  # "native:target" lines, one per line
