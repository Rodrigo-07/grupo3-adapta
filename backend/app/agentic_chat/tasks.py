# backend/app/crew_chat/tasks.py
from crewai import Task
from pydantic import BaseModel

class InsightJSON(BaseModel):
    tema: str
    dificuldade: str

task_answer = Task(
    description=(
        "Use o tool `rag_search` para responder.\n"
        "Chame EXATAMENTE assim (sem alterar a chave):\n\n"
        "```rag_search({\"question\": \"{question}\", \"course_id\": \"{course_id}\"})```"
    ),
    required_inputs=["question", "course_id"],
    expected_output="Até 3 parágrafos em PT-BR.",
)

task_insight = Task(
    description=(
        "Para a pergunta \"{question}\" devolva SOMENTE JSON no formato "
        '{"tema":<str>,"dificuldade":<baixo|medio|alto>}'
    ),
    required_inputs=["question"],
    expected_output="JSON conforme schema",
    output_json=InsightJSON,
)