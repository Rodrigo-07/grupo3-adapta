import subprocess
from faster_whisper import WhisperModel

FFMPEG_PATH = "/usr/bin/ffmpeg"  # Use the full path from `which ffmpeg`

def extract_audio(video_path: str) -> str:
    audio_path = video_path.replace(".mp4", ".wav")
    subprocess.run([
        FFMPEG_PATH, "-y", "-i", video_path,
        "-vn", "-acodec", "pcm_s16le", audio_path
    ])
    return audio_path

def transcribe_audio(audio_path: str):
    model = WhisperModel("base")
    segments, _ = model.transcribe(audio_path, word_timestamps=True)
    return list(segments)

def clip_video(video_path: str, start: float, end: float, output_path: str):
    subprocess.run([
        FFMPEG_PATH, "-y",
        "-ss", str(start),
        "-to", str(end),
        "-i", video_path,
        "-c:v", "libx264",      # re-encode video
        "-c:a", "aac",          # re-encode audio
        "-preset", "fast",      # faster encoding
        "-crf", "23",           # constant rate factor (lower = better quality)
        output_path
    ])
