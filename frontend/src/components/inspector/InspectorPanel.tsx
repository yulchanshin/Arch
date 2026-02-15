import { X } from 'lucide-react';
import { useStore } from '@/store';
import { cn } from '@/lib/utils';

export function InspectorPanel() {
  const selectedNodeId = useStore((s) => s.selectedNodeId);
  const selectedEdgeId = useStore((s) => s.selectedEdgeId);
  const inspectorOpen = useStore((s) => s.inspectorOpen);
  const nodes = useStore((s) => s.nodes);
  const edges = useStore((s) => s.edges);
  const updateNodeData = useStore((s) => s.updateNodeData);
  const updateEdgeData = useStore((s) => s.updateEdgeData);
  const selectNode = useStore((s) => s.selectNode);
  const selectEdge = useStore((s) => s.selectEdge);
  const pushSnapshot = useStore((s) => s.pushSnapshot);
  const removeNode = useStore((s) => s.removeNode);
  const removeEdge = useStore((s) => s.removeEdge);

  if (!inspectorOpen) return null;

  const selectedNode = selectedNodeId
    ? nodes.find((n) => n.id === selectedNodeId)
    : null;
  const selectedEdge = selectedEdgeId
    ? edges.find((e) => e.id === selectedEdgeId)
    : null;

  if (!selectedNode && !selectedEdge) return null;

  return (
    <div
      className={cn(
        'absolute bottom-3 right-3 z-10 w-72',
        'bg-surface-overlay backdrop-blur-md',
        'border border-border-default rounded-md',
        'shadow-sm'
      )}
    >
      <div className="flex items-center justify-between px-3 py-2 border-b border-border-default">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          {selectedNode ? 'Node' : 'Edge'}
        </span>
        <button
          onClick={() => {
            selectNode(null);
            selectEdge(null);
          }}
          className="p-0.5 rounded hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
        >
          <X size={14} />
        </button>
      </div>

      <div className="px-3 py-2.5 space-y-3">
        {selectedNode && (
          <>
            <div>
              <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground block mb-1">
                Label
              </label>
              <input
                type="text"
                value={selectedNode.data.label}
                onChange={(e) => {
                  pushSnapshot();
                  updateNodeData(selectedNode.id, { label: e.target.value });
                }}
                className="w-full px-2 py-1.5 bg-secondary border border-border-default rounded-md text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-cyan-500/50"
              />
            </div>

            <div>
              <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground block mb-1">
                Type
              </label>
              <p className="text-xs font-mono text-muted-foreground">{selectedNode.data.nodeType}</p>
            </div>

            {selectedNode.data.tech && (
              <div>
                <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground block mb-1">
                  Technology
                </label>
                <p className="text-xs font-mono text-muted-foreground">{selectedNode.data.tech}</p>
              </div>
            )}

            {selectedNode.data.provider && (
              <div>
                <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground block mb-1">
                  Provider
                </label>
                <p className="text-xs font-mono text-muted-foreground">{selectedNode.data.provider}</p>
              </div>
            )}

            <div>
              <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground block mb-1">
                ID
              </label>
              <p className="text-[10px] font-mono text-muted-foreground break-all">{selectedNode.id}</p>
            </div>

            <button
              onClick={() => {
                pushSnapshot();
                removeNode(selectedNode.id);
                selectNode(null);
              }}
              className="w-full mt-1 px-2 py-1.5 text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-md hover:bg-red-500/20 transition-colors"
            >
              Delete Node
            </button>
          </>
        )}

        {selectedEdge && (
          <>
            <div>
              <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground block mb-1">
                Label
              </label>
              <input
                type="text"
                value={selectedEdge.data?.label ?? ''}
                onChange={(e) => {
                  pushSnapshot();
                  updateEdgeData(selectedEdge.id, { label: e.target.value });
                }}
                className="w-full px-2 py-1.5 bg-secondary border border-border-default rounded-md text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-cyan-500/50"
              />
            </div>

            <div>
              <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground block mb-1">
                Connection
              </label>
              <p className="text-[10px] font-mono text-muted-foreground">
                {selectedEdge.source} → {selectedEdge.target}
              </p>
            </div>

            <button
              onClick={() => {
                pushSnapshot();
                removeEdge(selectedEdge.id);
                selectEdge(null);
              }}
              className="w-full mt-1 px-2 py-1.5 text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-md hover:bg-red-500/20 transition-colors"
            >
              Delete Edge
            </button>
          </>
        )}
      </div>
    </div>
  );
}
