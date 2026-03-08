import { Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { useStore } from '@/store';
import { ToolCallCard } from './ToolCallCard';

export function StreamingMessage() {
  const streamTokens = useStore((s) => s.streamTokens);
  const activeToolCalls = useStore((s) => s.activeToolCalls);
  const isStreaming = useStore((s) => s.isStreaming);

  if (!isStreaming) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="flex gap-2">
        <div className="w-6 h-6 rounded-full bg-blue-50 flex items-center justify-center shrink-0 mt-0.5">
          <Sparkles size={12} className="text-blue-500" />
        </div>
        <div className="max-w-[85%] flex-1 min-w-0">
          {/* Tool call cards */}
          {activeToolCalls.map((tc, i) => (
            <ToolCallCard key={`${tc.name}-${i}`} toolCall={tc} />
          ))}

          {/* Streaming text */}
          {streamTokens && (
            <div className="rounded-xl rounded-bl-sm bg-gray-50 border border-gray-100 px-3 py-2 mt-1">
              <div className="text-[13px] text-gray-700 leading-relaxed chat-md">
                <ReactMarkdown>{streamTokens}</ReactMarkdown>
                <span className="inline-block w-0.5 h-3.5 bg-blue-400 ml-0.5 animate-pulse align-middle" />
              </div>
            </div>
          )}

          {/* Show thinking indicator when no tokens yet */}
          {!streamTokens && activeToolCalls.length === 0 && (
            <div className="rounded-xl rounded-bl-sm bg-gray-50 border border-gray-100 px-3 py-2.5">
              <div className="flex items-center gap-1.5">
                <div className="flex gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-400 thinking-dot" />
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-400 thinking-dot" />
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-400 thinking-dot" />
                </div>
                <span className="text-[11px] text-gray-500 ml-1">
                  Thinking...
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
