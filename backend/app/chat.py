from fastapi import APIRouter, status
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from app.agentic_chat.crew import run_chat, run_chat_stream
from typing import Dict, Any
import json
import asyncio
# from services.analytics import store_insight

router = APIRouter()

class ChatIn(BaseModel):
    user_id: int
    message: str

@router.post("/{course_id}/chat", status_code=status.HTTP_200_OK)
async def chat(course_id: int, body: ChatIn) -> Dict[str, Any]:
    answer, insight = await run_chat(body.message)
    # await store_insight(course_id, body.user_id, insight)
    return {"answer": answer, "insight": insight}

@router.post("/{course_id}/chat/stream")
async def chat_stream(course_id: int, body: ChatIn):
    """Endpoint para streaming do reasoning do agente."""
    
    async def event_generator():
        try:
            # Enviar evento de início
            yield f"data: {json.dumps({'type': 'start', 'message': 'Iniciando análise da pergunta...'})}\n\n"
            
            # Executar o chat com streaming
            async for event in run_chat_stream(body.message):
                yield f"data: {json.dumps(event)}\n\n"
                
            # Evento de finalização
            yield f"data: {json.dumps({'type': 'done'})}\n\n"
            
        except Exception as e:
            error_event = {
                'type': 'error',
                'message': f'Erro durante o processamento: {str(e)}'
            }
            yield f"data: {json.dumps(error_event)}\n\n"
    
    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "*",
        }
    )
