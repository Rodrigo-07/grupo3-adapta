# backend/app/crew_chat/tasks.py
from crewai import Task
from pydantic import BaseModel

class InsightJSON(BaseModel):
    tema: str
    dificuldade: str


task_answer = Task(
    description=(
        "Use o tool `rag_search` para responder.\n"
        "Exemplo: ```rag_search({\"question\":\"{question}\"})```"
    ),
    required_inputs=["question"],
    expected_output="Resposta clara e concisa, citando fontes quando possível.",
    output_json=None,
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

task_summary = Task(
    description=(
        "Com base na resposta completa do agente anterior, "
        "crie uma mensagem resumida de no máximo 2-3 frases que capture os pontos principais. "
        "Seja direto, prático e use linguagem simples. "
        "Analise o contexto das tasks anteriores para criar um resumo efetivo."
    ),
    expected_output="Resumo conciso e direto da resposta principal.",
    output_json=None,
)