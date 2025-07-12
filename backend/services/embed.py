import os
from typing import List

from google import genai

api_key = os.getenv("GOOGLE_API_KEY")
if not api_key:
    raise EnvironmentError("Defina GOOGLE_API_KEY no ambiente ou .env")

client = genai.Client(api_key=api_key)

_MODEL_NAME = "gemini-embedding-exp-03-07"
_MAX_BATCH = 100


def embed_batch(texts: List[str]) -> List[List[float]]:
    """
    Gera embeddings em lotes de ≤100 itens, extraindo só os vetores .values.
    Retorna [[float, …], …] — exatamente o formato que o Chroma aceita.
    """
    out: List[List[float]] = []

    for i in range(0, len(texts), _MAX_BATCH):
        chunk = texts[i : i + _MAX_BATCH]

        resp = client.models.embed_content(
            model=_MODEL_NAME,
            contents=chunk,
        )

        # resp.embeddings é uma lista de ContentEmbedding
        out.extend([e.values for e in resp.embeddings])

    return out