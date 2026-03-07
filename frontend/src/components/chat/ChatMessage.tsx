import { useState } from 'react';
import { ChevronDown, ChevronRight, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import type { ChatMessage as ChatMessageType } from '@/types/actions';

type Props = {
  message: ChatMessageType;
};

export function ChatMessage({ message }: Props) {
  const [showThought, setShowThought] = useState(false);
  const isUser = message.role === 'user';

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
    >
      {isUser ? (
        <div className="flex justify-end">
          <div className="max-w-[85%] rounded-xl rounded-br-sm bg-gray-900 text-white px-3 py-2">
            <p className="text-[13px] leading-relaxed">{message.content}</p>
          </div>
        </div>
      ) : (
        <div className="flex gap-2">
          <div className="w-6 h-6 rounded-full bg-blue-50 flex items-center justify-center shrink-0 mt-0.5">
            <Sparkles size={12} className="text-blue-500" />
          </div>
          <div className="max-w-[85%]">
            <div className="rounded-xl rounded-bl-sm bg-gray-50 border border-gray-100 px-3 py-2">
              <p className="text-[13px] text-gray-700 leading-relaxed">
                {message.content}
              </p>
            </div>
            {message.thought_process && (
              <div className="mt-1">
                <button
                  onClick={() => setShowThought(!showThought)}
                  className="flex items-center gap-1 text-[10px] text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showThought ? (
                    <ChevronDown size={10} />
                  ) : (
                    <ChevronRight size={10} />
                  )}
                  <span>Show reasoning</span>
                </button>
                {showThought && (
                  <p className="text-[11px] text-gray-500 mt-1 pl-2 border-l-2 border-gray-200 leading-relaxed whitespace-pre-wrap">
                    {message.thought_process}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </motion.div>
  );
}
