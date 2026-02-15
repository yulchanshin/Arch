import { useState, useRef, useCallback, type KeyboardEvent } from 'react';
import { Send } from 'lucide-react';
import { useStore } from '@/store';
import { cn } from '@/lib/utils';

const QUICK_PROMPTS = [
  'Add a Redis cache',
  'Add a message queue',
  'Add load balancer',
  'Scale to 3 replicas',
];

export function ChatInput() {
  const [value, setValue] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const sendMessage = useStore((s) => s.sendMessage);
  const isLoading = useStore((s) => s.isLoading);
  const messages = useStore((s) => s.messages);

  const handleSend = useCallback(() => {
    const trimmed = value.trim();
    if (!trimmed || isLoading) return;
    sendMessage(trimmed);
    setValue('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  }, [value, isLoading, sendMessage]);

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInput = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
    }
  };

  return (
    <div className="border-t border-border-default px-4 py-3">
      {messages.length === 0 && (
        <div className="flex flex-wrap gap-1.5 mb-2.5">
          {QUICK_PROMPTS.map((prompt) => (
            <button
              key={prompt}
              onClick={() => {
                setValue(prompt);
                textareaRef.current?.focus();
              }}
              className="px-2 py-1 text-[10px] text-muted-foreground bg-secondary border border-border rounded-md hover:bg-accent hover:text-foreground transition-colors"
            >
              {prompt}
            </button>
          ))}
        </div>
      )}

      <div className="flex items-end gap-2">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onInput={handleInput}
          placeholder="Describe your system architecture..."
          rows={1}
          className={cn(
            'flex-1 resize-none px-3 py-2 text-sm',
            'bg-secondary border border-border rounded-md',
            'text-foreground placeholder:text-muted-foreground',
            'focus:outline-none focus:ring-1 focus:ring-cyan-500/50',
            'max-h-[120px]'
          )}
        />
        <button
          onClick={handleSend}
          disabled={!value.trim() || isLoading}
          className={cn(
            'p-2 rounded-md transition-colors',
            'bg-cyan-500/10 text-cyan-400',
            'hover:bg-cyan-500/20',
            'disabled:opacity-30 disabled:cursor-not-allowed'
          )}
        >
          <Send size={14} />
        </button>
      </div>
    </div>
  );
}
