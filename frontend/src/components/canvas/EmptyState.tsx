import { useState } from 'react';
import { Hexagon, ArrowRight } from 'lucide-react';
import { useStore } from '@/store';
import { cn } from '@/lib/utils';

const EXAMPLE_PROMPTS = [
  'Design a URL shortener with API gateway, auth service, and Postgres',
  'Build a real-time chat system with WebSockets and Redis pub/sub',
  'Create a microservices e-commerce platform with payment processing',
  'Design a CI/CD pipeline with build queue and artifact storage',
];

export function EmptyState() {
  const [prompt, setPrompt] = useState('');
  const sendMessage = useStore((s) => s.sendMessage);
  const isLoading = useStore((s) => s.isLoading);
  const setChatOpen = useStore((s) => s.setChatOpen);

  const handleSubmit = () => {
    const trimmed = prompt.trim();
    if (!trimmed || isLoading) return;
    setChatOpen(true);
    sendMessage(trimmed);
    setPrompt('');
  };

  return (
    <div className="absolute inset-0 flex items-center justify-center z-5 pointer-events-none">
      <div className="pointer-events-auto max-w-lg w-full px-6">
        <div className="flex flex-col items-center text-center mb-8">
          <Hexagon size={36} className="text-zinc-800 mb-4" />
          <h1 className="text-xl font-semibold text-zinc-200 mb-2">
            What are you building?
          </h1>
          <p className="text-sm text-zinc-500">
            Describe your system architecture and Arch will generate it for you.
          </p>
        </div>

        <div className="mb-4">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              placeholder="Describe your architecture..."
              className={cn(
                'flex-1 px-4 py-2.5 text-sm',
                'bg-zinc-900 border border-zinc-800 rounded-md',
                'text-zinc-200 placeholder:text-zinc-600',
                'focus:outline-none focus:ring-1 focus:ring-cyan-500/50'
              )}
            />
            <button
              onClick={handleSubmit}
              disabled={!prompt.trim() || isLoading}
              className={cn(
                'p-2.5 rounded-md transition-colors',
                'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20',
                'hover:bg-cyan-500/20',
                'disabled:opacity-30 disabled:cursor-not-allowed'
              )}
            >
              <ArrowRight size={16} />
            </button>
          </div>
        </div>

        <div className="space-y-1.5">
          {EXAMPLE_PROMPTS.map((example) => (
            <button
              key={example}
              onClick={() => setPrompt(example)}
              className={cn(
                'w-full text-left px-3 py-2 text-xs text-zinc-500',
                'bg-zinc-900/50 border border-zinc-800/50 rounded-md',
                'hover:bg-zinc-900 hover:border-zinc-800 hover:text-zinc-400',
                'transition-colors'
              )}
            >
              {example}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
