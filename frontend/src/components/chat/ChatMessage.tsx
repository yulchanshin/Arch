import { useState } from 'react';
import { ChevronDown, ChevronRight, User, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ChatMessage as ChatMessageType } from '@/types/actions';

type Props = {
  message: ChatMessageType;
};

export function ChatMessage({ message }: Props) {
  const [showThought, setShowThought] = useState(false);
  const isUser = message.role === 'user';

  return (
    <div className={cn('flex gap-2.5', isUser && 'flex-row-reverse')}>
      <div
        className={cn(
          'shrink-0 w-6 h-6 rounded-md flex items-center justify-center mt-0.5',
          isUser ? 'bg-zinc-800' : 'bg-cyan-500/10'
        )}
      >
        {isUser ? (
          <User size={12} className="text-zinc-400" />
        ) : (
          <Sparkles size={12} className="text-cyan-400" />
        )}
      </div>

      <div className={cn('flex-1 min-w-0', isUser && 'text-right')}>
        <p className={cn(
          'text-sm text-zinc-200 leading-relaxed',
          isUser && 'bg-zinc-900 rounded-md px-3 py-2 inline-block text-left'
        )}>
          {message.content}
        </p>

        {message.thought_process && (
          <div className="mt-1.5">
            <button
              onClick={() => setShowThought(!showThought)}
              className="flex items-center gap-1 text-[10px] text-zinc-600 hover:text-zinc-400 transition-colors"
            >
              {showThought ? <ChevronDown size={10} /> : <ChevronRight size={10} />}
              <span>Thought process</span>
            </button>
            {showThought && (
              <div className="mt-1 px-2.5 py-2 bg-zinc-900/50 border border-zinc-800/50 rounded-md">
                <p className="text-[11px] font-mono text-zinc-500 leading-relaxed whitespace-pre-wrap">
                  {message.thought_process}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
