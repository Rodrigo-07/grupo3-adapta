from sqlalchemy import Integer, String, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from .database import Base

class Lesson(Base):
    __tablename__ = "lessons"

    id:    Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str | None] = mapped_column(String(1000))
    video: Mapped[str | None] = mapped_column(String(255))          # caminho URL/S3

    course_id: Mapped[int] = mapped_column(ForeignKey("courses.id"))
    course:    Mapped["Course"] = relationship(back_populates="classes")

    files: Mapped[list["File"]] = relationship(
        back_populates="klass", cascade="all, delete-orphan"
    )
