# backend/app/crew_chat/llm.py
import os
from crewai import LLM
import asyncio
from typing import AsyncGenerator, Dict, Any

# Global queue para eventos de streaming
_stream_queue = None

def set_stream_queue(queue):
    global _stream_queue
    _stream_queue = queue

class StreamingCallback:
    """Callback personalizado para capturar eventos do LLM."""
    
    async def on_llm_start(self, serialized: Dict[str, Any], prompts: list[str], **kwargs):
        if _stream_queue:
            await _stream_queue.put({
                'type': 'reasoning_step',
                'step': 'llm_thinking',
                'message': '🧠 Modelo processando a pergunta...'
            })
    
    async def on_llm_end(self, response, **kwargs):
        if _stream_queue:
            await _stream_queue.put({
                'type': 'reasoning_step', 
                'step': 'llm_complete',
                'message': '✅ Resposta gerada pelo modelo'
            })
    
    async def on_tool_start(self, serialized: Dict[str, Any], input_str: str, **kwargs):
        tool_name = serialized.get('name', 'ferramenta')
        if _stream_queue:
            await _stream_queue.put({
                'type': 'reasoning_step',
                'step': 'tool_execution',
                'message': f'🔧 Executando {tool_name}: {input_str[:100]}...'
            })
    
    async def on_tool_end(self, output: str, **kwargs):
        if _stream_queue:
            await _stream_queue.put({
                'type': 'reasoning_step',
                'step': 'tool_complete', 
                'message': '✅ Ferramenta executada com sucesso'
            })

gemini_llm = LLM(
    model="gemini/gemini-1.5-pro-latest",
    api_key=os.getenv("GOOGLE_API_KEY"),
    temperature=0.2,
    max_tokens=2048,
    stream=True,
    callbacks=[StreamingCallback()]
)
