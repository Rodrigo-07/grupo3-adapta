from crewai.tools import tool
from services.embed import get_retriever

@tool("rag_search")
def rag_search(question: str, k: int = 8) -> str:
    """
    Realiza busca semântica no banco de dados de conhecimento.
    
    Args:
        question (str): A pergunta ou termo de busca
        k (int): Número de documentos a retornar (padrão: 8)
    
    Returns:
        str: Conteúdo dos documentos encontrados ou mensagem de erro
    """
    docs = get_retriever(k).invoke(question)
    
    if not docs:
        return "⚠️ Nada encontrado no momento."
    
    return "\n\n---\n\n".join(d.page_content for d in docs)