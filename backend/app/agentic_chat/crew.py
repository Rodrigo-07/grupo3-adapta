# backend/app/agentic_chat/crew.py
from crewai import Crew, Process
from .agents import answer_agent, insight_agent
from . import tasks


tasks.task_answer.agent  = answer_agent
tasks.task_insight.agent = insight_agent

tasks.task_insight.context = [tasks.task_answer]

crew = Crew(
    agents=[answer_agent, insight_agent],
    tasks=[tasks.task_answer, tasks.task_insight],
    process=Process.sequential,   # answer ➜ insight
    verbose=False,
)

async def run_chat( question: str):
    """Executa fluxo completo e devolve (resposta, insight_dict)."""
    await crew.kickoff_async(inputs={"question": question})
    return tasks.task_answer.output.raw, tasks.task_insight.output.json_dict
