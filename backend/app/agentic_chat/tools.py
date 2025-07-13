from crewai.tools import tool
from services.embed import get_retriever

@tool("rag_search")
def rag_search(question: str, k: int = 8) -> str:  # ⬅️ sem course_id
    """
    Executes a retrieval-augmented generation (RAG) search to find relevant documents based on the given question.

    Args:
        question (str): The query or question to search for relevant documents.
        k (int, optional): The number of top documents to retrieve. Defaults to 8.

    Returns:
        str: A concatenated string of the content from the retrieved documents, separated by "---".
             If no documents are found, returns a warning message indicating no results.
    """
    docs = get_retriever(k).invoke(question)
    if not docs:
        return "⚠️ Nada encontrado no momento."
    return "\n\n---\n\n".join(d.page_content for d in docs)