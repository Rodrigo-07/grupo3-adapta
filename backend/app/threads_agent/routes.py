from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from pathlib import Path
from app.threads_agent.agent import run_thread_agent

router = APIRouter()


class ThreadRequest(BaseModel):
    txt_path: str  # e.g. "app/threads_agent/test_input/sample.txt"


@router.post("/generate")
async def generate_thread(req: ThreadRequest):
    txt_path = Path(req.txt_path)
    if not txt_path.exists():
        raise HTTPException(status_code=404, detail="TXT file not found")

    try:
        run_thread_agent(str(txt_path))
        return {"status": "ok", "message": f"Thread generated for {txt_path.name}"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
