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
      <div className="w-10 h-full bg-background border-r border-border-default flex flex-col items-center py-3">
        <button
          onClick={toggleSidebar}
          className="p-1.5 rounded-md hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
        >
          <PanelLeft size={16} />
        </button>
      </div>
    );
  }

  return (
    <div className={cn(
      'w-60 h-full bg-background border-r border-border-default',
      'flex flex-col shrink-0'
    )}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border-default">
        <div className="flex items-center gap-2">
          <Hexagon size={18} className="text-cyan-400" />
          <span className="text-sm font-semibold text-foreground">Arch</span>
        </div>
        <button
          onClick={toggleSidebar}
          className="p-1 rounded-md hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
        >
          <PanelLeft size={14} />
        </button>
      </div>

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

      {/* Footer */}
      <div className="px-4 py-3 border-t border-border-default">
        <p className="text-[11px] font-mono text-muted-foreground truncate">
          {metadata.name}
        </p>
      </div>
    </div>
  );
}
