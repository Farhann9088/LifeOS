
from datetime import date, datetime
from typing import Literal

from pydantic import BaseModel, Field, ConfigDict


GoalStatus = Literal["active", "completed", "paused"]


class GoalCreate(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    description: str | None = None
    category: str | None = None
    target_date: date | None = None


class GoalUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=200)
    description: str | None = None
    category: str | None = None
    target_date: date | None = None
    status: GoalStatus | None = None


class MilestoneCreate(BaseModel):
    title: str = Field(min_length=1, max_length=200)


class MilestoneUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=200)
    completed: bool | None = None


class MilestoneResponse(BaseModel):
    id: int
    title: str
    completed: bool
    goal_id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class GoalResponse(BaseModel):
    id: int
    title: str
    description: str | None
    category: str | None
    target_date: date | None
    status: str
    user_id: int
    created_at: datetime
    updated_at: datetime | None

    progress: int
    total_milestones: int
    completed_milestones: int

    milestones: list[MilestoneResponse]

    model_config = ConfigDict(from_attributes=True)
