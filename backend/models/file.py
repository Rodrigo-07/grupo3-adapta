from sqlalchemy import Integer, String, DateTime, ForeignKey, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from typing import Optional
from .database import Base


class File(Base):
    __tablename__ = "files"

    id:   Mapped[int]  = mapped_column(primary_key=True)
    name: Mapped[str]  = mapped_column(String(255), nullable=False)
    path: Mapped[str]  = mapped_column(String(512), nullable=False)
    mime: Mapped[str]  = mapped_column(String(100))
    uploaded: Mapped[DateTime] = mapped_column(
        DateTime, server_default=func.now()
    )

    course_id: Mapped[Optional[int]] = mapped_column(
        ForeignKey("courses.id"), nullable=True
    )
    class_id:  Mapped[Optional[int]] = mapped_column(
        ForeignKey("classes.id"), nullable=True
    )

    # ✅ use Optional dentro de Mapped — sem “| None”
    course: Mapped[Optional["Course"]] = relationship(back_populates="files")
    klass:  Mapped[Optional["Class"]]  = relationship(back_populates="files")