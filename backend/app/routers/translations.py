from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.user import User
from app.routers.auth import get_current_user
from app.schemas.translation import TranslationRequest, TranslationResponse
from app.services.translation import TranslationService

router = APIRouter(prefix="/translate", tags=["translate"])


@router.post("", response_model=TranslationResponse)
async def translate(
    body: TranslationRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if not body.text.strip():
        raise HTTPException(status_code=400, detail="text must not be empty")

    service = TranslationService(db)
    try:
        translated_text, alternatives, cached = await service.translate(
            body.text, body.source_lang, body.target_lang
        )
    except Exception as e:
        print(f"Translation error: {type(e).__name__}: {e}")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Translation service unavailable",
        )

    return TranslationResponse(
        source_text=body.text,
        translated_text=translated_text,
        alternatives=alternatives,
        cached=cached,
    )
