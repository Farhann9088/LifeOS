
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.models.user import User
from app.schemas.goal import (
    GoalCreate,
    GoalUpdate,
    GoalResponse,
    MilestoneCreate,
    MilestoneUpdate,
    MilestoneResponse
)
from app.services.goal_service import (
    get_goals,
    get_goal,
    create_goal,
    update_goal,
    delete_goal,
    create_milestone,
    get_milestone,
    update_milestone,
    delete_milestone
)
from app.api.routes.auth import get_current_user


router = APIRouter(
    prefix="/goals",
    tags=["Goals & Milestones"]
)


def format_goal(goal):
    total = len(goal.milestones)
    completed = sum(1 for m in goal.milestones if m.completed)

    progress = round((completed / total) * 100) if total else 0

    # A goal with no milestones can still be manually marked completed.
    if goal.status == "completed":
        progress = 100

    return {
        "id": goal.id,
        "title": goal.title,
        "description": goal.description,
        "category": goal.category,
        "target_date": goal.target_date,
        "status": goal.status,
        "user_id": goal.user_id,
        "created_at": goal.created_at,
        "updated_at": goal.updated_at,
        "progress": progress,
        "total_milestones": total,
        "completed_milestones": completed,
        "milestones": goal.milestones
    }


# -----------------------------------------
# CREATE GOAL
# -----------------------------------------

@router.post("/", response_model=GoalResponse, status_code=201)
def add_goal(
    data: GoalCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    goal = create_goal(db, data, current_user.id)
    return format_goal(goal)


# -----------------------------------------
# GET ALL GOALS
# -----------------------------------------

@router.get("/", response_model=list[GoalResponse])
def read_goals(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    goals = get_goals(db, current_user.id)
    return [format_goal(goal) for goal in goals]


# -----------------------------------------
# GET SINGLE GOAL
# -----------------------------------------

@router.get("/{goal_id}", response_model=GoalResponse)
def read_goal(
    goal_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    goal = get_goal(db, goal_id, current_user.id)

    if not goal:
        raise HTTPException(404, "Goal not found")

    return format_goal(goal)


# -----------------------------------------
# UPDATE GOAL
# -----------------------------------------

@router.patch("/{goal_id}", response_model=GoalResponse)
def edit_goal(
    goal_id: int,
    data: GoalUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    goal = get_goal(db, goal_id, current_user.id)

    if not goal:
        raise HTTPException(404, "Goal not found")

    try:
        updated = update_goal(db, goal, data)
    except ValueError as error:
        raise HTTPException(422, str(error))

    return format_goal(updated)


# -----------------------------------------
# DELETE GOAL
# -----------------------------------------

@router.delete("/{goal_id}")
def remove_goal(
    goal_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    goal = get_goal(db, goal_id, current_user.id)

    if not goal:
        raise HTTPException(404, "Goal not found")

    delete_goal(db, goal)

    return {"message": "Goal deleted successfully"}


# -----------------------------------------
# CREATE MILESTONE
# -----------------------------------------

@router.post(
    "/{goal_id}/milestones",
    response_model=MilestoneResponse,
    status_code=201
)
def add_milestone(
    goal_id: int,
    data: MilestoneCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    goal = get_goal(db, goal_id, current_user.id)

    if not goal:
        raise HTTPException(404, "Goal not found")

    return create_milestone(db, goal, data)


# -----------------------------------------
# UPDATE MILESTONE
# -----------------------------------------

@router.patch(
    "/{goal_id}/milestones/{milestone_id}",
    response_model=MilestoneResponse
)
def edit_milestone(
    goal_id: int,
    milestone_id: int,
    data: MilestoneUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    goal = get_goal(db, goal_id, current_user.id)

    if not goal:
        raise HTTPException(404, "Goal not found")

    milestone = get_milestone(db, goal_id, milestone_id)

    if not milestone:
        raise HTTPException(404, "Milestone not found")

    try:
        return update_milestone(db, milestone, data)
    except ValueError as error:
        raise HTTPException(422, str(error))


# -----------------------------------------
# DELETE MILESTONE
# -----------------------------------------

@router.delete("/{goal_id}/milestones/{milestone_id}")
def remove_milestone(
    goal_id: int,
    milestone_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    goal = get_goal(db, goal_id, current_user.id)

    if not goal:
        raise HTTPException(404, "Goal not found")

    milestone = get_milestone(db, goal_id, milestone_id)

    if not milestone:
        raise HTTPException(404, "Milestone not found")

    delete_milestone(db, milestone)

    return {"message": "Milestone deleted successfully"}
