# backend/app/agentic_chat/crew.py
from crewai import Crew, Process
from .agents import answer_agent, insight_agent, summary_agent
from . import tasks
from .llm import set_stream_queue
import asyncio
import json

# Lista global para armazenar steps do reasoning
_reasoning_steps = []

def add_reasoning_step(step: str):
    """Adiciona um step ao reasoning."""
    global _reasoning_steps
    _reasoning_steps.append(step)

def get_reasoning_steps():
    """Retorna e limpa os steps do reasoning."""
    global _reasoning_steps
    steps = _reasoning_steps.copy()
    _reasoning_steps.clear()
    return steps

def clear_reasoning_steps():
    """Limpa os steps do reasoning."""
    global _reasoning_steps
    _reasoning_steps.clear()

tasks.task_answer.agent = answer_agent
tasks.task_insight.agent = insight_agent
tasks.task_summary.agent = summary_agent

tasks.task_insight.context = [tasks.task_answer]
tasks.task_summary.context = [tasks.task_answer]

crew = Crew(
    agents=[answer_agent, insight_agent, summary_agent],
    tasks=[tasks.task_answer, tasks.task_insight, tasks.task_summary],
    process=Process.sequential,   # answer ➜ insight ➜ summary
    verbose=False,
)

async def run_chat(question: str):
    """Executa fluxo completo e devolve (resposta, insight_dict, resumo)."""
    # Limpar reasoning anterior
    clear_reasoning_steps()
    
    # Adicionar steps do processo
    add_reasoning_step(f"🚀 Iniciando análise da pergunta: '{question[:100]}...'")
    add_reasoning_step("🤖 Ativando agente de resposta...")
    
    await crew.kickoff_async(inputs={"question": question})
    
    add_reasoning_step("✅ Resposta gerada com sucesso")
    add_reasoning_step("📊 Analisando insights da pergunta...")
    add_reasoning_step("📋 Gerando resumo da interação...")
    add_reasoning_step("🎯 Processo concluído")
    
    answer = tasks.task_answer.output.raw
    insight = tasks.task_insight.output.json_dict
    summary = tasks.task_summary.output.raw
    return answer, insight, summary

async def run_chat_stream(question: str):
    """Executa fluxo completo com streaming do reasoning em tempo real."""
    
    # Criar queue para eventos de streaming
    stream_queue = asyncio.Queue()
    set_stream_queue(stream_queue)
    
    # Task para executar o crew em background
    async def execute_crew():
        try:
            await crew.kickoff_async(inputs={"question": question})
            # Sinalizar fim da execução
            await stream_queue.put({'type': 'crew_complete'})
        except Exception as e:
            await stream_queue.put({
                'type': 'error',
                'message': f'Erro na execução: {str(e)}'
            })
    
    # Iniciar execução em background
    crew_task = asyncio.create_task(execute_crew())
    
    # Evento inicial
    yield {
        'type': 'start',
        'message': f'🚀 Iniciando análise da pergunta: "{question[:100]}..."'
    }
    
    crew_completed = False
    answer_streamed = False
    summary_streamed = False
    
    # Loop principal de streaming
    while not crew_completed or not stream_queue.empty():
        try:
            # Aguardar próximo evento com timeout
            event = await asyncio.wait_for(stream_queue.get(), timeout=1.0)
            
            if event['type'] == 'crew_complete':
                crew_completed = True
                
                # Stream da resposta se ainda não foi feito
                if not answer_streamed and hasattr(tasks.task_answer.output, 'raw'):
                    yield {
                        'type': 'reasoning_step',
                        'step': 'streaming_answer',
                        'message': '📝 Transmitindo resposta...'
                    }
                    
                    # Stream da resposta em chunks
                    answer = tasks.task_answer.output.raw
                    words = answer.split()
                    
                    for i in range(0, len(words), 8):  # 8 palavras por chunk
                        chunk = ' '.join(words[i:i+8])
                        yield {
                            'type': 'answer_chunk',
                            'chunk': chunk,
                            'is_final': i + 8 >= len(words)
                        }
                        await asyncio.sleep(0.15)
                    
                    answer_streamed = True
                
                # Enviar insight final
                if hasattr(tasks.task_insight.output, 'json_dict'):
                    insight = tasks.task_insight.output.json_dict
                    yield {
                        'type': 'insight',
                        'data': insight,
                        'message': f'📊 Análise: Tema "{insight.get("tema", "N/A")}" | Dificuldade: {insight.get("dificuldade", "N/A")}'
                    }
                
                # Stream do resumo se ainda não foi feito
                if not summary_streamed and hasattr(tasks.task_summary.output, 'raw'):
                    yield {
                        'type': 'reasoning_step',
                        'step': 'streaming_summary',
                        'message': '📋 Gerando resumo...'
                    }
                    
                    # Stream do resumo
                    summary = tasks.task_summary.output.raw
                    yield {
                        'type': 'summary',
                        'summary': summary,
                        'message': f'📋 Resumo: {summary}'
                    }
                    
                    summary_streamed = True
                
                break
            else:
                # Repassar evento do callback
                yield event
                
        except asyncio.TimeoutError:
            # Timeout - continuar loop
            if crew_completed:
                break
        except Exception as e:
            yield {
                'type': 'error',
                'message': f'Erro no streaming: {str(e)}'
            }
            break
    
    # Limpar queue
    set_stream_queue(None)
    
    # Aguardar conclusão do crew se ainda não terminou
    if not crew_task.done():
        await crew_task
