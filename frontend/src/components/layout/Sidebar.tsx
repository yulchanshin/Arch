import { PanelLeft, Hexagon } from 'lucide-react';
import { useStore } from '@/store';
import { DraggableNodeItem } from './DraggableNodeItem';
import { NODE_TYPES } from '@/lib/constants';
import { cn } from '@/lib/utils';

export function Sidebar() {
  const sidebarCollapsed = useStore((s) => s.sidebarCollapsed);
  const toggleSidebar = useStore((s) => s.toggleSidebar);
  const metadata = useStore((s) => s.metadata);

  if (sidebarCollapsed) {
    return (
      <div className="w-10 h-full bg-zinc-950 border-r border-zinc-800 flex flex-col items-center py-3">
        <button
          onClick={toggleSidebar}
          className="p-1.5 rounded-md hover:bg-zinc-800/50 text-zinc-400 hover:text-zinc-200 transition-colors"
        >
          <PanelLeft size={16} />
        </button>
      </div>
    );
  }

  return (
    <div className={cn(
      'w-60 h-full bg-zinc-950 border-r border-zinc-800',
      'flex flex-col shrink-0'
    )}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800">
        <div className="flex items-center gap-2">
          <Hexagon size={18} className="text-cyan-400" />
          <span className="text-sm font-semibold text-zinc-100">Arch</span>
        </div>
        <button
          onClick={toggleSidebar}
          className="p-1 rounded-md hover:bg-zinc-800/50 text-zinc-500 hover:text-zinc-300 transition-colors"
        >
          <PanelLeft size={14} />
        </button>
      </div>

      {/* Components */}
      <div className="flex-1 px-2 py-3 overflow-y-auto">
        <p className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-wider text-zinc-600">
          Components
        </p>
        <div className="space-y-0.5">
          {NODE_TYPES.map((type) => (
            <DraggableNodeItem key={type} nodeType={type} />
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-zinc-800">
        <p className="text-[11px] font-mono text-zinc-600 truncate">
          {metadata.name}
        </p>
      </div>
    </div>
  );
}
