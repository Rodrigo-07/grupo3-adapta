import os
import uuid
import mimetypes
import re
from pathlib import Path
from typing import AsyncIterator, List, Optional, Tuple

import aiofiles
from fastapi import UploadFile, HTTPException
from fastapi.responses import FileResponse, StreamingResponse
from sqlalchemy import select as sa_select
from sqlalchemy.ext.asyncio import AsyncSession

from models.file import File
from services.course_manager import save_file_db

UPLOAD_ROOT = Path(os.getenv("UPLOAD_DIR", "uploads")).resolve()
UPLOAD_ROOT.mkdir(parents=True, exist_ok=True)

# Regex for Range header
RANGE_RE = re.compile(r"bytes=(\d+)-(\d+)?")
DEFAULT_CHUNK = 512 * 1024  # 512 KB


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
    category: Optional[str] = None,
) -> File:
    """Save UploadFile to disk *and* register in DB via save_file()."""
    dest = _build_dest(course_id, lesson_id, upload.filename)
    async with aiofiles.open(dest, "wb") as out:
        while chunk := await upload.read(1024 * 1024):
            await out.write(chunk)
    await upload.close()

    file = await save_file_db(
        session,
        name=upload.filename,
        path=str(dest),
        mime=upload.content_type or "application/octet-stream",
        course_id=course_id,
        lesson_id=lesson_id,
        category=category,
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


def _parse_range(hdr: Optional[str], file_size: int) -> Tuple[int, int]:
    if hdr is None:
        return 0, file_size - 1

    m = RANGE_RE.match(hdr)
    if not m:
        raise HTTPException(416, detail="Invalid Range header")

    start = int(m.group(1))
    end = int(m.group(2)) if m.group(2) else file_size - 1
    if start >= file_size or end >= file_size or start > end:
        raise HTTPException(416, detail="Requested Range Not Satisfiable")
    return start, end


async def stream_file(
    path: str | Path,
    *,
    range_header: Optional[str] = None,
    chunk_size: int = DEFAULT_CHUNK,
) -> StreamingResponse:
    """
    Devolve um StreamingResponse com suporte a Range (vídeo, PDF, etc.).
    """
    p = Path(path)
    if not p.exists():
        raise HTTPException(404, detail="Arquivo não encontrado")

    file_size = p.stat().st_size
    start, end = _parse_range(range_header, file_size)
    length = end - start + 1

    async def _iter() -> AsyncIterator[bytes]:
        async with aiofiles.open(p, "rb") as f:
            await f.seek(start)
            bytes_left = length
            while bytes_left > 0:
                chunk = await f.read(min(chunk_size, bytes_left))
                if not chunk:
                    break
                bytes_left -= len(chunk)
                yield chunk

    mime, _ = mimetypes.guess_type(p.name)
    if not mime:
        print(f"⚠️ MIME not detected for {p.name}, defaulting to video/mp4")
    mime = mime or "video/mp4"

    headers = {
        "Accept-Ranges": "bytes",
        "Content-Length": str(length),
    }
    if range_header:
        headers["Content-Range"] = f"bytes {start}-{end}/{file_size}"

    status_code = 206 if range_header else 200
    return StreamingResponse(
        _iter(),
        status_code=status_code,
        media_type=mime,
        headers=headers,
    )


def delete_physical_file(file: File) -> None:
    p = Path(file.path)
    if p.exists():
        p.unlink()


async def list_files_by_course_or_lesson(
    session: AsyncSession,
    *,
    course_id: int,
    lesson_id: Optional[int] = None,
    category: Optional[str] = None,
) -> list[File]:
    stmt = sa_select(File).where(File.course_id == course_id)

    if lesson_id is not None:
        stmt = stmt.where(File.lesson_id == lesson_id)

    if category is not None:
        stmt = stmt.where(File.category == category)

    result = await session.execute(stmt)
    return list(result.scalars())
