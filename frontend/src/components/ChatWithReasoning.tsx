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
  const [showReasoning, setShowReasoning] = useState<Record<string, boolean>>({});
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const question = input.trim();
    setInput("");
    setIsLoading(true);

    try {
      const backend = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";
      const res = await fetch(`${backend}/chat/1/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: 1, message: question }),
      });

      if (!res.ok) {
        throw new Error(`Erro HTTP: ${res.status}`);
      }

      const data = await res.json();
      
      const msg: Message = {
        id: crypto.randomUUID(),
        text: data.answer || "Resposta não disponível",
        reasoning: data.reasoning || []
      };
      
      setMessages(prev => [...prev, msg]);

    } catch (err) {
      console.error("Erro:", err);
      const errorMsg: Message = {
        id: crypto.randomUUID(),
        text: "Erro ao processar sua pergunta. Tente novamente.",
        reasoning: []
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
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
