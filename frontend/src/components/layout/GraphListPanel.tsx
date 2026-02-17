import { useEffect } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { useStore } from '@/store';
import { cn } from '@/lib/utils';

export function GraphListPanel() {
  const graphList = useStore((s) => s.graphList);
  const fetchGraphList = useStore((s) => s.fetchGraphList);
  const loadGraphById = useStore((s) => s.loadGraphById);
  const deleteGraphById = useStore((s) => s.deleteGraphById);
  const newGraph = useStore((s) => s.newGraph);
  const currentId = useStore((s) => s.metadata.id);

  useEffect(() => {
    fetchGraphList();
  }, [fetchGraphList]);

  return (
    <div className="px-2 py-3 border-t border-border-default">
      <div className="flex items-center justify-between px-3 mb-2">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Saved Graphs
        </p>
        <button
          onClick={newGraph}
          title="New graph"
          className="p-0.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
        >
          <Plus size={12} />
        </button>
      </div>
      <div className="space-y-0.5 max-h-40 overflow-y-auto">
        {graphList.length === 0 && (
          <p className="px-3 text-[11px] text-muted-foreground/60 italic">
            No saved graphs
          </p>
        )}
        {graphList.map((g) => (
          <div
            key={g.id}
            className={cn(
              'group flex items-center justify-between px-3 py-1.5 rounded-md cursor-pointer transition-colors',
              'hover:bg-secondary',
              g.id === currentId && 'bg-secondary text-foreground'
            )}
            onClick={() => loadGraphById(g.id)}
          >
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-mono text-foreground truncate">
                {g.name}
              </p>
              <p className="text-[10px] text-muted-foreground">
                {g.nodeCount}N / {g.edgeCount}E
              </p>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                deleteGraphById(g.id);
              }}
              className="p-0.5 rounded-md text-muted-foreground/0 group-hover:text-muted-foreground hover:!text-red-400 hover:bg-secondary transition-colors shrink-0 ml-1"
            >
              <Trash2 size={11} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
