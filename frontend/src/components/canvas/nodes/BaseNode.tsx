import { memo, type ReactNode, cloneElement, isValidElement } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { cn } from '@/lib/utils';
import type { NodeData } from '@/types/graph';
import { useStore } from '@/store';
import { TechLogo, ProviderLogo } from '@/components/shared/TechLogo';

type BaseNodeProps = NodeProps & {
  data: NodeData;
  icon: ReactNode;
  accentColor: string;
};

function resizeIcon(icon: ReactNode, size: number): ReactNode {
  if (isValidElement(icon)) {
    return cloneElement(icon as React.ReactElement<{ size?: number }>, { size });
  }
  return icon;
}

function BaseNodeComponent({ id, data, icon, accentColor, selected }: BaseNodeProps) {
  const selectedNodeId = useStore((s) => s.selectedNodeId);
  const isSelected = selected || selectedNodeId === id;

  const hasLogo = data.provider || data.tech;

  return (
    <div
      className={cn(
        'w-[180px] rounded-md border transition-all duration-150',
        'bg-node-bg border-node-border',
        'hover:border-node-hover-border',
        isSelected && 'ring-2 ring-cyan-500/50 border-cyan-500/30'
      )}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="!w-2.5 !h-2.5 !bg-handle !border-handle-border !-left-[5px] !border-2"
      />

      <div className="px-2.5 py-2.5">
        {hasLogo ? (
          /* Layout with prominent logo */
          <div className="flex items-center gap-2.5">
            {/* Logo column — ~40% of node */}
            <div className="shrink-0 w-[60px] h-[52px] flex items-center justify-center rounded-sm bg-zinc-800/50 border border-zinc-700/40">
              {data.provider ? (
                <ProviderLogo provider={data.provider} size={32} />
              ) : data.tech ? (
                <TechLogo tech={data.tech} size={32} />
              ) : null}
            </div>

            {/* Info column */}
            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-medium text-foreground truncate leading-tight">{data.label}</p>
              <div className="flex items-center gap-1 mt-1">
                <div className={cn('shrink-0', accentColor)}>
                  {resizeIcon(icon, 11)}
                </div>
                <span className="text-[10px] text-muted-foreground truncate">
                  {data.nodeType.replace('_', ' ')}
                </span>
              </div>
              {/* Show tech badge if provider is the main logo */}
              {data.provider && data.tech && (
                <div className="mt-1">
                  <span className="inline-flex items-center gap-1 px-1 py-0.5 bg-zinc-800/60 border border-zinc-700/40 rounded-sm">
                    <TechLogo tech={data.tech} size={10} />
                    <span className="text-[9px] font-mono text-muted-foreground">
                      {data.tech}
                    </span>
                  </span>
                </div>
              )}
              {data.replicas && data.replicas > 1 && (
                <span className="text-[9px] font-mono text-muted-foreground mt-0.5 block">
                  {data.replicas}x replicas
                </span>
              )}
            </div>
          </div>
        ) : (
          /* Simple layout without logo */
          <div>
            <div className="flex items-center gap-2">
              <div className={cn('shrink-0', accentColor)}>{icon}</div>
              <p className="text-[13px] font-medium text-foreground truncate">{data.label}</p>
            </div>
            {data.replicas && data.replicas > 1 && (
              <span className="text-[10px] font-mono text-muted-foreground mt-1.5 block pl-6">
                {data.replicas}x replicas
              </span>
            )}
          </div>
        )}
      </div>

      <Handle
        type="source"
        position={Position.Right}
        className="!w-2.5 !h-2.5 !bg-handle !border-handle-border !-right-[5px] !border-2"
      />
    </div>
  );
}

export const BaseNode = memo(BaseNodeComponent);
