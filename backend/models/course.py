from sqlalchemy import Integer, String, DateTime, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from typing import Optional
from .database import Base


class Course(Base):
    __tablename__ = "courses"

    id:   Mapped[int] = mapped_column(primary_key=True)
    title: Mapped[str]
    description: Mapped[Optional[str]]

    lessons: Mapped[list["Lesson"]] = relationship(
        back_populates="course", cascade="all, delete-orphan"
    )
    files: Mapped[list["File"]] = relationship(
        back_populates="course", cascade="all, delete-orphan"
    )
    cover_image_path: Mapped[Optional[str]] = mapped_column(
        String(255), nullable=True, default=None
    )
