from datetime import datetime
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, EmailStr, Field


class SafetyPreferences(BaseModel):
    safety_threshold: float = Field(default=60.0, ge=0.0, le=100.0)
    haptic_warnings: bool = True
    auto_alert_guardians: bool = True
    audio_prompts: bool = True


class UserProfileSchema(BaseModel):
    id: str
    name: str
    email: EmailStr
    phone: Optional[str] = None
    photo: Optional[str] = None
    gender: Optional[str] = "unspecified"
    guardianCircle: List[Dict[str, Any]] = Field(default_factory=list)
    preferences: SafetyPreferences = Field(default_factory=SafetyPreferences)
    createdAt: datetime = Field(default_factory=datetime.utcnow)
    updatedAt: datetime = Field(default_factory=datetime.utcnow)


class SignUpRequest(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    password: str = Field(..., min_length=8)
    phone: Optional[str] = None
    gender: Optional[str] = "unspecified"


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class RefreshTokenRequest(BaseModel):
    refresh_token: str


class AuthTokenResponse(BaseModel):
    access_token: str
    refresh_token: Optional[str] = None
    token_type: str = "bearer"
    expires_in: int = 3600
    user: UserProfileSchema


class ProfileUpdateRequest(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    photo: Optional[str] = None
    gender: Optional[str] = None
    preferences: Optional[SafetyPreferences] = None
