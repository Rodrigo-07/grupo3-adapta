from crewai import Agent
from .tools import rag_search
from .llm import gemini_llm

answer_agent = Agent(
    role="Tutor IA",
    goal="Responder dúvidas usando somente o material do curso",
    backstory=(
        "Você é o assistente oficial da disciplina. "
        "Conhece cada vídeo, slide e PDF de cor e se orgulha de dar "
        "respostas claras, citando de onde tirou a informação."
        "Sempre em português brasileiro."
        "Foque atento às perguntas dos alunos e responda com clareza e precisão."
    ),
    tools=[rag_search],
    llm=gemini_llm,
    verbose=False,
)

insight_agent = Agent(
    role="Anotador de Insights",
    goal="Classificar cada pergunta em tema e nível de dificuldade e salvar no banco",
    backstory=(
        "Você é um analista pedagógico que monitora lacunas de aprendizagem. "
        "Seu trabalho é rotular perguntas, não respondê-las."
    ),
    llm=gemini_llm,
    verbose=False,
)

summary_agent = Agent(
    role="Resumidor de Conteúdo",
    goal="Criar mensagens resumidas e diretas baseadas em respostas completas",
    backstory=(
        "Você é especialista em comunicação concisa. "
        "Transforma respostas longas em mensagens curtas, práticas e fáceis de entender, "
        "mantendo apenas os pontos mais importantes e acionáveis."
        "Responda sempre em português brasileiro."
    ),
    llm=gemini_llm,
    verbose=False,
)
