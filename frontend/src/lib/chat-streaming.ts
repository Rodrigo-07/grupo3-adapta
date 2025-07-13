import { useState } from 'react';

// Exemplo de como consumir o chat com streaming do reasoning
export interface ChatStreamEvent {
  type: 'start' | 'reasoning_step' | 'answer_chunk' | 'insight' | 'done' | 'error';
  step?: string;
  message?: string;
  chunk?: string;
  is_final?: boolean;
  data?: any;
}

export class ChatStreamingClient {
  private baseUrl: string;

  constructor(baseUrl: string = 'http://localhost:8000') {
    this.baseUrl = baseUrl;
  }

  /**
   * Conecta ao endpoint de streaming do chat e processa eventos em tempo real
   */
  async streamChat(
    courseId: number,
    userId: number,
    message: string,
    onEvent: (event: ChatStreamEvent) => void
  ): Promise<void> {
    const url = `${this.baseUrl}/${courseId}/chat/stream`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'text/event-stream',
      },
      body: JSON.stringify({
        user_id: userId,
        message: message
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();

    if (!reader) {
      throw new Error('Response body is not readable');
    }

    try {
      let buffer = '';
      
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;
        
        buffer += decoder.decode(value, { stream: true });
        
        // Processar eventos completos no buffer
        const lines = buffer.split('\n');
        buffer = lines.pop() || ''; // Manter linha incompleta no buffer
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const eventData = JSON.parse(line.slice(6));
              onEvent(eventData);
            } catch (e) {
              console.warn('Erro ao parsear evento:', line, e);
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  }
}

// Exemplo de uso em um componente React
export function useChatStreaming(courseId: number) {
  const [reasoning, setReasoning] = useState<string[]>([]);
  const [answer, setAnswer] = useState<string>('');
  const [insight, setInsight] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const client = new ChatStreamingClient();

  const sendMessage = async (userId: number, message: string) => {
    setIsLoading(true);
    setReasoning([]);
    setAnswer('');
    setInsight(null);

    try {
      await client.streamChat(courseId, userId, message, (event) => {
        switch (event.type) {
          case 'start':
            setReasoning(prev => [...prev, event.message || '']);
            break;
            
          case 'reasoning_step':
            setReasoning(prev => [...prev, event.message || '']);
            break;
            
          case 'answer_chunk':
            setAnswer(prev => prev + (event.chunk || ''));
            break;
            
          case 'insight':
            setInsight(event.data);
            setReasoning(prev => [...prev, event.message || '']);
            break;
            
          case 'done':
            setIsLoading(false);
            break;
            
          case 'error':
            console.error('Erro no streaming:', event.message);
            setReasoning(prev => [...prev, `❌ ${event.message}`]);
            setIsLoading(false);
            break;
        }
      });
    } catch (error) {
      console.error('Erro ao conectar ao streaming:', error);
      setIsLoading(false);
    }
  };

  return {
    reasoning,
    answer,
    insight,
    isLoading,
    sendMessage
  };
}