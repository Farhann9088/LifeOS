
from sqlalchemy import (
    Column,
    Integer,
    String,
    Text,
    Float,
    DateTime,
    ForeignKey
)
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from app.database.session import Base


class LearningActivity(Base):
    __tablename__ = "learning_activities"

    id = Column(Integer, primary_key=True, index=True)

    title = Column(String(200), nullable=False)
    activity_type = Column(String(50), nullable=False)
    description = Column(Text, nullable=True)

    hours_spent = Column(Float, default=0, nullable=False)

    skill_id = Column(
        Integer,
        ForeignKey("skills.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )

    skill = relationship(
        "Skill",
        back_populates="activities"
    )
