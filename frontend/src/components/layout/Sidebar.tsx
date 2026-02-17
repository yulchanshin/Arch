import { useState } from 'react';
import { PanelLeft, Hexagon } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useStore } from '@/store';
import { DraggableNodeItem } from './DraggableNodeItem';
import { GraphListPanel } from './GraphListPanel';
import { NODE_TYPES } from '@/lib/constants';
import { cn } from '@/lib/utils';

export function Sidebar() {
  const sidebarCollapsed = useStore((s) => s.sidebarCollapsed);
  const toggleSidebar = useStore((s) => s.toggleSidebar);
  const metadata = useStore((s) => s.metadata);
  const renameGraph = useStore((s) => s.renameGraph);
  const [isEditing, setIsEditing] = useState(false);

  return (
    <div
      className={cn(
        'h-full bg-background border-r border-border-default',
        'flex flex-col shrink-0 overflow-hidden',
        'transition-[width] duration-200 ease-out',
        sidebarCollapsed ? 'w-10' : 'w-60'
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-3 border-b border-border-default min-h-[49px]">
        {!sidebarCollapsed && (
          <div className="flex items-center gap-2 overflow-hidden">
            <Hexagon size={18} className="text-cyan-400 shrink-0" />
            <span className="text-sm font-semibold text-foreground whitespace-nowrap">Arch</span>
          </div>
        )}
        <button
          onClick={toggleSidebar}
          className={cn(
            'p-1.5 rounded-md hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors shrink-0',
            sidebarCollapsed && 'mx-auto'
          )}
        >
          <PanelLeft size={14} className={cn('transition-transform duration-200', sidebarCollapsed && 'rotate-180')} />
        </button>
      </div>

      <AnimatePresence>
        {!sidebarCollapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="flex flex-col flex-1 overflow-hidden"
          >
            {/* Components */}
            <div className="flex-1 px-2 py-3 overflow-y-auto">
              <p className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Components
              </p>
              <div className="space-y-0.5">
                {NODE_TYPES.map((type) => (
                  <DraggableNodeItem key={type} nodeType={type} />
                ))}
              </div>
            </div>

            {/* Saved Graphs */}
            <GraphListPanel />

            {/* Footer — editable graph name */}
            <div className="px-4 py-3 border-t border-border-default">
              {isEditing ? (
                <input
                  autoFocus
                  className="w-full bg-transparent text-[11px] font-mono text-foreground outline-none border-b border-cyan-400/50 pb-0.5"
                  defaultValue={metadata.name}
                  onBlur={(e) => {
                    const val = e.currentTarget.value.trim();
                    if (val && val !== metadata.name) renameGraph(val);
                    setIsEditing(false);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.currentTarget.blur();
                    }
                    if (e.key === 'Escape') {
                      setIsEditing(false);
                    }
                  }}
                />
              ) : (
                <p
                  className="text-[11px] font-mono text-muted-foreground truncate cursor-pointer hover:text-foreground transition-colors"
                  onClick={() => setIsEditing(true)}
                  title="Click to rename"
                >
                  {metadata.name}
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
