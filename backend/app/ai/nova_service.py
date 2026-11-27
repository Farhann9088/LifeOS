
import os
import logging

from dotenv import load_dotenv
from groq import Groq
from sqlalchemy.orm import Session, selectinload

from app.models.task import Task
from app.models.goal import Goal
from app.models.skill import Skill
from app.models.career_milestone import CareerMilestone


load_dotenv()

logger = logging.getLogger(__name__)

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
MODEL_NAME = os.getenv(
    "GROQ_MODEL",
    "llama-3.3-70b-versatile"
)


def get_groq_client():
    if not GROQ_API_KEY:
        raise ValueError("GROQ_API_KEY is missing from backend/.env")

    return Groq(api_key=GROQ_API_KEY)


def get_user_context(db: Session, user_id: int):

    tasks = (
        db.query(Task)
        .filter(Task.user_id == user_id)
        .all()
    )

    goals = (
        db.query(Goal)
        .options(selectinload(Goal.milestones))
        .filter(Goal.user_id == user_id)
        .all()
    )

    skills = (
        db.query(Skill)
        .options(selectinload(Skill.activities))
        .filter(Skill.user_id == user_id)
        .all()
    )

    career_milestones = (
        db.query(CareerMilestone)
        .filter(CareerMilestone.user_id == user_id)
        .all()
    )

    task_data = [
        {
            "title": task.title,
            "priority": task.priority,
            "completed": task.completed,
            "due_date": str(task.due_date) if task.due_date else None
        }
        for task in tasks
    ]

    goal_data = []

    for goal in goals:
        total = len(goal.milestones)
        completed = sum(
            1 for milestone in goal.milestones
            if milestone.completed
        )

        progress = (
            round(completed / total * 100)
            if total else (
                100 if goal.status == "completed" else 0
            )
        )

        goal_data.append({
            "title": goal.title,
            "status": goal.status,
            "progress": progress,
            "milestones": [
                {
                    "title": milestone.title,
                    "completed": milestone.completed
                }
                for milestone in goal.milestones
            ]
        })

    skill_data = [
        {
            "name": skill.name,
            "category": skill.category,
            "current_level": skill.current_level,
            "target_level": skill.target_level,
            "learning_activities": [
                {
                    "title": activity.title,
                    "activity_type": activity.activity_type,
                    "hours_spent": activity.hours_spent
                }
                for activity in skill.activities
            ]
        }
        for skill in skills
    ]

    career_data = [
        {
            "title": milestone.title,
            "completed": milestone.completed,
            "target_date": (
                str(milestone.target_date)
                if milestone.target_date else None
            )
        }
        for milestone in career_milestones
    ]

    return {
        "tasks": task_data,
        "goals": goal_data,
        "skills": skill_data,
        "career_milestones": career_data
    }


def generate_nova_response(
    db: Session,
    user_id: int,
    message: str,
    history: list
):

    client = get_groq_client()

    context = get_user_context(db, user_id)

    system_instruction = f"""
You are NOVA, the personal AI assistant inside LifeOS.

Your purpose is to help users manage:
- Daily productivity
- Tasks and deadlines
- Personal goals
- Milestones
- Career development
- Learning activities

Here is the authenticated user's LifeOS data:

{context}

IMPORTANT INSTRUCTIONS:

1. Use the provided LifeOS data to personalize responses.
2. Never invent tasks, goals, skills or achievements.
3. Help users prioritize important tasks.
4. Give practical and actionable suggestions.
5. If information is unavailable, say so.
6. Be friendly, intelligent and concise.
7. Remember the conversation history provided.
8. You can provide advice but cannot directly modify database records.
9. Never expose private information belonging to another user.

You are NOVA, not a generic chatbot.
"""

    messages = [
        {
            "role": "system",
            "content": system_instruction
        }
    ]

    # Add recent conversation history
    for item in history[-10:]:
        messages.append({
            "role": item.role,
            "content": item.content
        })

    # Add current user message
    messages.append({
        "role": "user",
        "content": message
    })

    try:
        completion = client.chat.completions.create(
            model=MODEL_NAME,
            messages=messages,
            temperature=0.7,
            max_tokens=1024
        )

        reply = completion.choices[0].message.content

        if not reply:
            raise RuntimeError("Groq returned an empty response")

        return reply

    except Exception:
        logger.exception("NOVA Groq API request failed")
        raise
