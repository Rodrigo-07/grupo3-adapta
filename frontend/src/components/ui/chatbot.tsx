"use client";

import React, { useState, useEffect, useRef, KeyboardEvent } from "react";
import { motion } from "framer-motion";

/**
 * Chat widget with streamed reasoning.
 * - Shows user, assistant answer and LLM "thoughts" (reasoning)
 * - Parses server-sent tokens: lines starting with "Thought:", "Action:", "Final Answer:" or raw JSON.
 * - TailwindCSS only.
 */
export default function Chatbot() {
  /* ---------------------------------------------------------------- */
  interface Message {
    id: string;
    role: "user" | "bot" | "reasoning" | "system";
    text: string;
  }

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  /* ----------------------------- utils ----------------------------- */
  const scrollBottom = () =>
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });

  useEffect(scrollBottom, [messages]);

  const push = (m: Message) => setMessages((p) => [...p, m]);

  /* ---------------------------- parsing ---------------------------- */
  const handleChunk = (raw: string) => {
    // Try JSON first (final payload)
    raw = raw.trim();
    if (raw.startsWith("{")) {
      try {
        const obj = JSON.parse(raw);
        if (obj.answer) {
          push({ id: crypto.randomUUID(), role: "bot", text: obj.answer });
        }
        if (obj.insight) {
          push({
            id: crypto.randomUUID(),
            role: "system",
            text: `📊 Insight → tema: ${obj.insight.tema}, dificuldade: ${obj.insight.dificuldade}`,
          });
        }
        return;
      } catch (_) {
        /* fallthrough */
      }
    }

    // Otherwise treat as annotation lines
    const lines = raw.split(/\n+/);
    lines.forEach((line) => {
      if (/^Thought:/i.test(line) || /^Action:/i.test(line)) {
        push({ id: crypto.randomUUID(), role: "reasoning", text: line });
      } else if (/^Final Answer:/i.test(line)) {
        const answer = line.replace(/^Final Answer:\s*/i, "");
        push({ id: crypto.randomUUID(), role: "bot", text: answer });
      }
    });
  };

  /* ----------------------------- send ------------------------------ */
  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;
    const text = input.trim();
    setInput("");
    push({ id: Date.now().toString(), role: "user", text });

    try {
      setIsLoading(true);
      const res = await fetch("http://localhost:8000/chat/1/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: 1, message: text }),
      });
      if (!res.body) throw new Error("empty body");
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let done = false;
      while (!done) {
        const { value, done: rd } = await reader.read();
        done = rd;
        if (value) handleChunk(decoder.decode(value));
      }
    } catch (e) {
      console.error(e);
      push({ id: crypto.randomUUID(), role: "system", text: "⚠️ Erro ao obter resposta." });
    } finally {
      setIsLoading(false);
    }
  };

  const keyHandler = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  /* -------------------------- renderer ----------------------------- */
  const bubbleStyle = (role: Message["role"]) => {
    switch (role) {
      case "user":
        return "bg-blue-100 text-blue-800 self-end";
      case "bot":
        return "bg-gray-100 text-gray-800";
      case "reasoning":
        return "bg-yellow-50 text-yellow-700 text-xs italic";
      default:
        return "bg-red-50 text-red-700 text-xs";
    }
  };

  return (
    <motion.div className="fixed bottom-4 right-4 z-50" initial={{ scale: 0 }} animate={{ scale: 1 }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-blue-600 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg hover:bg-blue-700"
      >
        {isOpen ? "✕" : "💬"}
      </button>

      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 15 }}
          className="mt-3 w-80 h-96 bg-white rounded-xl shadow-2xl flex flex-col p-3"
        >
          <div className="flex-1 overflow-y-auto pr-1">
            {messages.map(({ id, role, text }) => (
              <div key={id} className={`whitespace-pre-wrap break-words p-2 my-1 rounded-lg text-sm ${bubbleStyle(role)}`}>
                {text}
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          <div className="flex mt-2 gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={keyHandler}
              placeholder="Digite sua mensagem…"
              className="flex-1 border rounded-lg p-2 text-sm focus:outline-none focus:ring focus:border-blue-400"
            />
            <button
              onClick={sendMessage}
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg"
            >
              {isLoading ? "…" : "Enviar"}
            </button>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
