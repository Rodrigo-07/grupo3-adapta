from fastapi import APIRouter, status
from pydantic import BaseModel
from app.agentic_chat.crew import run_chat, get_reasoning_steps
from typing import Dict, Any
# from services.analytics import store_insight

router = APIRouter()

class ChatIn(BaseModel):
    user_id: int
    message: str

@router.post("/{course_id}/chat", status_code=status.HTTP_200_OK)
async def chat(course_id: int, body: ChatIn) -> Dict[str, Any]:
    answer, insight, summary = await run_chat(body.message)
    reasoning = get_reasoning_steps()  # Obter steps do reasoning
    # await store_insight(course_id, body.user_id, insight)
    return {
        "answer": answer, 
        "insight": insight, 
        "summary": summary,
        "reasoning": reasoning
    }
