import os
from typing import List, Optional, Annotated

from fastapi import APIRouter, Depends, HTTPException, status, Form, File, UploadFile, Query
from pydantic import BaseModel, Field, constr
from sqlalchemy.ext.asyncio import AsyncSession

from services.course_manager import (
    create_course,
    create_lesson,
    get_course,
)
from models.database import SessionLocal

from services.schemas import CourseCreate, CourseOut

import json
from typing import List, Dict, Any, Optional

from services.course_manager import create_course, create_lesson, get_course, get_lesson, list_lessons_by_course, save_file_db
from services.file_manager import store_upload
from services.schemas import CourseCreate, CourseOut, LessonIn, LessonOut

from app.shorts_agent.services import process_local_video
from app.threads_agent.agent import generate_thread_from_transcript

async def get_db() -> AsyncSession:  # pragma: no cover
    async with SessionLocal() as session:
        yield session


router = APIRouter(prefix="/courses", tags=["Courses & Lessons"])

# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------

@router.post("/", response_model=CourseOut, status_code=status.HTTP_201_CREATED)
async def create_course_endpoint(
    title: str = Form(..., min_length=1),
    description: Optional[str] = Form(None, max_length=1000),
    cover_image: UploadFile = File(..., description="Cover image for the course"),
    db: AsyncSession = Depends(get_db),
):
    course = await create_course(db, title=title, description=description)

    # Salvar imagem de capa
    stored_image = await store_upload(db, cover_image, course_id=course.id)
    course.cover_image_path = stored_image.path
    await db.commit()

    return course

@router.post(
    "/{course_id}/lessons",
    response_model=LessonOut,
    status_code=status.HTTP_201_CREATED,
)
async def create_lesson_with_upload(
    course_id: int,
    title: str = Form(..., min_length=1),
    description: Optional[str] = Form(None, max_length=1000),
    video: UploadFile = File(..., description="Arquivo de vídeo principal"),
    attachments: Annotated[List[Any], File()] = [],
    db: AsyncSession = Depends(get_db),
):
    if await get_course(db, course_id) is None:
        raise HTTPException(status_code=404, detail="Course not found")
    
    safe_attachments = [
        f for f in (attachments or [])
        if isinstance(f, UploadFile) and f.filename
    ]

    lesson = await create_lesson(
        db,
        course_id=course_id,
        title=title,
        description=description,
        video=None,
    )

    stored_video = await store_upload(db, video, course_id, lesson.id)
    
    results, transcript_segments, path_names = process_local_video(stored_video.path, course_id=course_id, lesson_id=lesson.id)
    
    transcript_text = "\n".join([seg.text for seg in transcript_segments]) 
    
    threads = generate_thread_from_transcript(transcript_text)
    
    lesson.video_transcript = transcript_text
    lesson.video = stored_video.path
    lesson.thread = {"messages": threads}
    await db.commit()
    
    
    for file_up in safe_attachments:
        await store_upload(db, file_up, course_id, lesson.id)
        
    for path in path_names:
        await save_file_db(
            db,
            name=os.path.basename(path),
            path=path,
            mime="video/mp4",
            course_id=course_id,
            lesson_id=lesson.id,
            category="shorts"
        )

    return lesson


@router.post(
    "/{course_id}/lessons/bulk-upload",
    response_model=List[LessonOut],
    status_code=status.HTTP_201_CREATED,
)
async def create_many_lessons_upload(
    course_id: int,
    meta: str = Form(..., description="JSON com array de lições e mapeamento de arquivos"),
    videos: List[UploadFile] = File([]),
    attachments: List[UploadFile] = File([]),
    db: AsyncSession = Depends(get_db),
):


    # 1) curso existe?
    if await get_course(db, course_id) is None:
        raise HTTPException(404, detail="Course not found")

    # 2) parse JSON
    try:
        lessons_meta: List[Dict[str, Any]] = json.loads(meta)
    except json.JSONDecodeError as exc:
        raise HTTPException(400, detail=f"Invalid JSON in 'meta': {exc}")

    # 3) index arquivos por nome
    video_map = {v.filename: v for v in videos}
    attach_map = {a.filename: a for a in attachments}

    created_lessons: List[LessonOut] = []

    for item in lessons_meta:
        try:
            title = item["title"]
            description = item.get("description")
            video_name: Optional[str] = item.get("video")
            file_names: List[str] = item.get("files", [])
        except KeyError as missing:
            raise HTTPException(400, detail=f"Missing key {missing} in lesson meta")

        # 3a) cria lesson
        lesson_obj = await create_lesson(
            db,
            course_id=course_id,
            title=title,
            description=description,
            video=None,  # URL será preenchida após salvar o vídeo
        )

        # 3b) vídeo principal
        if video_name:
            if video_name not in video_map:
                raise HTTPException(400, detail=f"Video '{video_name}' not found in upload")
            stored = await store_upload(db, video_map[video_name], course_id=course_id, lesson_id=lesson_obj.id)
            # atualiza campo 'video' da lesson
            await lesson_obj.__class__.__table__.update().where(lesson_obj.__class__.id == lesson_obj.id).values(video=stored.path)

        # 3c) anexos
        for fname in file_names:
            if fname not in attach_map:
                raise HTTPException(400, detail=f"Attachment '{fname}' not found in upload")
            await store_upload(db, attach_map[fname], course_id=course_id, lesson_id=lesson_obj.id)

        created_lessons.append(lesson_obj)

    return created_lessons


@router.get("/", response_model=List[CourseOut])
async def list_courses_endpoint(
    db: AsyncSession = Depends(get_db),
    offset: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
):
    from services.course_manager import list_courses
    courses = await list_courses(db, offset=offset, limit=limit)
    return courses


@router.get("/{course_id}", response_model=CourseOut)
async def get_course_endpoint(
    course_id: int,
    with_lessons: bool = Query(False, description="Incluir aulas no payload"),
    db: AsyncSession = Depends(get_db),
):
    course = await get_course(db, course_id, with_lessons=with_lessons)
    if course is None:
        raise HTTPException(404, detail="Course not found")
    return course


@router.get("/{course_id}/lessons", response_model=List[LessonOut])
async def list_lessons_endpoint(
    course_id: int,
    db: AsyncSession = Depends(get_db),
):
    if await get_course(db, course_id) is None:
        raise HTTPException(404, detail="Course not found")
    return await list_lessons_by_course(db, course_id)


@router.get("/{course_id}/lessons/{lesson_id}", response_model=LessonOut)
async def get_lesson_endpoint(
    course_id: int,
    lesson_id: int,
    with_files: bool = Query(False),
    db: AsyncSession = Depends(get_db),
):
    lesson = await get_lesson(db, lesson_id, with_files=with_files)
    if lesson is None or lesson.course_id != course_id:
        raise HTTPException(404, detail="Lesson not found in this course")
    return lesson