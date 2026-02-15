import { useRef, useEffect } from 'react';
import { X, Sparkles, RefreshCw, AlertCircle } from 'lucide-react';
import { useStore } from '@/store';
import { cn } from '@/lib/utils';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';

export function ChatPanel() {
  const chatOpen = useStore((s) => s.chatOpen);
  const setChatOpen = useStore((s) => s.setChatOpen);
  const messages = useStore((s) => s.messages);
  const isLoading = useStore((s) => s.isLoading);
  const error = useStore((s) => s.error);
  const retryLastMessage = useStore((s) => s.retryLastMessage);
  const clearError = useStore((s) => s.clearError);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, error]);

  if (!chatOpen) return null;

  return (
    <div
      className={cn(
        'w-96 h-full shrink-0',
        'bg-surface-overlay backdrop-blur-md',
        'border-l border-border-default',
        'flex flex-col'
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border-default">
        <div className="flex items-center gap-2">
          <Sparkles size={14} className="text-cyan-400" />
          <span className="text-sm font-semibold text-foreground">AI Assistant</span>
        </div>
        <button
          onClick={() => setChatOpen(false)}
          className="p-1 rounded-md hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
        >
          <X size={14} />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
        {messages.length === 0 && !error && (
          <div className="flex flex-col items-center justify-center h-full text-center px-6">
            <Sparkles size={24} className="text-muted-foreground mb-3" />
            <p className="text-sm text-muted-foreground mb-1">Describe your architecture</p>
            <p className="text-xs text-muted-foreground/70">
              Try: "Design a URL shortener with API gateway, auth service, and Postgres"
            </p>
          </div>
        )}
        {messages.map((msg) => (
          <ChatMessage key={msg.id} message={msg} />
        ))}

        {/* Error state with retry */}
        {error && !isLoading && (
          <div className="flex gap-2.5">
            <div className="shrink-0 w-6 h-6 rounded-md flex items-center justify-center mt-0.5 bg-red-500/10">
              <AlertCircle size={12} className="text-red-400" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="bg-red-500/10 border border-red-500/20 rounded-md px-3 py-2">
                <p className="text-xs text-red-400 mb-2">{error}</p>
                <div className="flex gap-2">
                  <button
                    onClick={retryLastMessage}
                    className="flex items-center gap-1 px-2 py-1 text-[10px] text-red-400 bg-red-500/10 border border-red-500/20 rounded-md hover:bg-red-500/20 transition-colors"
                  >
                    <RefreshCw size={10} />
                    Retry
                  </button>
                  <button
                    onClick={clearError}
                    className="px-2 py-1 text-[10px] text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {isLoading && (
          <div className="flex items-center gap-2 px-3 py-2">
            <div className="flex gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse [animation-delay:150ms]" />
              <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse [animation-delay:300ms]" />
            </div>
            <span className="text-xs text-muted-foreground">Thinking...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <ChatInput />
    </div>
  );
}
