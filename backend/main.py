from fastapi import FastAPI
from app.users import router as users_router
from app.payments import router as payments_router
from app.materials import router as materials_router
from app.courses import router as courses_router
from models.database import Base, engine
from dotenv import load_dotenv

load_dotenv(".env")

import models

async def create_tables():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

app = FastAPI(
    title="FastPay API",
    version="0.1.0",
    on_startup=[create_tables],
)

app.include_router(users_router, prefix="/users", tags=["Users"])
app.include_router(payments_router, prefix="/payments", tags=["Payments"])
app.include_router(materials_router, prefix="/courses", tags=["Materials"])
app.include_router(courses_router, prefix="/courses", tags=["Courses & Lessons"])

@app.get("/")
async def read_root():
    return {"okss"}
