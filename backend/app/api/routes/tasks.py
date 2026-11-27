
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.models.user import User
from app.schemas.task import TaskCreate, TaskUpdate, TaskResponse
from app.services.task_service import (
    get_tasks,
    get_task,
    create_task,
    update_task,
    delete_task
)
from app.api.routes.auth import get_current_user


router = APIRouter(
    prefix="/tasks",
    tags=["Task Management"]
)


# -----------------------------------------
# CREATE TASK
# -----------------------------------------

@router.post(
    "/",
    response_model=TaskResponse,
    status_code=status.HTTP_201_CREATED
)
def create_new_task(
    task_data: TaskCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return create_task(db, task_data, current_user.id)


# -----------------------------------------
# GET ALL TASKS
# -----------------------------------------

@router.get("/", response_model=list[TaskResponse])
def read_tasks(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return get_tasks(db, current_user.id)


# -----------------------------------------
# GET SINGLE TASK
# -----------------------------------------

@router.get("/{task_id}", response_model=TaskResponse)
def read_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    task = get_task(db, task_id, current_user.id)

    if not task:
        raise HTTPException(
            status_code=404,
            detail="Task not found"
        )

    return task


# -----------------------------------------
# UPDATE TASK
# -----------------------------------------

@router.patch("/{task_id}", response_model=TaskResponse)
def edit_task(
    task_id: int,
    task_data: TaskUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    task = get_task(db, task_id, current_user.id)

    if not task:
        raise HTTPException(
            status_code=404,
            detail="Task not found"
        )

    try:
        return update_task(db, task, task_data)
    except ValueError as error:
        raise HTTPException(
            status_code=422,
            detail=str(error)
        )


# -----------------------------------------
# DELETE TASK
# -----------------------------------------

@router.delete("/{task_id}")
def remove_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    task = get_task(db, task_id, current_user.id)

    if not task:
        raise HTTPException(
            status_code=404,
            detail="Task not found"
        )

    delete_task(db, task)

    return {
        "message": "Task deleted successfully"
    }
