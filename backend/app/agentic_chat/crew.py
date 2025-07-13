# backend/app/agentic_chat/crew.py
from crewai import Crew, Process
from .agents import answer_agent, insight_agent, summary_agent
from . import tasks

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
