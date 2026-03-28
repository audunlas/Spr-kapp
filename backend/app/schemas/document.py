from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class TextDocumentRequest(BaseModel):
    title: str
    content: str
    target_language: str = "es"


class DocumentOut(BaseModel):
    id: int
    title: str
    target_language: str
    original_filename: Optional[str]
    page_count: int
    created_at: datetime

    model_config = {"from_attributes": True}


class PageOut(BaseModel):
    page_number: int
    text_content: str
    document_id: int

    model_config = {"from_attributes": True}
