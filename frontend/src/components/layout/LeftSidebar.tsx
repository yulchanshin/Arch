import { PanelLeft } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useStore } from '@/store';
import { DraggableNodeItem } from './DraggableNodeItem';
import { NODE_TYPES } from '@/lib/constants';
import { cn } from '@/lib/utils';

export function LeftSidebar() {
  const sidebarCollapsed = useStore((s) => s.sidebarCollapsed);
  const toggleSidebar = useStore((s) => s.toggleSidebar);

  return (
    <div
      className={cn(
        'h-full bg-white border-r border-gray-200',
        'flex flex-col shrink-0 overflow-hidden',
        'transition-[width] duration-200 ease-out',
        sidebarCollapsed ? 'w-12' : 'w-[200px]'
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-2 py-2 border-b border-gray-100 min-h-[41px]">
        {!sidebarCollapsed && (
          <span className="px-1 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
            Components
          </span>
        )}
        <button
          onClick={toggleSidebar}
          className={cn(
            'p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors shrink-0',
            sidebarCollapsed && 'mx-auto'
          )}
        >
          <PanelLeft
            size={14}
            className={cn(
              'transition-transform duration-200',
              sidebarCollapsed && 'rotate-180'
            )}
          />
        </button>
      </div>

      <AnimatePresence>
        {!sidebarCollapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="flex-1 overflow-y-auto p-2"
          >
            <div className="grid grid-cols-2 gap-1">
              {NODE_TYPES.map((type) => (
                <DraggableNodeItem key={type} nodeType={type} />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
