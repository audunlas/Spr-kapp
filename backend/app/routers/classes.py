import secrets

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.class_ import Class
from app.models.document import Document, Page
from app.models.vocab import VocabList
from app.schemas.document import DocumentOut, PageOut
from app.models.user import User
from app.routers.auth import get_current_user
from app.schemas.class_ import (
    ClassAddDocument,
    ClassAddVocabList,
    ClassCreate,
    ClassOut,
    ClassUpdate,
)

router = APIRouter(prefix="/classes", tags=["classes"])


def _get_owned_class(class_id: int, current_user: User, db: Session) -> Class:
    cls = db.get(Class, class_id)
    if not cls:
        raise HTTPException(status_code=404, detail="Class not found")
    if cls.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not your class")
    return cls


@router.post("", response_model=ClassOut, status_code=status.HTTP_201_CREATED)
def create_class(
    body: ClassCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    cls = Class(
        name=body.name,
        description=body.description,
        share_code=secrets.token_urlsafe(8),
        owner_id=current_user.id,
    )
    db.add(cls)
    db.commit()
    db.refresh(cls)
    return cls


@router.get("", response_model=list[ClassOut])
def list_my_classes(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return (
        db.query(Class)
        .filter(Class.owner_id == current_user.id)
        .order_by(Class.created_at.desc())
        .all()
    )


# Must be defined before /{class_id} so "join" isn't matched as an integer
@router.get("/join/{share_code}", response_model=ClassOut)
def get_class_by_share_code(share_code: str, db: Session = Depends(get_db)):
    cls = db.query(Class).filter(Class.share_code == share_code).first()
    if not cls:
        raise HTTPException(status_code=404, detail="Class not found")
    return cls


@router.get("/{class_id}", response_model=ClassOut)
def get_class(
    class_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return _get_owned_class(class_id, current_user, db)


@router.patch("/{class_id}", response_model=ClassOut)
def update_class(
    class_id: int,
    body: ClassUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    cls = _get_owned_class(class_id, current_user, db)
    if body.name is not None:
        cls.name = body.name
    if body.description is not None:
        cls.description = body.description
    db.commit()
    db.refresh(cls)
    return cls


@router.delete("/{class_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_class(
    class_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    cls = _get_owned_class(class_id, current_user, db)
    db.delete(cls)
    db.commit()


@router.post("/{class_id}/documents", response_model=ClassOut)
def add_document(
    class_id: int,
    body: ClassAddDocument,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    cls = _get_owned_class(class_id, current_user, db)
    doc = db.get(Document, body.document_id)
    if not doc or doc.owner_id != current_user.id:
        raise HTTPException(status_code=404, detail="Document not found")
    if doc not in cls.documents:
        cls.documents.append(doc)
        db.commit()
        db.refresh(cls)
    return cls


@router.delete("/{class_id}/documents/{doc_id}", response_model=ClassOut)
def remove_document(
    class_id: int,
    doc_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    cls = _get_owned_class(class_id, current_user, db)
    doc = db.get(Document, doc_id)
    if doc and doc in cls.documents:
        cls.documents.remove(doc)
        db.commit()
        db.refresh(cls)
    return cls


@router.post("/{class_id}/vocab-lists", response_model=ClassOut)
def add_vocab_list(
    class_id: int,
    body: ClassAddVocabList,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    cls = _get_owned_class(class_id, current_user, db)
    vl = db.get(VocabList, body.vocab_list_id)
    if not vl or vl.owner_id != current_user.id:
        raise HTTPException(status_code=404, detail="Vocab list not found")
    if vl not in cls.vocab_lists:
        cls.vocab_lists.append(vl)
        db.commit()
        db.refresh(cls)
    return cls


@router.get("/join/{share_code}/documents/{doc_id}", response_model=DocumentOut)
def get_class_document(share_code: str, doc_id: int, db: Session = Depends(get_db)):
    cls = db.query(Class).filter(Class.share_code == share_code).first()
    if not cls:
        raise HTTPException(status_code=404, detail="Class not found")
    doc = db.get(Document, doc_id)
    if not doc or doc not in cls.documents:
        raise HTTPException(status_code=404, detail="Document not found in this class")
    return doc


@router.get("/join/{share_code}/documents/{doc_id}/pages/{page_num}", response_model=PageOut)
def get_class_document_page(share_code: str, doc_id: int, page_num: int, db: Session = Depends(get_db)):
    cls = db.query(Class).filter(Class.share_code == share_code).first()
    if not cls:
        raise HTTPException(status_code=404, detail="Class not found")
    doc = db.get(Document, doc_id)
    if not doc or doc not in cls.documents:
        raise HTTPException(status_code=404, detail="Document not found in this class")
    page = db.query(Page).filter(Page.document_id == doc_id, Page.page_number == page_num).first()
    if not page:
        raise HTTPException(status_code=404, detail="Page not found")
    return page


@router.delete("/{class_id}/vocab-lists/{list_id}", response_model=ClassOut)
def remove_vocab_list(
    class_id: int,
    list_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    cls = _get_owned_class(class_id, current_user, db)
    vl = db.get(VocabList, list_id)
    if vl and vl in cls.vocab_lists:
        cls.vocab_lists.remove(vl)
        db.commit()
        db.refresh(cls)
    return cls
