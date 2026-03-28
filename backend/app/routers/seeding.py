from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.document import Document, Page
from app.models.user import User
from app.models.vocab import VocabEntry, VocabList
from app.routers.auth import get_current_user
from app.services.seeding import BASIC_VOCAB, WELCOME_TEXT_EN
from app.services.translation import translate_pages

router = APIRouter(prefix="/seed", tags=["seed"])


@router.post("")
async def seed_language(
    target_language: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    doc_created = False
    vocab_created = False

    existing_docs = (
        db.query(Document)
        .filter_by(owner_id=current_user.id, target_language=target_language)
        .count()
    )
    if existing_docs == 0:
        translated = await translate_pages([WELCOME_TEXT_EN], "en", target_language)
        content = translated[0]

        doc = Document(
            owner_id=current_user.id,
            title="Welcome to Språkapp",
            target_language=target_language,
            original_filename=None,
            page_count=1,
        )
        db.add(doc)
        db.flush()
        db.add(Page(document_id=doc.id, page_number=1, text_content=content))
        db.commit()
        doc_created = True

    existing_vocab = (
        db.query(VocabList)
        .filter_by(owner_id=current_user.id, target_language=target_language)
        .count()
    )
    if existing_vocab == 0 and target_language in BASIC_VOCAB:
        vl = VocabList(
            owner_id=current_user.id,
            name="Basic words",
            target_language=target_language,
        )
        db.add(vl)
        db.flush()
        for native, target in BASIC_VOCAB[target_language]:
            db.add(VocabEntry(list_id=vl.id, native_word=native, target_word=target))
        db.commit()
        vocab_created = True

    return {"document_created": doc_created, "vocab_created": vocab_created}
