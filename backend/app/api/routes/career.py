
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.models.user import User
from app.api.routes.auth import get_current_user

from app.schemas.career import (
    SkillCreate,
    SkillUpdate,
    SkillResponse,
    ActivityCreate,
    ActivityResponse,
    CareerMilestoneCreate,
    CareerMilestoneUpdate,
    CareerMilestoneResponse
)

from app.services.career_service import (
    get_skills,
    get_skill,
    create_skill,
    update_skill,
    delete_skill,
    create_activity,
    get_activity,
    delete_activity,
    get_career_milestones,
    create_career_milestone,
    get_career_milestone,
    update_career_milestone,
    delete_career_milestone
)


router = APIRouter(
    prefix="/career",
    tags=["Career Progress"]
)


# ---------------- SKILLS ----------------

@router.post("/skills", response_model=SkillResponse, status_code=201)
def add_skill(
    data: SkillCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return create_skill(db, data, current_user.id)


@router.get("/skills", response_model=list[SkillResponse])
def read_skills(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return get_skills(db, current_user.id)


@router.get("/skills/{skill_id}", response_model=SkillResponse)
def read_skill(
    skill_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    skill = get_skill(db, skill_id, current_user.id)

    if not skill:
        raise HTTPException(404, "Skill not found")

    return skill


@router.patch("/skills/{skill_id}", response_model=SkillResponse)
def edit_skill(
    skill_id: int,
    data: SkillUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    skill = get_skill(db, skill_id, current_user.id)

    if not skill:
        raise HTTPException(404, "Skill not found")

    try:
        return update_skill(db, skill, data)
    except ValueError as error:
        raise HTTPException(422, str(error))


@router.delete("/skills/{skill_id}")
def remove_skill(
    skill_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    skill = get_skill(db, skill_id, current_user.id)

    if not skill:
        raise HTTPException(404, "Skill not found")

    delete_skill(db, skill)

    return {"message": "Skill deleted successfully"}


# ---------------- LEARNING ACTIVITIES ----------------

@router.post(
    "/skills/{skill_id}/activities",
    response_model=ActivityResponse,
    status_code=201
)
def add_activity(
    skill_id: int,
    data: ActivityCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    skill = get_skill(db, skill_id, current_user.id)

    if not skill:
        raise HTTPException(404, "Skill not found")

    return create_activity(db, skill, data)


@router.get(
    "/skills/{skill_id}/activities",
    response_model=list[ActivityResponse]
)
def read_activities(
    skill_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    skill = get_skill(db, skill_id, current_user.id)

    if not skill:
        raise HTTPException(404, "Skill not found")

    return skill.activities


@router.delete("/skills/{skill_id}/activities/{activity_id}")
def remove_activity(
    skill_id: int,
    activity_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    skill = get_skill(db, skill_id, current_user.id)

    if not skill:
        raise HTTPException(404, "Skill not found")

    activity = get_activity(db, skill_id, activity_id)

    if not activity:
        raise HTTPException(404, "Activity not found")

    delete_activity(db, activity)

    return {"message": "Learning activity deleted successfully"}


# ---------------- CAREER MILESTONES ----------------

@router.post(
    "/milestones",
    response_model=CareerMilestoneResponse,
    status_code=201
)
def add_career_milestone(
    data: CareerMilestoneCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return create_career_milestone(db, data, current_user.id)


@router.get(
    "/milestones",
    response_model=list[CareerMilestoneResponse]
)
def read_career_milestones(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return get_career_milestones(db, current_user.id)


@router.patch(
    "/milestones/{milestone_id}",
    response_model=CareerMilestoneResponse
)
def edit_career_milestone(
    milestone_id: int,
    data: CareerMilestoneUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    milestone = get_career_milestone(
        db, milestone_id, current_user.id
    )

    if not milestone:
        raise HTTPException(404, "Career milestone not found")

    try:
        return update_career_milestone(db, milestone, data)
    except ValueError as error:
        raise HTTPException(422, str(error))


@router.delete("/milestones/{milestone_id}")
def remove_career_milestone(
    milestone_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    milestone = get_career_milestone(
        db, milestone_id, current_user.id
    )

    if not milestone:
        raise HTTPException(404, "Career milestone not found")

    delete_career_milestone(db, milestone)

    return {"message": "Career milestone deleted successfully"}


# ---------------- CAREER ANALYTICS ----------------

@router.get("/analytics")
def career_analytics(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    skills = get_skills(db, current_user.id)

    milestones = get_career_milestones(db, current_user.id)

    total_hours = sum(
        activity.hours_spent
        for skill in skills
        for activity in skill.activities
    )

    total_activities = sum(
        len(skill.activities) for skill in skills
    )

    completed_milestones = sum(
        1 for milestone in milestones if milestone.completed
    )

    return {
        "total_skills": len(skills),
        "total_learning_activities": total_activities,
        "total_learning_hours": round(total_hours, 2),
        "total_career_milestones": len(milestones),
        "completed_career_milestones": completed_milestones,
        "milestone_completion_percentage": (
            round(completed_milestones / len(milestones) * 100)
            if milestones else 0
        )
    }
