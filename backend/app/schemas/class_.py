from datetime import datetime
from typing import Optional

from pydantic import BaseModel

from app.schemas.document import DocumentOut
from app.schemas.exercise import ExerciseRef
from app.schemas.vocab import VocabListOut


class ClassCreate(BaseModel):
    name: str
    description: Optional[str] = None


class ClassUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None


class ClassAddDocument(BaseModel):
    document_id: int


class ClassAddVocabList(BaseModel):
    vocab_list_id: int


class ClassOut(BaseModel):
    id: int
    name: str
    description: Optional[str]
    share_code: str
    owner_id: int
    created_at: datetime
    documents: list[DocumentOut] = []
    vocab_lists: list[VocabListOut] = []
    exercises: list[ExerciseRef] = []

    model_config = {"from_attributes": True}
