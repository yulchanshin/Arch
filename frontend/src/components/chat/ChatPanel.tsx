import { useRef, useEffect } from 'react';
import { Sparkles, RefreshCw, AlertCircle } from 'lucide-react';
import { useStore } from '@/store';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { StreamingMessage } from './StreamingMessage';

export function ChatPanel() {
  const messages = useStore((s) => s.messages);
  const isLoading = useStore((s) => s.isLoading);
  const isStreaming = useStore((s) => s.isStreaming);
  const error = useStore((s) => s.error);
  const retryLastMessage = useStore((s) => s.retryLastMessage);
  const clearError = useStore((s) => s.clearError);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, error, isStreaming]);

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
        {messages.length === 0 && !error && (
          <div className="flex flex-col items-center justify-center h-full text-center px-6">
            <div className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center mb-3">
              <Sparkles size={18} className="text-gray-400" />
            </div>
            <p className="text-sm font-medium text-gray-900 mb-1">
              Describe your architecture
            </p>
            <p className="text-xs text-gray-500 leading-relaxed">
              Try: "Design a URL shortener with API gateway, auth service, and Postgres"
            </p>
          </div>
        )}
        {messages.map((msg) => (
          <ChatMessage key={msg.id} message={msg} />
        ))}

        {/* Error state */}
        {error && !isLoading && (
          <div className="flex gap-2.5">
            <div className="shrink-0 w-6 h-6 rounded-full flex items-center justify-center mt-0.5 bg-red-50">
              <AlertCircle size={12} className="text-red-500" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="bg-red-50 border border-red-200 rounded-xl px-3 py-2">
                <p className="text-xs text-red-600 mb-2">{error}</p>
                <div className="flex gap-2">
                  <button
                    onClick={retryLastMessage}
                    className="flex items-center gap-1 px-2 py-1 text-[10px] text-red-600 bg-red-100 border border-red-200 rounded-lg hover:bg-red-200 transition-colors"
                  >
                    <RefreshCw size={10} />
                    Retry
                  </button>
                  <button
                    onClick={clearError}
                    className="px-2 py-1 text-[10px] text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Streaming message (replaces old loading indicator during streaming) */}
        {isStreaming && <StreamingMessage />}

        {/* Fallback loading indicator (only when not streaming, e.g. non-streaming fallback) */}
        {isLoading && !isStreaming && (
          <div className="flex gap-2.5">
            <div className="shrink-0 w-6 h-6 rounded-full flex items-center justify-center mt-0.5 bg-blue-50">
              <Sparkles size={12} className="text-blue-500" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5">
                <div className="flex items-center gap-1.5">
                  <div className="flex gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-400 thinking-dot" />
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-400 thinking-dot" />
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-400 thinking-dot" />
                  </div>
                  <span className="text-[11px] text-gray-500 ml-1">
                    Generating architecture...
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <ChatInput />
    </div>
  );
}
