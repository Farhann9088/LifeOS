
from sqlalchemy.orm import Session, selectinload

from app.models.skill import Skill
from app.models.learning_activity import LearningActivity
from app.models.career_milestone import CareerMilestone

from app.schemas.career import (
    SkillCreate,
    SkillUpdate,
    ActivityCreate,
    CareerMilestoneCreate,
    CareerMilestoneUpdate
)


# ---------------- SKILLS ----------------

def get_skills(db: Session, user_id: int):
    return (
        db.query(Skill)
        .options(selectinload(Skill.activities))
        .filter(Skill.user_id == user_id)
        .order_by(Skill.created_at.desc())
        .all()
    )


def get_skill(db: Session, skill_id: int, user_id: int):
    return (
        db.query(Skill)
        .options(selectinload(Skill.activities))
        .filter(
            Skill.id == skill_id,
            Skill.user_id == user_id
        )
        .first()
    )


def create_skill(db: Session, data: SkillCreate, user_id: int):
    skill = Skill(**data.model_dump(), user_id=user_id)

    db.add(skill)
    db.commit()
    db.refresh(skill)

    return get_skill(db, skill.id, user_id)


def update_skill(db: Session, skill: Skill, data: SkillUpdate):
    updates = data.model_dump(exclude_unset=True)

    for field in ("name", "current_level", "target_level"):
        if field in updates and updates[field] is None:
            raise ValueError(f"{field} cannot be null")

    for key, value in updates.items():
        setattr(skill, key, value)

    db.commit()
    db.refresh(skill)

    return get_skill(db, skill.id, skill.user_id)


def delete_skill(db: Session, skill: Skill):
    db.delete(skill)
    db.commit()


# ---------------- LEARNING ACTIVITIES ----------------

def create_activity(
    db: Session,
    skill: Skill,
    data: ActivityCreate
):
    activity = LearningActivity(
        **data.model_dump(),
        skill_id=skill.id
    )

    db.add(activity)
    db.commit()
    db.refresh(activity)

    return activity


def get_activity(
    db: Session,
    skill_id: int,
    activity_id: int
):
    return (
        db.query(LearningActivity)
        .filter(
            LearningActivity.id == activity_id,
            LearningActivity.skill_id == skill_id
        )
        .first()
    )


def delete_activity(db: Session, activity: LearningActivity):
    db.delete(activity)
    db.commit()


# ---------------- CAREER MILESTONES ----------------

def get_career_milestones(db: Session, user_id: int):
    return (
        db.query(CareerMilestone)
        .filter(CareerMilestone.user_id == user_id)
        .order_by(CareerMilestone.created_at.desc())
        .all()
    )


def create_career_milestone(
    db: Session,
    data: CareerMilestoneCreate,
    user_id: int
):
    milestone = CareerMilestone(
        **data.model_dump(),
        user_id=user_id
    )

    db.add(milestone)
    db.commit()
    db.refresh(milestone)

    return milestone


def get_career_milestone(
    db: Session,
    milestone_id: int,
    user_id: int
):
    return (
        db.query(CareerMilestone)
        .filter(
            CareerMilestone.id == milestone_id,
            CareerMilestone.user_id == user_id
        )
        .first()
    )


def update_career_milestone(
    db: Session,
    milestone: CareerMilestone,
    data: CareerMilestoneUpdate
):
    updates = data.model_dump(exclude_unset=True)

    if "title" in updates and updates["title"] is None:
        raise ValueError("title cannot be null")

    for key, value in updates.items():
        setattr(milestone, key, value)

    db.commit()
    db.refresh(milestone)

    return milestone


def delete_career_milestone(
    db: Session,
    milestone: CareerMilestone
):
    db.delete(milestone)
    db.commit()
