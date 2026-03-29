from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.class_ import Class
from app.models.exercise import GrammarExercise
from app.models.user import User
from app.routers.auth import get_current_user
from app.schemas.exercise import (
    CheckRequest,
    CheckResult,
    ExerciseCreate,
    ExerciseOut,
    ExercisePlayOut,
    ExerciseUpdate,
)

router = APIRouter(prefix="/exercises", tags=["exercises"])


def _get_owned_exercise(exercise_id: int, current_user: User, db: Session) -> GrammarExercise:
    ex = db.get(GrammarExercise, exercise_id)
    if not ex:
        raise HTTPException(status_code=404, detail="Exercise not found")
    cls = db.get(Class, ex.class_id)
    if not cls or cls.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not your exercise")
    return ex


@router.post("", response_model=ExerciseOut, status_code=status.HTTP_201_CREATED)
def create_exercise(
    body: ExerciseCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    cls = db.get(Class, body.class_id)
    if not cls or cls.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not your class")
    ex = GrammarExercise(
        class_id=body.class_id,
        title=body.title,
        prompt=body.prompt,
        text_content=body.text_content,
        correct_indices=body.correct_indices,
    )
    db.add(ex)
    db.commit()
    db.refresh(ex)
    return ex


@router.get("/{exercise_id}", response_model=ExerciseOut)
def get_exercise(
    exercise_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return _get_owned_exercise(exercise_id, current_user, db)


@router.patch("/{exercise_id}", response_model=ExerciseOut)
def update_exercise(
    exercise_id: int,
    body: ExerciseUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    ex = _get_owned_exercise(exercise_id, current_user, db)
    if body.title is not None:
        ex.title = body.title
    if body.prompt is not None:
        ex.prompt = body.prompt
    if body.text_content is not None:
        ex.text_content = body.text_content
    if body.correct_indices is not None:
        ex.correct_indices = body.correct_indices
    db.commit()
    db.refresh(ex)
    return ex


@router.delete("/{exercise_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_exercise(
    exercise_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    ex = _get_owned_exercise(exercise_id, current_user, db)
    db.delete(ex)
    db.commit()


@router.get("/{exercise_id}/play", response_model=ExercisePlayOut)
def get_exercise_play(exercise_id: int, db: Session = Depends(get_db)):
    ex = db.get(GrammarExercise, exercise_id)
    if not ex:
        raise HTTPException(status_code=404, detail="Exercise not found")
    return ex


@router.post("/{exercise_id}/check", response_model=CheckResult)
def check_exercise(exercise_id: int, body: CheckRequest, db: Session = Depends(get_db)):
    ex = db.get(GrammarExercise, exercise_id)
    if not ex:
        raise HTTPException(status_code=404, detail="Exercise not found")
    correct = set(ex.correct_indices)
    selected = set(body.selected_indices)
    return CheckResult(
        score=len(correct & selected),
        total=len(correct),
        correct_selected=sorted(correct & selected),
        wrong_selected=sorted(selected - correct),
        missed=sorted(correct - selected),
    )
