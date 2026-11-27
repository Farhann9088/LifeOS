
from sqlalchemy.orm import Session

from app.models.user import User
from app.schemas.auth import UserRegister
from app.core.security import hash_password, verify_password


def register_user(db: Session, user_data: UserRegister):
    existing_user = db.query(User).filter(
        User.email == user_data.email.lower()
    ).first()

    if existing_user:
        return None

    new_user = User(
        name=user_data.name,
        email=user_data.email.lower(),
        hashed_password=hash_password(user_data.password)
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return new_user


def authenticate_user(db: Session, email: str, password: str):
    user = db.query(User).filter(
        User.email == email.lower()
    ).first()

    if not user:
        return None

    if not verify_password(password, user.hashed_password):
        return None

    return user
