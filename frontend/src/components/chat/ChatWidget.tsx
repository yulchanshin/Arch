import { useState } from 'react';
import { MessageCircle, X, Minus } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChatPanel } from '@/components/chat/ChatPanel';
import { cn } from '@/lib/utils';

export function ChatWidget() {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="absolute bottom-16 right-4 z-20" data-toolbar>
      <AnimatePresence mode="wait">
        {expanded ? (
          <motion.div
            key="chat-expanded"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className={cn(
              'w-[380px] h-[480px] flex flex-col',
              'bg-white rounded-2xl',
              'border border-gray-200',
              'shadow-xl shadow-gray-200/60',
              'overflow-hidden'
            )}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-500" />
                <span className="text-[13px] font-semibold text-gray-900">AI Chat</span>
              </div>
              <div className="flex items-center gap-0.5">
                <button
                  onClick={() => setExpanded(false)}
                  className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                  title="Minimize"
                >
                  <Minus size={14} />
                </button>
                <button
                  onClick={() => setExpanded(false)}
                  className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                  title="Close"
                >
                  <X size={14} />
                </button>
              </div>
            </div>

            {/* Chat content */}
            <div className="flex-1 overflow-hidden">
              <ChatPanel />
            </div>
          </motion.div>
        ) : (
          <motion.button
            key="chat-collapsed"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            onClick={() => setExpanded(true)}
            className={cn(
              'flex items-center gap-2 px-4 py-2.5',
              'bg-white rounded-full',
              'border border-gray-200',
              'shadow-lg shadow-gray-200/50',
              'hover:shadow-xl hover:border-gray-300',
              'transition-shadow cursor-pointer'
            )}
          >
            <div className="w-2 h-2 rounded-full bg-blue-500" />
            <span className="text-[13px] font-medium text-gray-700">AI Chat</span>
            <MessageCircle size={14} className="text-gray-400" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
