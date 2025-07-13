import json
from pathlib import Path
from google import generativeai as genai
from app.config import GOOGLE_API_KEY

genai.configure(api_key=GOOGLE_API_KEY)
model = genai.GenerativeModel("models/gemini-2.5-pro")


def read_transcript(file_path: str) -> str:
    with open(file_path, "r", encoding="utf-8") as f:
        return f.read()


def generate_thread_from_transcript(transcript: str) -> list[str]:
    prompt = f"""
You are a content repurposing assistant. Given the transcript of a video, write a compelling X (Twitter) thread summarizing its core ideas, insights, or story.

Each tweet:
- Should be under 280 characters
- Should be engaging, clear, and avoid unnecessary fluff
- May include emojis, hooks, or numbered threads (e.g. "1/", "2/")

Respond with a JSON array of tweets, in order.

Transcript:
{transcript[:12000]}  # truncate if necessary
"""

    try:
        response = model.generate_content(
            prompt,
            generation_config={"response_mime_type": "application/json"}
        )
        raw_json = response.text.strip() if hasattr(response, "text") else ""
        if not raw_json or not raw_json.startswith("["):
            raise ValueError("Invalid or empty response from Gemini")

        return json.loads(raw_json)
    except Exception as e:
        print("❌ Gemini thread generation error:", e)
        return []


def save_thread(thread: list, output_dir: str, name: str):
    Path(output_dir).mkdir(parents=True, exist_ok=True)
    json_path = Path(output_dir) / f"{name}.json"
    txt_path = Path(output_dir) / f"{name}.txt"

    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(thread, f, indent=2, ensure_ascii=False)

    with open(txt_path, "w", encoding="utf-8") as f:
        for tweet in thread:
            text = tweet["text"] if isinstance(tweet, dict) else tweet
            f.write(text + "\n\n")

def run_thread_agent(input_txt_path: str, output_dir: str = "app/threads_agent/outputs"):
    transcript = read_transcript(input_txt_path)
    thread = generate_thread_from_transcript(transcript)
    if thread:
        filename = Path(input_txt_path).stem
        save_thread(thread, output_dir, filename)
        print(f"✅ Thread saved: {filename}.json + {filename}.txt")
    else:
        print("⚠️ No thread generated.")
