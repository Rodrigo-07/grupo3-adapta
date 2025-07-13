from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Header, Depends
from typing import List, Optional
from pathlib import Path
from services.file_manager import stream_file
from services.file_manager import list_files_by_course_or_lesson
from sqlalchemy.ext.asyncio import AsyncSession
from models.database import SessionLocal

import asyncio

from services.ingest import process_and_index

router = APIRouter()

async def get_db() -> AsyncSession:  # pragma: no cover
    async with SessionLocal() as session:
        yield session


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

@router.get("/files")
async def list_files_endpoint(
    course_id: int | None = None,
    lesson_id: int | None = None,
    category: str | None = None,
    db: AsyncSession = Depends(get_db),
):
    if course_id is None and lesson_id is None:
        raise HTTPException(400, detail="course_id or lesson_id must be provided")

    files = await list_files_by_course_or_lesson(
        db,
        course_id=course_id if course_id is not None else 0,
        lesson_id=lesson_id,
        category=category,
    )
    return files
