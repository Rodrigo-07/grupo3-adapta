from pydantic import BaseModel, Field, ConfigDict, constr
from datetime import datetime
from typing import List, Optional

class UserCreate(BaseModel):
    email: str
    full_name: str | None = None

class UserOut(UserCreate):
    id: int
    created_at: datetime
    model_config = {"from_attributes": True}

class PaymentCreate(BaseModel):
    user_id: int
    amount: float = Field(gt=0)

class PaymentOut(BaseModel):
    id: int
    amount: float
    user_id: int
    created_at: datetime
    model_config = {"from_attributes": True}


class CourseCreate(BaseModel):
    title: str = Field(..., strip_whitespace=True, min_length=1)
    description: Optional[str] = Field(None, max_length=1000)


class CourseOut(CourseCreate):
    id: int
    cover_image_path: Optional[str] = None

    class Config:
        orm_mode = True


class LessonOut(BaseModel):
    id: int
    title: str
    description: Optional[str] = None
    video: Optional[str] = None
    course_id: int
    thread: Optional[dict] = None

    model_config = ConfigDict(from_attributes=True)
    
class LessonIn(BaseModel):
    title: constr(strip_whitespace=True, min_length=1)
    description: Optional[str] = Field(None, max_length=1000)
    video: Optional[str] = Field(None, max_length=255)


