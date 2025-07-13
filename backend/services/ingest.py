import asyncio
from uuid import uuid4
from typing import List, Optional

import chromadb
from fastapi import UploadFile
from langchain.text_splitter import RecursiveCharacterTextSplitter

# Config do ChromaDB
TEXT_SPLITTER = RecursiveCharacterTextSplitter(
    chunk_size=800, chunk_overlap=120
)
CHROMA_CLIENT = chromadb.PersistentClient(path="data/chroma")

GLOBAL_COLLECTION_NAME = "global_collection"

from services.embed import embed_batch

def process_and_index(
    lecture_id: Optional[str],
    files: List[UploadFile],
    raw_texts: List[str],
    links: List[str],
):
    docs, metas = [], []

    for up in files:
        text = _extract_text_from_file(up)
        _append_chunks(text, docs, metas, lecture_id, up.filename, "file")

    for txt in raw_texts:
        _append_chunks(txt, docs, metas, lecture_id, "inline", "raw")

    print(f"Indexando {len(docs)} documentos na coleção global...")

    collection = CHROMA_CLIENT.get_or_create_collection(name=GLOBAL_COLLECTION_NAME)
    ids = [uuid4().hex for _ in docs]
    embeds = embed_batch(docs)
    collection.add(ids=ids, documents=docs, embeddings=embeds, metadatas=metas)

def _append_chunks(text, docs, metas, lid, src, kind):
    for chunk in TEXT_SPLITTER.split_text(text):
        docs.append(chunk)
        metas.append(
            {
                "lecture_id": lid,
                "src": src,
                "kind": kind,
            }
        )


def _extract_text_from_file(up: UploadFile) -> str:
    """
    Roube um extrator adequado conforme o MIME:
    - PDF  → pypdf
    - docx → python-docx
    - vídeo → whisper
    """
    suffix = up.filename.split(".")[-1].lower()
    if suffix == "pdf":
        from pypdf import PdfReader

        rdr = PdfReader(up.file)
        return "\n".join(p.extract_text() or "" for p in rdr.pages)

    raise ValueError(f"Formato não suportado: {suffix}")


def _fetch_url_text(url: str) -> str:
    import requests
    from bs4 import BeautifulSoup

    html = requests.get(url, timeout=10).text
    soup = BeautifulSoup(html, "html.parser")
    return soup.get_text(" ", strip=True)
