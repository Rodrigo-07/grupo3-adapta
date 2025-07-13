from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from app.users import router as users_router
from app.payments import router as payments_router
from app.contents import router as contents_router
from app.courses import router as courses_router
from app.shorts_agent.routes import router as shorts_router
from app.threads_agent.routes import router as threads_router
from app.chat import router as chat_router
from models.database import Base, engine
from dotenv import load_dotenv

load_dotenv(".env")

import models

async def create_tables():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

class CORStaticFiles(StaticFiles):
    async def get_response(self, path, scope):
        response = await super().get_response(path, scope)
        response.headers["Access-Control-Allow-Origin"] = "*"
        response.headers["Access-Control-Allow-Methods"] = "GET, OPTIONS"
        response.headers["Access-Control-Allow-Headers"] = "*"
        return response

app = FastAPI(
    title="FastPay API",
    version="0.1.0",
    on_startup=[create_tables],
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For development; restrict in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/uploads", CORStaticFiles(directory="uploads"), name="uploads")

app.include_router(users_router, prefix="/users", tags=["Users"])
app.include_router(payments_router, prefix="/payments", tags=["Payments"])
app.include_router(contents_router, prefix="/contents", tags=["Contents"])
app.include_router(courses_router, prefix="/courses", tags=["Courses & Lessons"])
app.include_router(shorts_router, prefix="/shorts")
app.include_router(threads_router, prefix="/threads")
app.include_router(chat_router, prefix="/chat", tags=["Chat"])

@app.get("/")
async def read_root():
    return {"status": "ok"}
