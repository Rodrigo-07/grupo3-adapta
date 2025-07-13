import os
import uuid
from pathlib import Path
from typing import AsyncIterator, Optional

import aiofiles
from fastapi import UploadFile, HTTPException
from fastapi.responses import FileResponse, StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession

from models.file import File

from services.course_manager import save_file_db

UPLOAD_ROOT = Path(os.getenv("UPLOAD_DIR", "uploads")).resolve()
UPLOAD_ROOT.mkdir(parents=True, exist_ok=True)


def _safe_name(name: str) -> str:
    return name.replace(" ", "_")


def _build_dest(course_id: int, lesson_id: Optional[int], fname: str) -> Path:
    sub = UPLOAD_ROOT / f"course_{course_id}" / (
        f"lesson_{lesson_id}" if lesson_id else "course_assets"
    )
    sub.mkdir(parents=True, exist_ok=True)
    return sub / f"{uuid.uuid4().hex}_{_safe_name(fname)}"


async def store_upload(
    session: AsyncSession,
    upload: UploadFile,
    course_id: int,
    lesson_id: int | None = None,
) -> File:
    """Save UploadFile to disk *and* register in DB via save_file()."""
    dest = _build_dest(course_id, lesson_id, upload.filename)
    async with aiofiles.open(dest, "wb") as out:
        while chunk := await upload.read(1024 * 1024):
            await out.write(chunk)
    await upload.close()

    # DB row
    file = await save_file_db(
        session,
        name=upload.filename,
        path=str(dest),
        mime=upload.content_type or "application/octet-stream",
        course_id=course_id,
        lesson_id=lesson_id,
    )
    return file


def get_file_response(file: File, *, as_download: bool = True) -> FileResponse:
    path = Path(file.path)
    if not path.exists():
        raise HTTPException(404, detail="Arquivo não encontrado no servidor")
    return FileResponse(
        path,
        filename=file.name if as_download else None,
        media_type=file.mime or "application/octet-stream",
    )


async def stream_file(path: str | Path, chunk: int = 8192) -> StreamingResponse:
    p = Path(path)
    if not p.exists():
        raise HTTPException(404, detail="Arquivo não encontrado")

    async def _iter() -> AsyncIterator[bytes]:
        async with aiofiles.open(p, "rb") as f:
            while data := await f.read(chunk):
                yield data

    return StreamingResponse(_iter(), media_type="application/octet-stream")


def delete_physical_file(file: File) -> None:
    p = Path(file.path)
    if p.exists():
        p.unlink()
