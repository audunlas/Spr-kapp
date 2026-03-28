from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class RegisterRequest(BaseModel):
    username: str
    password: str
    email: Optional[str] = None
    native_language: str = "en"


class LoginRequest(BaseModel):
    username: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserOut(BaseModel):
    id: int
    username: str
    email: Optional[str]
    native_language: str
    created_at: datetime

    model_config = {"from_attributes": True}


class UpdateSettingsRequest(BaseModel):
    native_language: str
