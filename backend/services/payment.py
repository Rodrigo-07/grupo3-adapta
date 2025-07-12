from sqlalchemy.ext.asyncio import AsyncSession
from models.payment import Payment
from services.schemas import PaymentCreate

async def create_payment(db: AsyncSession, data: PaymentCreate):
    payment = Payment(**data.model_dump())
    db.add(payment)
    await db.commit()
    await db.refresh(payment)
    return payment
