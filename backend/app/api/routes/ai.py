
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.models.user import User

from app.schemas.ai import ChatRequest, ChatResponse

from app.api.routes.auth import get_current_user

from app.ai.nova_service import generate_nova_response


router = APIRouter(
    prefix="/ai",
    tags=["NOVA AI Assistant"]
)


@router.post("/chat", response_model=ChatResponse)
def nova_chat(
    data: ChatRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    try:
        reply = generate_nova_response(
            db=db,
            user_id=current_user.id,
            message=data.message,
            history=data.history
        )

        return {
            "reply": reply,
            "assistant": "NOVA"
        }

    except ValueError as error:
        raise HTTPException(
            status_code=503,
            detail=str(error)
        )

    except Exception:
        raise HTTPException(
            status_code=502,
            detail="NOVA AI service is temporarily unavailable"
        )
