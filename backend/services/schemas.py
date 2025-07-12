from pydantic import BaseModel, Field
from datetime import datetime

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
