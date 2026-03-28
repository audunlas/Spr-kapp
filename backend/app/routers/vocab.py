from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.vocab import VocabEntry, VocabList
from app.models.user import User
from app.routers.auth import get_current_user
from app.schemas.vocab import (
    AddEntriesRequest,
    CreateVocabListRequest,
    RenameVocabListRequest,
    VocabListOut,
)

router = APIRouter(prefix="/vocab", tags=["vocab"])


def _get_owned_list(list_id: int, current_user: User, db: Session) -> VocabList:
    vocab_list = db.get(VocabList, list_id)
    if not vocab_list:
        raise HTTPException(status_code=404, detail="Vocab list not found")
    if vocab_list.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not your vocab list")
    return vocab_list


@router.get("/lists", response_model=list[VocabListOut])
def list_vocab_lists(
    target_language: str | None = Query(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    q = db.query(VocabList).filter(VocabList.owner_id == current_user.id)
    if target_language:
        q = q.filter(VocabList.target_language == target_language)
    return q.all()


@router.post("/lists", response_model=VocabListOut, status_code=status.HTTP_201_CREATED)
def create_vocab_list(
    body: CreateVocabListRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    vocab_list = VocabList(
        owner_id=current_user.id,
        name=body.name,
        target_language=body.target_language,
    )
    db.add(vocab_list)
    db.commit()
    db.refresh(vocab_list)
    return vocab_list


@router.get("/lists/{list_id}", response_model=VocabListOut)
def get_vocab_list(
    list_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return _get_owned_list(list_id, current_user, db)


@router.patch("/lists/{list_id}", response_model=VocabListOut)
def rename_vocab_list(
    list_id: int,
    body: RenameVocabListRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    vocab_list = _get_owned_list(list_id, current_user, db)
    vocab_list.name = body.name
    db.commit()
    db.refresh(vocab_list)
    return vocab_list


@router.delete("/lists/{list_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_vocab_list(
    list_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    vocab_list = _get_owned_list(list_id, current_user, db)
    db.delete(vocab_list)
    db.commit()


@router.post("/lists/{list_id}/entries", response_model=VocabListOut)
def add_entries(
    list_id: int,
    body: AddEntriesRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    vocab_list = _get_owned_list(list_id, current_user, db)

    for line in body.raw.splitlines():
        line = line.strip()
        if not line:
            continue
        parts = line.split(":", 1)
        if len(parts) != 2:
            continue
        native = parts[0].strip()
        target = parts[1].strip()
        if not native or not target:
            continue
        db.add(VocabEntry(list_id=list_id, native_word=native, target_word=target))

    db.commit()
    db.refresh(vocab_list)
    return vocab_list


@router.delete("/lists/{list_id}/entries/{entry_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_entry(
    list_id: int,
    entry_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    _get_owned_list(list_id, current_user, db)
    entry = db.get(VocabEntry, entry_id)
    if not entry or entry.list_id != list_id:
        raise HTTPException(status_code=404, detail="Entry not found")
    db.delete(entry)
    db.commit()
