# langchain_agent/mcp_agent.py
import os, httpx
from langchain_core.messages import HumanMessage
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnableLambda, RunnableSequence
from langchain_google_genai import ChatGoogleGenerativeAI   # ☆ novo

llm = ChatGoogleGenerativeAI(
    model="gemini-1.5-pro-latest",
    temperature=0.7,
    convert_system_message_to_function_call=True 
)

prompt = ChatPromptTemplate.from_messages([
    ("system", "Você é um agente que conversa com um MCP."),
    ("user", "{input}")
])

async def send_to_mcp(text: str) -> str:
    async with httpx.AsyncClient() as client:
        r = await client.post("http://mcp:9000/api", json={"msg": text})
        r.raise_for_status()
        return r.json().get("reply", "[MCP não respondeu]")

agent_chain: RunnableSequence = (
    prompt
    | llm 
    | RunnableLambda(lambda ai: HumanMessage(content=ai.content))
    | send_to_mcp
)

async def ask_mcp(user_text: str) -> str:
    return await agent_chain.ainvoke({"input": user_text})
