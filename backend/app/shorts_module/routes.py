from fastapi import APIRouter
from pydantic import BaseModel
from .services import process_local_video

router = APIRouter(tags=["Shorts"])

class VideoPathRequest(BaseModel):
    video_path: str  # Local path on your machine

@router.post("/generate")
async def generate_shorts(req: VideoPathRequest):
    result = process_local_video(req.video_path)
    return {"message": "Shorts generated", "results": result}
