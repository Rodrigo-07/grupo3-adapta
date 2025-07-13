import { useState, useCallback } from 'react';

// Interface para resposta completa do chat
export interface ChatResponse {
  reasoning: string[];
  answer: string;
  insight?: any;
  summary?: string;
}

export class ChatClient {
  private baseUrl: string;

  constructor(baseUrl: string = 'http://localhost:8000') {
    this.baseUrl = baseUrl;
  }

  /**
   * Envia mensagem para o chat e aguarda resposta completa
   */
  async sendMessage(
    courseId: number,
    userId: number,
    message: string
  ): Promise<ChatResponse> {
    const url = `${this.baseUrl}/${courseId}/chat`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_id: userId,
        message: message
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data as ChatResponse;
  }
}

// Hook para gerenciar estado do chat
export function useChat(courseId: number) {
  const [reasoning, setReasoning] = useState<string[]>([]);
  const [answer, setAnswer] = useState<string>('');
  const [insight, setInsight] = useState<any>(null);
  const [summary, setSummary] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isReasoningExpanded, setIsReasoningExpanded] = useState(false);

  const client = new ChatClient();

  const sendMessage = useCallback(async (userId: number, message: string) => {
    console.log('🚀 Enviando mensagem:', { courseId, userId, message });
    
    setIsLoading(true);
    setAnswer('');
    setReasoning([]);
    setInsight(null);
    setSummary('');
    setIsReasoningExpanded(false);

    try {
      console.log('📡 Fazendo requisição para o backend...');
      const response = await client.sendMessage(courseId, userId, message);
      
      console.log('✅ Resposta recebida do backend:', response);
      
      // Verificar se os dados existem antes de setar
      if (response.reasoning && Array.isArray(response.reasoning)) {
        console.log('📝 Setando reasoning:', response.reasoning);
        setReasoning(response.reasoning);
      } else {
        console.warn('⚠️ Reasoning não encontrado ou inválido:', response.reasoning);
        setReasoning([]);
      }
      
      if (response.answer) {
        console.log('💬 Setando answer:', response.answer);
        setAnswer(response.answer);
      } else {
        console.warn('⚠️ Answer não encontrado:', response.answer);
        setAnswer('❌ Resposta não recebida do servidor.');
      }
      
      if (response.insight) {
        console.log('📊 Setando insight:', response.insight);
        setInsight(response.insight);
      }
      
      if (response.summary) {
        console.log('📋 Setando summary:', response.summary);
        setSummary(response.summary);
      }
      
    } catch (error) {
      console.error('❌ Erro ao enviar mensagem:', error);
      setAnswer('❌ Erro ao processar mensagem. Tente novamente.');
    } finally {
      setIsLoading(false);
      console.log('🏁 Processo finalizado');
    }
  }, [courseId, client]);

  const toggleReasoning = useCallback(() => {
    setIsReasoningExpanded(prev => !prev);
  }, []);

  const clearChat = useCallback(() => {
    setReasoning([]);
    setAnswer('');
    setInsight(null);
    setSummary('');
    setIsReasoningExpanded(false);
    setIsLoading(false);
  }, []);

  return {
    reasoning,
    answer,
    insight,
    summary,
    isLoading,
    isReasoningExpanded,
    sendMessage,
    toggleReasoning,
    clearChat
  };
}