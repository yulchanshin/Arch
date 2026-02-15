import { memo, type ReactNode } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { cn } from '@/lib/utils';
import type { NodeData } from '@/types/graph';
import { useStore } from '@/store';

type BaseNodeProps = NodeProps & {
  data: NodeData;
  icon: ReactNode;
  accentColor: string;
};

function BaseNodeComponent({ id, data, icon, accentColor, selected }: BaseNodeProps) {
  const selectedNodeId = useStore((s) => s.selectedNodeId);
  const isSelected = selected || selectedNodeId === id;

  return (
    <div
      className={cn(
        'w-[220px] bg-zinc-900 border border-zinc-800 rounded-md',
        'transition-all duration-150',
        'hover:border-zinc-700',
        isSelected && 'ring-2 ring-cyan-500/50 border-cyan-500/30'
      )}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="!w-2 !h-2 !bg-zinc-600 !border-zinc-500 !-left-1"
      />

      <div className="px-3 py-2.5">
        <div className="flex items-center gap-2">
          <div className={cn('shrink-0', accentColor)}>{icon}</div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-zinc-100 truncate">{data.label}</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              {data.tech && (
                <span className="text-[10px] font-mono text-zinc-500 uppercase">
                  {data.tech}
                </span>
              )}
              {data.provider && (
                <span className="text-[10px] font-mono text-zinc-600">
                  {data.provider}
                </span>
              )}
            </div>
          </div>
        </div>

        {data.replicas && data.replicas > 1 && (
          <div className="mt-1.5 flex items-center gap-1">
            <span className="text-[10px] font-mono text-zinc-500">
              {data.replicas}x replicas
            </span>
          </div>
        )}
      </div>

      <Handle
        type="source"
        position={Position.Right}
        className="!w-2 !h-2 !bg-zinc-600 !border-zinc-500 !-right-1"
      />
    </div>
  );
}

export const BaseNode = memo(BaseNodeComponent);
