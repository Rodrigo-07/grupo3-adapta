"use client";

import React, { useState, useEffect, useRef, KeyboardEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp, Brain, MessageSquare, ChevronLeft, ChevronRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Message {
  id: string;
  role: "user" | "bot" | "system";
  text: string;
  reasoning?: string[];
  insight?: any;
  summary?: string;
  showReasoning?: boolean;
}

/**
 * Chat widget with streamed reasoning and expandable thoughts.
 */
export default function Chatbot() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentReasoning, setCurrentReasoning] = useState<string[]>([]);
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [currentSummary, setCurrentSummary] = useState("");
  const [currentInsight, setCurrentInsight] = useState<any>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const scrollBottom = () =>
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });

  useEffect(scrollBottom, [messages]);

  const addMessage = (m: Message) => setMessages((p) => [...p, m]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;
    const text = input.trim();
    setInput("");
    addMessage({ id: Date.now().toString(), role: "user", text });

    try {
      setIsLoading(true);
      setCurrentReasoning([]);
      setCurrentAnswer("");
      setCurrentSummary("");
      setCurrentInsight(null);

      const res = await fetch("http://localhost:8000/chat/1/chat", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ user_id: 1, message: text }),
      });
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      const data = await res.json();
      
      addMessage({
        id: crypto.randomUUID(),
        role: "bot",
        text: data.answer || "Resposta não disponível",
        reasoning: data.reasoning || [],
        insight: data.insight,
        summary: data.summary,
        showReasoning: false
      });
      
    } catch (e) {
      console.error(e);
      addMessage({ 
        id: crypto.randomUUID(), 
        role: "system", 
        text: "⚠️ Erro ao obter resposta." 
      });
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

  const toggleReasoning = (messageId: string) => {
    setMessages(prev => 
      prev.map(msg => 
        msg.id === messageId 
          ? { ...msg, showReasoning: !msg.showReasoning }
          : msg
      )
    );
  };

  const renderMessage = (message: Message) => {
    switch (message.role) {
      case "user":
        return (
          <div key={message.id} className="flex justify-end mb-4">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 rounded-2xl rounded-br-md max-w-xs shadow-md">
              <p className="text-sm leading-relaxed">{message.text}</p>
            </div>
          </div>
        );
        
      case "bot":
        return (
          <div key={message.id} className="mb-6">
            <div className="bg-white border border-gray-100 rounded-2xl rounded-bl-md shadow-sm max-w-md overflow-hidden">
              <div className="p-5">
                <div className="text-gray-800 whitespace-pre-wrap break-words mb-4 leading-relaxed">
                  {message.text}
                </div>
                
                {message.summary && (
                  <div className="mb-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                    <div className="flex items-center gap-2 mb-2">
                      <MessageSquare className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-semibold text-blue-800">Resumo</span>
                    </div>
                    <p className="text-sm text-blue-700 leading-relaxed">{message.summary}</p>
                  </div>
                )}
                
                {message.insight && (
                  <div className="mb-4 flex flex-wrap gap-2">
                    <Badge variant="secondary" className="bg-gradient-to-r from-purple-100 to-purple-200 text-purple-800 border-purple-200 rounded-full px-3 py-1">
                      {message.insight.tema}
                    </Badge>
                    <Badge 
                      variant={message.insight.dificuldade === 'alto' ? 'destructive' : 
                              message.insight.dificuldade === 'medio' ? 'default' : 'secondary'}
                      className="rounded-full px-3 py-1"
                    >
                      {message.insight.dificuldade}
                    </Badge>
                  </div>
                )}
                
                {message.reasoning && message.reasoning.length > 0 && (
                  <div className="mt-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleReasoning(message.id)}
                      className="w-full justify-between text-xs text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-xl transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <Brain className="w-4 h-4" />
                        Ver raciocínio do agente ({message.reasoning.length} passos)
                      </div>
                      {message.showReasoning ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </Button>
                    
                    {message.showReasoning && (
                      <div className="mt-3 p-4 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-xl border border-amber-100">
                        <div className="text-xs text-amber-800 space-y-2">
                          {message.reasoning.map((step, idx) => (
                            <div key={idx} className="font-mono whitespace-pre-wrap bg-white/50 p-2 rounded-lg">
                              {step}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        );
        
      case "system":
        return (
          <div key={message.id} className="flex justify-center mb-3">
            <div className="bg-red-50 text-red-700 text-xs p-3 rounded-xl border border-red-100">
              {message.text}
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };

  return (
    <>
      {/* Overlay de fundo quando o chat estiver aberto */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Botão flutuante para abrir o chat quando fechado */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            className="fixed bottom-6 right-6 z-50"
          >
            <Button
              onClick={() => setIsOpen(true)}
              className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-2xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 hover:scale-110"
            >
              <MessageSquare className="w-6 h-6" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Painel do chat */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: "100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed right-0 top-0 h-full w-96 z-50"
          >
            <div className="h-full bg-white shadow-2xl flex flex-col border-l border-gray-200">
              {/* Header do chat */}
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                    💬
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Assistente IA</h3>
                    <p className="text-blue-100 text-xs">Sempre pronto para ajudar</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                  className="text-white hover:bg-white/20 rounded-full w-8 h-8 p-0"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              
              {/* Área de mensagens */}
              <div className="flex-1 overflow-y-auto p-4 bg-gray-50/30">
                {messages.length === 0 && (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                      <Brain className="w-8 h-8 text-blue-600" />
                    </div>
                    <h4 className="text-gray-700 font-medium mb-2">Como posso ajudar?</h4>
                    <p className="text-gray-500 text-sm">Faça uma pergunta sobre seus estudos</p>
                  </div>
                )}
                
                {messages.map(renderMessage)}
                
                {/* Indicadores de carregamento */}
                {isLoading && (
                  <div className="mb-4">
                    <div className="bg-white border border-gray-100 rounded-2xl rounded-bl-md shadow-sm max-w-md overflow-hidden">
                      <div className="p-5">
                        {currentAnswer ? (
                          <div className="text-gray-800 whitespace-pre-wrap break-words mb-4 leading-relaxed">
                            {currentAnswer}<span className="animate-pulse text-blue-500">|</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-3 text-gray-600 mb-4">
                            <div className="animate-spin w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                            <span className="text-sm">Pensando...</span>
                          </div>
                        )}
                        
                        {currentReasoning.length > 0 ? (
                          <div className="text-xs text-amber-700 bg-gradient-to-r from-amber-50 to-yellow-50 p-3 rounded-xl border border-amber-100">
                            <div className="flex items-center gap-2 mb-2">
                              <Brain className="w-4 h-4 animate-pulse" />
                              <span className="font-medium">Processando...</span>
                            </div>
                            <div className="font-mono bg-white/50 p-2 rounded-lg">
                              {currentReasoning[currentReasoning.length - 1]}
                            </div>
                          </div>
                        ) : (
                          <div className="text-xs text-gray-500 bg-gray-100 p-3 rounded-xl flex items-center gap-2">
                            <Brain className="w-4 h-4 animate-pulse" />
                            <span>Iniciando análise...</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
                
                <div ref={bottomRef} />
              </div>

              {/* Área de input */}
              <div className="p-4 bg-white border-t border-gray-100">
                <div className="flex gap-3">
                  <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={keyHandler}
                    placeholder="Digite sua mensagem…"
                    className="flex-1 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50/50"
                    disabled={isLoading}
                  />
                  <Button
                    onClick={sendMessage}
                    disabled={isLoading || !input.trim()}
                    className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl px-6 py-3 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                    ) : (
                      "Enviar"
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
