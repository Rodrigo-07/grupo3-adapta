"use client";

import React, { useState, useRef, useEffect, KeyboardEvent } from "react";

interface Message {
  id: string;
  text: string;
  reasoning: string[];
}

export default function Chatbot() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentReasoning, setCurrentReasoning] = useState<string[]>([]);
  const [currentAnswer, setCurrentAnswer] = useState<string>("");
  const [showReasoning, setShowReasoning] = useState<Record<string, boolean>>({});
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const question = input.trim();
    setInput("");
    setCurrentAnswer("");
    setCurrentReasoning([]);
    setIsLoading(true);

    try {
      const backend = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";
      const res = await fetch(`${backend}/chat/1/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: 1, message: question }),
      });

      if (!res.body) throw new Error("Resposta sem corpo");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        let idx;
        while ((idx = buffer.indexOf("\n\n")) !== -1) {
          const chunk = buffer.slice(0, idx);
          buffer = buffer.slice(idx + 2);
          handleChunk(chunk);
        }
      }

      if (buffer.trim()) handleChunk(buffer);
    } catch (err) {
      console.error("Erro:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChunk = (chunk: string) => {
    const trimmed = chunk.trim();
    if (!trimmed) return;

    const payload = trimmed.replace(/^data:\s*/, "");

    try {
      const data = JSON.parse(payload);

      switch (data.type) {
        case "answer_chunk":
          setCurrentAnswer(prev => prev + (data.chunk || ""));
          break;
        case "reasoning_step":
          setCurrentReasoning(prev => [...prev, data.message]);
          break;
        case "done":
          const msg: Message = {
            id: crypto.randomUUID(),
            text: currentAnswer,
            reasoning: currentReasoning
          };
          setMessages(prev => [...prev, msg]);
          setCurrentAnswer("");
          setCurrentReasoning([]);
          break;
      }
    } catch (e) {
      console.warn("Erro ao parsear:", e);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="fixed bottom-4 right-4 w-96 bg-white shadow-xl rounded-xl p-4 space-y-4">
      <div className="font-semibold text-lg">💬 Assistente</div>

      <div className="space-y-3 max-h-96 overflow-y-auto">
        {messages.map(msg => (
          <div key={msg.id} className="border rounded-lg p-3 bg-gray-50">
            <div className="whitespace-pre-wrap">{msg.text}</div>

            {msg.reasoning.length > 0 && (
              <div className="mt-2">
                <button
                  onClick={() =>
                    setShowReasoning(prev => ({
                      ...prev,
                      [msg.id]: !prev[msg.id]
                    }))
                  }
                  className="text-sm text-blue-600 underline"
                >
                  {showReasoning[msg.id] ? "Ocultar raciocínio" : "Ver raciocínio"}
                </button>

                {showReasoning[msg.id] && (
                  <div className="mt-1 text-xs text-yellow-700 space-y-1">
                    {msg.reasoning.map((r, idx) => (
                      <div key={idx}>🧠 {r}</div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}

        <div ref={bottomRef} />
      </div>

      <div className="flex gap-2">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1 border rounded p-2 text-sm"
          placeholder="Digite sua mensagem..."
          disabled={isLoading}
        />
        <button
          onClick={sendMessage}
          disabled={isLoading || !input.trim()}
          className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {isLoading ? "..." : "Enviar"}
        </button>
      </div>
    </div>
  );
}
