# backend/app/crew_chat/llm.py
import os
from crewai import LLM

gemini_llm = LLM(
    model="gemini/gemini-1.5-pro-latest",
    api_key=os.getenv("GOOGLE_API_KEY"),
    temperature=0.2,
    max_tokens=2048,
    stream=True
)
