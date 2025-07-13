import json
from typing import List, Tuple
from google import generativeai as genai
from app.config import GOOGLE_API_KEY

genai.configure(api_key=GOOGLE_API_KEY)
model = genai.GenerativeModel("models/gemini-2.5-pro")


def classify_video_type(transcript: str) -> str:
    prompt = f"""
You are a video classifier. Given a transcript, return one of:

- podcast
- narrated_explainer
- tutorial
- interview
- other

Respond only with the word. No explanation.

Transcript:
{transcript[:8000]}
"""
    try:
        res = model.generate_content(prompt)
        return res.text.strip().lower()
    except Exception as e:
        print("Classification error:", e)
        return "other"


def build_prompt(video_type: str, raw_text: str) -> str:
    base_instructions = """
Each segment must:
- Be between 20 to 120 seconds
- Correspond to a clear, single idea
- Avoid splitting sentences mid-way
- Have an accurate start and end timestamp

Important: Never cut a chunk in the middle of a sentence or word.
Important: Focus only on valuable content (skip ads, shoutouts, etc.).

Return as a JSON array like:
[
  {
    "start": 0.0,
    "end": 28.9,
    "text": "In this part, the speaker..."
  },
  ...
]
"""

    if video_type == "podcast":
        return f"""
You are an intelligent podcast assistant.

Your job is to segment podcasts into short, self-contained clips.

Important: Make shure to include all the questions.

Dont make two consecutive shorts consisting only of questions.

Ensure full questions and responses are preserved in each short. Never cut in the middle of a guest’s response.

Important: Make sure to make no more than 2 shorts with answers for every question.
{base_instructions}

Transcript:
{raw_text}
"""

    elif video_type == "tutorial":
        return f"""
You are an assistant for segmenting tutorial videos into logical steps.

Ensure each short includes a full action or instruction, never split steps.

{base_instructions}

Transcript:
{raw_text}
"""

    elif video_type == "narrated_explainer":
        return f"""
You are editing a narrated explainer video.

Split into standalone educational insights or ideas.

{base_instructions}

Transcript:
{raw_text}
"""

    elif video_type == "interview":
        return f"""
This is an interview. Each short should contain a full question and full answer.

Avoid any mid-answer cuts.

{base_instructions}

Transcript:
{raw_text}
"""

    else:
        return f"""
You are a smart assistant that breaks down videos into short, coherent clips for social media.

Focus on clarity, full ideas, and sentence boundaries.

{base_instructions}

Transcript:
{raw_text}
"""


def chunk_transcript_with_gemini(transcript_segments: List) -> List[Tuple[float, float, str]]:
    raw_text = "".join(
        f"[{s.start:.2f}-{s.end:.2f}] {s.text.strip()}\n" for s in transcript_segments
    )

    video_type = classify_video_type(raw_text)
    print(f"📺 Video type detected: {video_type}")

    prompt = build_prompt(video_type, raw_text)

    try:
        response = model.generate_content(
            prompt,
            generation_config={
                "response_mime_type": "application/json"
            }
        )

        raw_json = (
            response.text.strip()
            if hasattr(response, "text") and response.text
            else (response.parts[0].text.strip() if hasattr(response, "parts") and response.parts else "")
        )

        if not raw_json or not raw_json.startswith("["):
            raise ValueError("Gemini returned no valid JSON content.")

        print("🔍 Gemini raw output:\n", raw_json)

        chunks = json.loads(raw_json)
        return [(c["start"], c["end"], c["text"]) for c in chunks]

    except Exception as e:
        print("Gemini chunking error:", e)
        return []
