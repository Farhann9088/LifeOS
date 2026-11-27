
from datetime import datetime, date
from typing import Literal

from pydantic import BaseModel, Field, ConfigDict


SkillLevel = Literal["beginner", "intermediate", "advanced"]


class SkillCreate(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    category: str | None = None
    description: str | None = None
    current_level: SkillLevel = "beginner"
    target_level: SkillLevel = "advanced"


class SkillUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=100)
    category: str | None = None
    description: str | None = None
    current_level: SkillLevel | None = None
    target_level: SkillLevel | None = None


class ActivityCreate(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    activity_type: Literal[
        "course", "project", "practice", "certification", "reading"
    ]
    description: str | None = None
    hours_spent: float = Field(default=0, ge=0)


class ActivityResponse(BaseModel):
    id: int
    title: str
    activity_type: str
    description: str | None
    hours_spent: float
    skill_id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class SkillResponse(BaseModel):
    id: int
    name: str
    category: str | None
    description: str | None
    current_level: str
    target_level: str
    user_id: int
    created_at: datetime
    updated_at: datetime | None

    activities: list[ActivityResponse]

    model_config = ConfigDict(from_attributes=True)


class CareerMilestoneCreate(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    description: str | None = None
    target_date: date | None = None


class CareerMilestoneUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=200)
    description: str | None = None
    target_date: date | None = None
    completed: bool | None = None


class CareerMilestoneResponse(BaseModel):
    id: int
    title: str
    description: str | None
    target_date: date | None
    completed: bool
    user_id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
