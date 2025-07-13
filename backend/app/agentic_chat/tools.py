from crewai.tools import tool
from services.embed import get_retriever

@tool("rag_search")
def rag_search(question: str, course_id: int) -> str:
    """
    Busca trechos relevantes do curso para servir de contexto.
    Retorna uma string concatenada (máx. 4 × k ≈ 3 000 tokens).
    """
    retriever = get_retriever(course_id, k=8)
    docs = retriever.invoke(question)
    return "\n\n---\n\n".join(d.page_content for d in docs)
