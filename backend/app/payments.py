from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from models.database import SessionLocal
from models.user import User
from models.payment import Payment
from services.schemas import PaymentCreate, PaymentOut
from services.payment import create_payment as svc_create_payment

router = APIRouter()

async def get_db():
    async with SessionLocal() as session:
        yield session

@router.post("/", response_model=PaymentOut, status_code=201)
async def new_payment(payload: PaymentCreate, db: AsyncSession = Depends(get_db)):
    if not await db.get(User, payload.user_id):
        raise HTTPException(404, "User not found")
    return await svc_create_payment(db, payload)

@router.get("/", response_model=list[PaymentOut])
async def list_payments(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Payment))
    return result.scalars().all()
