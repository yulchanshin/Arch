import { Wrench, Check, ChevronDown, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState } from 'react';
import type { ToolCallState } from '@/types/actions';

type Props = {
  toolCall: ToolCallState;
};

const TOOL_LABELS: Record<string, string> = {
  analyze_architecture: 'Analyzing architecture',
  suggest_improvements: 'Suggesting improvements',
  compute_scoreboard: 'Computing scoreboard',
};

export function ToolCallCard({ toolCall }: Props) {
  const [expanded, setExpanded] = useState(false);
  const isRunning = toolCall.status === 'running';
  const label = TOOL_LABELS[toolCall.name] || toolCall.name;

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="border border-gray-200 rounded-lg overflow-hidden my-1.5"
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 border-b border-gray-100 w-full text-left hover:bg-gray-100 transition-colors"
      >
        <Wrench size={11} className="text-gray-400 shrink-0" />
        <span className="text-[11px] font-medium text-gray-600 flex-1">
          {label}
        </span>
        {isRunning ? (
          <div className="flex gap-0.5">
            <div className="w-1 h-1 rounded-full bg-blue-400 animate-pulse" />
            <div className="w-1 h-1 rounded-full bg-blue-400 animate-pulse" style={{ animationDelay: '150ms' }} />
            <div className="w-1 h-1 rounded-full bg-blue-400 animate-pulse" style={{ animationDelay: '300ms' }} />
          </div>
        ) : (
          <Check size={11} className="text-emerald-500" />
        )}
        {expanded ? (
          <ChevronDown size={10} className="text-gray-400" />
        ) : (
          <ChevronRight size={10} className="text-gray-400" />
        )}
      </button>
      {expanded && (
        <div className="px-3 py-2 text-[10px] font-mono text-gray-500 bg-white max-h-24 overflow-auto">
          <pre className="whitespace-pre-wrap break-all">
            {JSON.stringify(
              toolCall.output || toolCall.input,
              null,
              2
            )}
          </pre>
        </div>
      )}
    </motion.div>
  );
}
