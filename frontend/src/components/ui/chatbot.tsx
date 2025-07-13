"use client";

import React, { useState, useEffect, useRef, KeyboardEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp, Brain, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";

/**
 * Chat widget with streamed reasoning and expandable thoughts.
 * - Shows user, assistant answer, summary and expandable LLM "thoughts" (reasoning)
 * - Uses structured events from backend streaming
 * - TailwindCSS with shadcn/ui components.
 */
export default function Chatbot() {
  /* ---------------------------------------------------------------- */
  interface Message {
    id: string;
    role: "user" | "bot" | "system";
    text: string;
    reasoning?: string[];
    insight?: any;
    summary?: string;
    showReasoning?: boolean;
  }

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentReasoning, setCurrentReasoning] = useState<string[]>([]);
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [currentSummary, setCurrentSummary] = useState("");
  const [currentInsight, setCurrentInsight] = useState<any>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  /* ----------------------------- utils ----------------------------- */
  const scrollBottom = () =>
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });

  useEffect(scrollBottom, [messages]);

  const addMessage = (m: Message) => setMessages((p) => [...p, m]);

  /* ---------------------------- streaming ---------------------------- */
  const handleStreamEvent = (event: any) => {
    switch (event.type) {
      case 'start':
        setCurrentReasoning([event.message || '']);
        break;
        
      case 'reasoning_step':
        setCurrentReasoning(prev => [...prev, event.message || '']);
        break;
        
      case 'answer_chunk':
        setCurrentAnswer(prev => prev + (event.chunk || ''));
        break;
        
      case 'insight':
        setCurrentInsight(event.data);
        setCurrentReasoning(prev => [...prev, event.message || '']);
        break;

      case 'summary':
        setCurrentSummary(event.summary || '');
        break;
        
      case 'done':
        // Finalizar e criar mensagem completa
        if (currentAnswer || currentSummary) {
          addMessage({
            id: crypto.randomUUID(),
            role: "bot",
            text: currentAnswer,
            reasoning: [...currentReasoning],
            insight: currentInsight,
            summary: currentSummary,
            showReasoning: false
          });
        }
        
        // Reset states
        setCurrentReasoning([]);
        setCurrentAnswer("");
        setCurrentSummary("");
        setCurrentInsight(null);
        setIsLoading(false);
        break;
        
      case 'error':
        console.error('Erro no streaming:', event.message);
        addMessage({
          id: crypto.randomUUID(),
          role: "system",
          text: `❌ ${event.message}`
        });
        setIsLoading(false);
        break;
    }
  };

  /* ----------------------------- send ------------------------------ */
  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;
    const text = input.trim();
    setInput("");
    addMessage({ id: Date.now().toString(), role: "user", text });

    try {
      setIsLoading(true);
      // Limpar estado anterior
      setCurrentReasoning([]);
      setCurrentAnswer("");
      setCurrentSummary("");
      setCurrentInsight(null);

      const res = await fetch("http://localhost:8000/chat/1/chat/stream", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Accept": "text/event-stream"
        },
        body: JSON.stringify({ user_id: 1, message: text }),
      });
      
      if (!res.body) throw new Error("empty body");
      
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        buffer += decoder.decode(value, { stream: true });
        
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const eventData = JSON.parse(line.slice(6));
              handleStreamEvent(eventData);
            } catch (e) {
              console.warn('Erro ao parsear evento:', line, e);
            }
          }
        }
      }
    } catch (e) {
      console.error(e);
      addMessage({ 
        id: crypto.randomUUID(), 
        role: "system", 
        text: "⚠️ Erro ao obter resposta." 
      });
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

  /* -------------------------- renderer ----------------------------- */
  const renderMessage = (message: Message) => {
    switch (message.role) {
      case "user":
        return (
          <div key={message.id} className="flex justify-end mb-4">
            <div className="bg-blue-500 text-white p-3 rounded-lg max-w-xs">
              {message.text}
            </div>
          </div>
        );
        
      case "bot":
        return (
          <div key={message.id} className="mb-6">
            <Card className="max-w-md">
              <CardContent className="p-4">
                <div className="text-gray-800 whitespace-pre-wrap break-words mb-3">
                  {message.text}
                </div>
                
                {message.summary && (
                  <div className="mb-3 p-3 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                    <div className="flex items-center gap-2 mb-1">
                      <MessageSquare className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-medium text-blue-800">Resumo</span>
                    </div>
                    <p className="text-sm text-blue-700">{message.summary}</p>
                  </div>
                )}
                
                {message.insight && (
                  <div className="mb-3">
                    <Badge variant="secondary" className="mr-2">
                      {message.insight.tema}
                    </Badge>
                    <Badge 
                      variant={message.insight.dificuldade === 'alto' ? 'destructive' : 
                              message.insight.dificuldade === 'medio' ? 'default' : 'secondary'}
                    >
                      {message.insight.dificuldade}
                    </Badge>
                  </div>
                )}
                
                {message.reasoning && message.reasoning.length > 0 && (
                  <Collapsible open={message.showReasoning}>
                    <CollapsibleTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleReasoning(message.id)}
                        className="w-full justify-between text-xs text-gray-600 hover:text-gray-800"
                      >
                        <div className="flex items-center gap-2">
                          <Brain className="w-3 h-3" />
                          Ver raciocínio do agente ({message.reasoning.length} passos)
                        </div>
                        {message.showReasoning ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <div className="mt-2 p-3 bg-yellow-50 rounded-lg border">
                        <div className="text-xs text-yellow-800 space-y-1">
                          {message.reasoning.map((step, idx) => (
                            <div key={idx} className="font-mono whitespace-pre-wrap">
                              {step}
                            </div>
                          ))}
                        </div>
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                )}
              </CardContent>
            </Card>
          </div>
        );
        
      case "system":
        return (
          <div key={message.id} className="flex justify-center mb-2">
            <div className="bg-red-50 text-red-700 text-xs p-2 rounded">
              {message.text}
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };

  return (
    <motion.div className="fixed bottom-4 right-4 z-50" initial={{ scale: 0 }} animate={{ scale: 1 }}>
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-blue-600 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg hover:bg-blue-700"
      >
        {isOpen ? "✕" : "💬"}
      </Button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 15 }}
            className="mt-3 w-96 h-[500px] bg-white rounded-xl shadow-2xl flex flex-col"
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Assistente IA</CardTitle>
            </CardHeader>
            
            <CardContent className="flex-1 overflow-y-auto px-4">
              {messages.map(renderMessage)}
              
              {/* Live streaming indicators */}
              {isLoading && (
                <div className="mb-4">
                  <Card className="max-w-md">
                    <CardContent className="p-4">
                      {currentAnswer && (
                        <div className="text-gray-800 whitespace-pre-wrap break-words mb-3">
                          {currentAnswer}<span className="animate-pulse">|</span>
                        </div>
                      )}
                      
                      {currentReasoning.length > 0 && (
                        <div className="text-xs text-yellow-700 bg-yellow-50 p-2 rounded">
                          <div className="flex items-center gap-1 mb-1">
                            <Brain className="w-3 h-3 animate-pulse" />
                            <span>Processando...</span>
                          </div>
                          <div className="font-mono">
                            {currentReasoning[currentReasoning.length - 1]}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              )}
              
              <div ref={bottomRef} />
            </CardContent>

            <div className="flex m-4 gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={keyHandler}
                placeholder="Digite sua mensagem…"
                className="flex-1 border rounded-lg p-2 text-sm focus:outline-none focus:ring focus:border-blue-400"
                disabled={isLoading}
              />
              <Button
                onClick={sendMessage}
                disabled={isLoading}
                size="sm"
              >
                {isLoading ? "…" : "Enviar"}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
