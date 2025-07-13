from fastapi import APIRouter, status
from pydantic import BaseModel
from app.agentic_chat.crew import run_chat
from typing import Dict, Any
# from services.analytics import store_insight
router = APIRouter()

class ChatIn(BaseModel):
    user_id: int
    message: str

@router.post("/{course_id}/chat", status_code=status.HTTP_200_OK)
async def chat(course_id: int, body: ChatIn) -> Dict[str, Any]:
    answer, insight = await run_chat(course_id, body.message)
    # await store_insight(course_id, body.user_id, insight)
    return {"answer": answer, "insight": insight}
