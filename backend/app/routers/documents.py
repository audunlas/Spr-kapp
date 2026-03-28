from fastapi import APIRouter, Depends, Form, HTTPException, Query, UploadFile, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.document import Document, Page
from app.models.user import User
from app.routers.auth import get_current_user
from app.schemas.document import DocumentOut, PageOut, TextDocumentRequest
from app.services.pdf_parser import PDFParser

router = APIRouter(prefix="/documents", tags=["documents"])


def _get_owned_document(document_id: int, current_user: User, db: Session) -> Document:
    doc = db.get(Document, document_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    if doc.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not your document")
    return doc


@router.get("", response_model=list[DocumentOut])
def list_documents(
    target_language: str | None = Query(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    q = db.query(Document).filter(Document.owner_id == current_user.id)
    if target_language:
        q = q.filter(Document.target_language == target_language)
    return q.all()


@router.post("/upload", response_model=DocumentOut, status_code=status.HTTP_201_CREATED)
async def upload_document(
    file: UploadFile,
    target_language: str = Form(default="es"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    file_bytes = await file.read()
    parser = PDFParser()
    if not parser.is_pdf(file_bytes):
        raise HTTPException(status_code=400, detail="File must be a PDF")

    raw_pages = parser.extract_pages(file_bytes)

    title = file.filename or "Untitled"
    if title.lower().endswith(".pdf"):
        title = title[:-4]
    # Replace filename separators with spaces for a readable title
    title = title.replace("-", " ").replace("_", " ").strip()

    doc = Document(
        owner_id=current_user.id,
        title=title,
        target_language=target_language,
        original_filename=file.filename,
        page_count=len(raw_pages),
    )
    db.add(doc)
    db.flush()  # get doc.id without committing

    for p in raw_pages:
        db.add(Page(document_id=doc.id, page_number=p["page_number"], text_content=p["text_content"]))

    db.commit()
    db.refresh(doc)
    return doc


@router.post("/text", response_model=DocumentOut, status_code=status.HTTP_201_CREATED)
def create_text_document(
    body: TextDocumentRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    # Split content into paragraphs
    paragraphs = [p.strip() for p in body.content.split("\n\n") if p.strip()]

    # Group paragraphs into ~3000-char chunks
    pages_text: list[str] = []
    current_chunk: list[str] = []
    current_len = 0

    for para in paragraphs:
        if current_len + len(para) > 3000 and current_chunk:
            pages_text.append("\n\n".join(current_chunk))
            current_chunk = [para]
            current_len = len(para)
        else:
            current_chunk.append(para)
            current_len += len(para)

    if current_chunk:
        pages_text.append("\n\n".join(current_chunk))

    if not pages_text:
        pages_text = [""]

    doc = Document(
        owner_id=current_user.id,
        title=body.title,
        target_language=body.target_language,
        original_filename=None,
        page_count=len(pages_text),
    )
    db.add(doc)
    db.flush()

    for i, text in enumerate(pages_text, start=1):
        db.add(Page(document_id=doc.id, page_number=i, text_content=text))

    db.commit()
    db.refresh(doc)
    return doc


@router.get("/{document_id}", response_model=DocumentOut)
def get_document(
    document_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return _get_owned_document(document_id, current_user, db)


@router.delete("/{document_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_document(
    document_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    doc = _get_owned_document(document_id, current_user, db)
    db.delete(doc)
    db.commit()


@router.get("/{document_id}/pages/{page_number}", response_model=PageOut)
def get_page(
    document_id: int,
    page_number: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    _get_owned_document(document_id, current_user, db)
    page = (
        db.query(Page)
        .filter(Page.document_id == document_id, Page.page_number == page_number)
        .first()
    )
    if not page:
        raise HTTPException(status_code=404, detail="Page not found")
    return page
