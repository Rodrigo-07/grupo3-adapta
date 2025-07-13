from .utils import extract_audio, transcribe_audio, clip_video
from .agent import chunk_transcript_with_gemini
from pathlib import Path
import os

UPLOADS_ROOT = Path("/app/uploads").resolve()

def process_local_video(video_path: str, course_id: int = None, lesson_id: int = None):
    src = Path(video_path).resolve()
    if not src.exists():
        raise FileNotFoundError(f"Video file not found: {src}")

    # 2 ▸ define pasta de destino
    if course_id is not None and lesson_id is not None:
        dest_dir = UPLOADS_ROOT / f"course_{course_id}/lesson_{lesson_id}/shorts"
    else:
        dest_dir = UPLOADS_ROOT / "default/shorts"
        
    dest_dir.mkdir(parents=True, exist_ok=True)

    
    print(f"Processing video: {video_path}")
    audio_path = extract_audio(video_path)
    transcript_segments = transcribe_audio(audio_path)
    segments = chunk_transcript_with_gemini(transcript_segments)

    results: List[dict] = []
    path_names: List[str] = []

    base = src.stem
    for i, (start, end, text) in enumerate(segments):
        short_name = f"{base}_part{i}.mp4"
        out_path = dest_dir / short_name
        clip_video(src, start, end, out_path)

        path_names.append(str(out_path))

        results.append(
            {
                "start": start,
                "end": end,
                "text": text,
                "short_path": str(out_path),
            }
        )

    return results, transcript_segments, path_names