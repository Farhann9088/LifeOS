
from sqlalchemy.orm import Session

from app.models.task import Task
from app.schemas.task import TaskCreate, TaskUpdate


def get_tasks(db: Session, user_id: int):
    return (
        db.query(Task)
        .filter(Task.user_id == user_id)
        .order_by(Task.created_at.desc())
        .all()
    )


def get_task(db: Session, task_id: int, user_id: int):
    return (
        db.query(Task)
        .filter(
            Task.id == task_id,
            Task.user_id == user_id
        )
        .first()
    )


def create_task(
    db: Session,
    task_data: TaskCreate,
    user_id: int
):
    new_task = Task(
        **task_data.model_dump(),
        user_id=user_id
    )

    db.add(new_task)
    db.commit()
    db.refresh(new_task)

    return new_task


def update_task(
    db: Session,
    task: Task,
    task_data: TaskUpdate
):
    update_data = task_data.model_dump(exclude_unset=True)

    db_update = update_data.copy()

    for field in ("title", "priority", "completed"):
        if field in db_update and db_update[field] is None:
            raise ValueError(f"{field} cannot be null")

    for key, value in db_update.items():
        setattr(task, key, value)

    db.commit()
    db.refresh(task)

    return task


def delete_task(db: Session, task: Task):
    db.delete(task)
    db.commit()

    return True
