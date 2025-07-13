from crewai.tools import tool
from services.embed import get_retriever
import asyncio

# Global queue para eventos de streaming (definida no llm.py)
from .llm import _stream_queue

@tool("rag_search")
def rag_search(question: str, k: int = 8) -> str:
    """
    Executes a retrieval-augmented generation (RAG) search to find relevant documents based on the given question.

    Args:
        question (str): The query or question to search for relevant documents.
        k (int, optional): The number of top documents to retrieve. Defaults to 8.

    Returns:
        str: A concatenated string of the content from the retrieved documents, separated by "---".
             If no documents are found, returns a warning message indicating no results.
    """
    # Enviar evento de início da busca RAG se queue estiver disponível
    if _stream_queue:
        try:
            loop = asyncio.get_event_loop()
            loop.create_task(_stream_queue.put({
                'type': 'reasoning_step',
                'step': 'rag_search_start',
                'message': f'🔍 Buscando por: "{question[:80]}..."'
            }))
        except:
            pass  # Ignore se não conseguir enviar evento
    
    docs = get_retriever(k).invoke(question)
    
    # Enviar evento de conclusão da busca RAG
    if _stream_queue:
        try:
            loop = asyncio.get_event_loop()
            loop.create_task(_stream_queue.put({
                'type': 'reasoning_step', 
                'step': 'rag_search_complete',
                'message': f'✅ Encontrados {len(docs)} documentos relevantes'
            }))
        except:
            pass
    
    if not docs:
        return "⚠️ Nada encontrado no momento."
    
    return "\n\n---\n\n".join(d.page_content for d in docs)