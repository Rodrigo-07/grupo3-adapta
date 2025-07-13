from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Header
from typing import List, Optional
from pathlib import Path
from services.file_manager import stream_file
import asyncio

from services.ingest import process_and_index

router = APIRouter()

@router.post("/{course_id}/content", status_code=201)
async def upload_contents(
    course_id: str,
    lecture_id: Optional[str] = Form(None),
    files: List[UploadFile] = File([]),
    raw_texts: Optional[List[str]] = Form(None),
    links: Optional[List[str]] = Form(None),
):
    if not (files or raw_texts or links):
        raise HTTPException(400, detail="Nenhum conteúdo enviado")

    await asyncio.to_thread(
        process_and_index,
        course_id,
        lecture_id,
        files,
        raw_texts or [],
        links or [],
    )

    # 3) resposta só vem depois que tudo foi vetorizado
    return {"detail": "Vectorização concluída com sucesso"}

@router.get("/media/{file_path:path}")
async def serve_media(
    file_path: str,
    range: Optional[str] = Header(None),
):
    absolute_path = Path("uploads") / file_path
    return await stream_file(absolute_path, range_header=range)
