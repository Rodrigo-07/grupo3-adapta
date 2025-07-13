from sqlalchemy import Integer, String, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from typing import Optional
from .database import Base

class Lesson(Base):
    __tablename__ = "lessons"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(String(1000))
    video: Mapped[Optional[str]] = mapped_column(String(255))

    course_id: Mapped[int] = mapped_column(ForeignKey("courses.id"))
    course: Mapped["Course"] = relationship(back_populates="lessons")

    files: Mapped[list["File"]] = relationship(
        back_populates="lesson", cascade="all, delete-orphan"
    )