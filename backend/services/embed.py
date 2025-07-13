import os
from typing import List

from google import genai
from langchain.vectorstores import Chroma

import asyncio, random
from tenacity import retry, wait_random_exponential, stop_after_attempt, retry_if_exception_type
from google.genai import errors as gerrors

import time

from services.ingest import CHROMA_CLIENT

api_key = os.getenv("GOOGLE_API_KEY")
if not api_key:
    raise EnvironmentError("Defina GOOGLE_API_KEY no ambiente ou .env")

client = genai.Client(api_key=api_key)

_MODEL_NAME = "gemini-embedding-exp-03-07"
_MAX_BATCH = 100


_MAX_BATCH = 32
_MIN_DELAY = 2.5
_JITTER    = 1.0

@retry(
    retry=retry_if_exception_type(gerrors.ClientError),
    wait=wait_random_exponential(multiplier=2, max=60),
    stop=stop_after_attempt(6),
)
def _gemini_call(chunk):
    return client.models.embed_content(
        model=_MODEL_NAME,
        contents=chunk,
    )

def embed_batch(texts: list[str]) -> list[list[float]]:
    vecs: list[list[float]] = []
    for i in range(0, len(texts), _MAX_BATCH):
        part = texts[i : i + _MAX_BATCH]

        resp = _gemini_call(part)          # sync
        vecs.extend([e.values for e in resp.embeddings])

        time.sleep(_MIN_DELAY + random.random() * _JITTER)  # sync sleep
    return vecs

def get_retriever(course_id: int, k: int = 8):
    """
    Configura um retriever para buscar trechos relevantes de um curso usando Gemini embeddings.
    """
    collection_name = f"course_{course_id}"
    vectorstore = Chroma(
        collection_name=collection_name,
        embedding_function=embed_batch,
        client=CHROMA_CLIENT,
    )
    retriever = vectorstore.as_retriever(search_kwargs={"k": k})
    return retriever
