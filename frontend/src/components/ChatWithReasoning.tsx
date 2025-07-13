import React from 'react';
import { useChatStreaming } from '@/lib/chat-streaming';

interface ChatWithReasoningProps {
  courseId: number;
  userId: number;
}

export function ChatWithReasoning({ courseId, userId }: ChatWithReasoningProps) {
  const { reasoning, answer, insight, isLoading, sendMessage } = useChatStreaming(courseId);
  const [message, setMessage] = React.useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    
    await sendMessage(userId, message);
    setMessage('');
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Chat com Reasoning em Tempo Real</h2>
      
      {/* Formulário de envio */}
      <form onSubmit={handleSubmit} className="mb-6">
        <div className="flex gap-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Digite sua pergunta..."
            className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !message.trim()}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {isLoading ? 'Processando...' : 'Enviar'}
          </button>
        </div>
      </form>

      {/* Seção de Reasoning */}
      {reasoning.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">🧠 Processo de Reasoning:</h3>
          <div className="bg-gray-50 p-4 rounded-lg">
            {reasoning.map((step, index) => (
              <div key={index} className="mb-2 text-sm text-gray-700">
                {step}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Resposta */}
      {answer && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">💬 Resposta:</h3>
          <div className="bg-white p-4 border rounded-lg">
            <p className="whitespace-pre-wrap">{answer}</p>
          </div>
        </div>
      )}

      {/* Insights */}
      {insight && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">📊 Análise da Pergunta:</h3>
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="font-medium">Tema:</span> {insight.tema}
              </div>
              <div>
                <span className="font-medium">Dificuldade:</span> 
                <span className={`ml-2 px-2 py-1 rounded text-sm ${
                  insight.dificuldade === 'baixo' ? 'bg-green-100 text-green-800' :
                  insight.dificuldade === 'medio' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {insight.dificuldade}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Loading indicator */}
      {isLoading && (
        <div className="flex items-center justify-center p-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <span className="ml-2">Processando sua pergunta...</span>
        </div>
      )}
    </div>
  );
}