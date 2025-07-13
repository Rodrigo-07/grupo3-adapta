from typing import Iterable, Optional
from sqlalchemy import select, update, delete
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload

from models.course import Course
from models.lesson import Lesson
from models.file import File


async def create_course(
    session: AsyncSession,
    *,
    title: str,
    description: Optional[str] = None,
) -> Course:
    course = Course(title=title, description=description)
    session.add(course)
    await session.commit()
    await session.refresh(course)
    return course


async def get_course(session: AsyncSession, course_id: int, *, with_lessons: bool = False) -> Optional[Course]:
    stmt = select(Course).where(Course.id == course_id)
    if with_lessons:
        stmt = stmt.options(joinedload(Course.classes))
    result = await session.execute(stmt)
    return result.scalar_one_or_none()


async def get_course_by_title(session: AsyncSession, title: str) -> Optional[Course]:
    result = await session.execute(
        select(Course).where(Course.title.ilike(title))
    )
    return result.scalar_one_or_none()


async def list_courses(session: AsyncSession, *, offset: int = 0, limit: int = 100) -> Iterable[Course]:
    result = await session.execute(select(Course).offset(offset).limit(limit))
    return result.scalars().all()


async def update_course(session: AsyncSession, course_id: int, **fields) -> Optional[Course]:
    if not fields:
        return await get_course(session, course_id)
    await session.execute(
        update(Course).where(Course.id == course_id).values(**fields)
    )
    await session.commit()
    return await get_course(session, course_id)


async def delete_course(session: AsyncSession, course_id: int) -> None:
    await session.execute(delete(Course).where(Course.id == course_id))
    await session.commit()



async def create_lesson(
    session: AsyncSession,
    course_id: int,
    *,
    title: str,
    description: Optional[str] = None,
    video: Optional[str] = None,
) -> Lesson:
    lesson = Lesson(
        course_id=course_id,
        title=title,
        description=description,
        video=video,
    )
    session.add(lesson)
    await session.commit()
    await session.refresh(lesson)
    return lesson


async def get_lesson(session: AsyncSession, lesson_id: int, *, with_files: bool = False) -> Optional[Lesson]:
    stmt = select(Lesson).where(Lesson.id == lesson_id)
    if with_files:
        stmt = stmt.options(joinedload(Lesson.files))
    result = await session.execute(stmt)
    return result.scalar_one_or_none()


async def list_lessons_by_course(session: AsyncSession, course_id: int) -> Iterable[Lesson]:
    result = await session.execute(
        select(Lesson).where(Lesson.course_id == course_id)
    )
    return result.scalars().all()


async def update_lesson(session: AsyncSession, lesson_id: int, **fields) -> Optional[Lesson]:
    if not fields:
        return await get_lesson(session, lesson_id)
    await session.execute(
        update(Lesson).where(Lesson.id == lesson_id).values(**fields)
    )
    await session.commit()
    return await get_lesson(session, lesson_id)


async def delete_lesson(session: AsyncSession, lesson_id: int) -> None:
    await session.execute(delete(Lesson).where(Lesson.id == lesson_id))
    await session.commit()



async def save_file_db(
    session: AsyncSession,
    *,
    name: str,
    path: str,
    mime: str,
    course_id: int | None = None,
    lesson_id: int | None = None,
) -> File:
    file = File(
        name=name,
        path=path,
        mime=mime,
        course_id=course_id,
        lesson_id=lesson_id,
    )
    session.add(file)
    await session.commit()
    await session.refresh(file)
    return file


async def get_file(session: AsyncSession, file_id: int) -> Optional[File]:
    result = await session.execute(select(File).where(File.id == file_id))
    return result.scalar_one_or_none()


async def list_files_by_course(session: AsyncSession, course_id: int) -> Iterable[File]:
    result = await session.execute(select(File).where(File.course_id == course_id))
    return result.scalars().all()


async def list_files_by_lesson(session: AsyncSession, lesson_id: int) -> Iterable[File]:
    result = await session.execute(select(File).where(File.class_id == lesson_id))
    return result.scalars().all()


async def delete_file(session: AsyncSession, file_id: int) -> None:
    await session.execute(delete(File).where(File.id == file_id))
    await session.commit()
