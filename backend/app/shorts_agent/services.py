import os
from .utils import extract_audio, transcribe_audio, clip_video
from .agent import chunk_transcript_with_gemini

def process_local_video(video_path: str):
    if not os.path.exists(video_path):
        raise FileNotFoundError(f"Video file not found: {video_path}")

    os.makedirs("processed/shorts", exist_ok=True)

    audio_path = extract_audio(video_path)
    transcript_segments = transcribe_audio(audio_path)
    segments = chunk_transcript_with_gemini(transcript_segments)

    results = []

    for i, (start, end, text) in enumerate(segments):
        output_path = f"processed/shorts/{os.path.basename(video_path).replace('.mp4', f'_part{i}.mp4')}"
        clip_video(video_path, start, end, output_path)

        results.append({
            "start": start,
            "end": end,
            "text": text,
            "short_path": output_path,
        })

    return results
