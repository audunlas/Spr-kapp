from datetime import datetime

from pydantic import BaseModel


class ExerciseCreate(BaseModel):
    class_id: int
    title: str
    prompt: str
    text_content: str
    correct_indices: list[int] = []


class ExerciseUpdate(BaseModel):
    title: str | None = None
    prompt: str | None = None
    text_content: str | None = None
    correct_indices: list[int] | None = None


class ExerciseOut(BaseModel):
    id: int
    class_id: int
    title: str
    prompt: str
    text_content: str
    correct_indices: list[int]
    created_at: datetime
    model_config = {"from_attributes": True}


class ExercisePlayOut(BaseModel):
    id: int
    class_id: int
    title: str
    prompt: str
    text_content: str
    model_config = {"from_attributes": True}


class ExerciseRef(BaseModel):
    id: int
    title: str
    prompt: str
    model_config = {"from_attributes": True}


class CheckRequest(BaseModel):
    selected_indices: list[int]


class CheckResult(BaseModel):
    score: int
    total: int
    correct_selected: list[int]
    wrong_selected: list[int]
    missed: list[int]
