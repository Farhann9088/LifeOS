
from sqlalchemy.orm import Session, selectinload

from app.models.goal import Goal
from app.models.milestone import Milestone
from app.schemas.goal import (
    GoalCreate,
    GoalUpdate,
    MilestoneCreate,
    MilestoneUpdate
)


def get_goals(db: Session, user_id: int):
    return (
        db.query(Goal)
        .options(selectinload(Goal.milestones))
        .filter(Goal.user_id == user_id)
        .order_by(Goal.created_at.desc())
        .all()
    )


def get_goal(db: Session, goal_id: int, user_id: int):
    return (
        db.query(Goal)
        .options(selectinload(Goal.milestones))
        .filter(
            Goal.id == goal_id,
            Goal.user_id == user_id
        )
        .first()
    )


def create_goal(db: Session, data: GoalCreate, user_id: int):
    goal = Goal(
        **data.model_dump(),
        user_id=user_id
    )

    db.add(goal)
    db.commit()
    db.refresh(goal)

    return get_goal(db, goal.id, user_id)


def update_goal(db: Session, goal: Goal, data: GoalUpdate):
    updates = data.model_dump(exclude_unset=True)

    for field in ("title", "status"):
        if field in updates and updates[field] is None:
            raise ValueError(f"{field} cannot be null")

    for key, value in updates.items():
        setattr(goal, key, value)

    db.commit()
    db.refresh(goal)

    return get_goal(db, goal.id, goal.user_id)


def delete_goal(db: Session, goal: Goal):
    db.delete(goal)
    db.commit()


def create_milestone(
    db: Session,
    goal: Goal,
    data: MilestoneCreate
):
    milestone = Milestone(
        title=data.title,
        goal_id=goal.id
    )

    db.add(milestone)
    db.commit()
    db.refresh(milestone)

    return milestone


def get_milestone(
    db: Session,
    goal_id: int,
    milestone_id: int
):
    return (
        db.query(Milestone)
        .filter(
            Milestone.id == milestone_id,
            Milestone.goal_id == goal_id
        )
        .first()
    )


def update_milestone(
    db: Session,
    milestone: Milestone,
    data: MilestoneUpdate
):
    updates = data.model_dump(exclude_unset=True)

    if "title" in updates and updates["title"] is None:
        raise ValueError("title cannot be null")

    for key, value in updates.items():
        setattr(milestone, key, value)

    db.commit()
    db.refresh(milestone)

    return milestone


def delete_milestone(db: Session, milestone: Milestone):
    db.delete(milestone)
    db.commit()
