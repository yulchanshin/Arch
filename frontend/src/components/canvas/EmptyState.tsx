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
        <div className="rounded-2xl p-8 bg-white border border-gray-200 shadow-xl shadow-gray-100/50">
          <div className="flex flex-col items-center text-center mb-8">
            <div className="relative mb-4">
              <Hexagon size={36} className="text-gray-900" strokeWidth={1.5} />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400" />
              </div>
            </div>
            <h1 className="text-xl font-semibold text-gray-900 mb-2">
              What are you building?
            </h1>
            <p className="text-sm text-gray-500">
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
                  'bg-gray-50 border border-gray-200 rounded-xl',
                  'text-gray-900 placeholder:text-gray-400',
                  'focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300'
                )}
              />
              <button
                onClick={handleSubmit}
                disabled={!prompt.trim() || isLoading}
                className={cn(
                  'p-2.5 rounded-xl transition-colors',
                  prompt.trim() && !isLoading
                    ? 'bg-gray-900 text-white hover:bg-gray-800'
                    : 'bg-gray-100 text-gray-300 cursor-not-allowed'
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
                  'w-full text-left px-3 py-2.5 text-xs',
                  'text-gray-500',
                  'bg-gray-50 border border-gray-100 rounded-xl',
                  'hover:bg-gray-100 hover:text-gray-700 hover:border-gray-200',
                  'transition-colors'
                )}
              >
                {example}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
