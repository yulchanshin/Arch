import { memo, type ReactNode, cloneElement, isValidElement, useState } from 'react';
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
  const [hovered, setHovered] = useState(false);

  const hasLogo = data.provider || data.tech;

  // Extract hex-ish color from the accent for the bar
  const accentBarColor = accentColor.includes('cyan')
    ? '#06b6d4'
    : accentColor.includes('emerald')
      ? '#10b981'
      : accentColor.includes('violet')
        ? '#8b5cf6'
        : accentColor.includes('amber')
          ? '#f59e0b'
          : accentColor.includes('blue')
            ? '#3b82f6'
            : accentColor.includes('red')
              ? '#ef4444'
              : '#6b7280';

  return (
    <div
      className={cn(
        'w-[180px] rounded-lg border transition-all duration-150 overflow-hidden',
        'bg-node-bg border-node-border',
        'hover:border-node-hover-border hover:shadow-md',
        isSelected && 'ring-2 ring-cyan-500/50 border-cyan-500/30 shadow-md'
      )}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Accent bar */}
      <div className="h-[3px]" style={{ background: accentBarColor }} />

      <Handle
        type="target"
        position={Position.Left}
        className={cn(
          '!w-2.5 !h-2.5 !bg-handle !border-handle-border !-left-[5px] !border-2',
          'transition-opacity duration-150',
          !hovered && !isSelected && '!opacity-0'
        )}
      />

      <div className="px-2.5 py-2.5">
        {hasLogo ? (
          <div className="flex items-center gap-2.5">
            <div className="shrink-0 w-10 h-10 flex items-center justify-center rounded-md bg-secondary/80 border border-border-default">
              {data.provider ? (
                <ProviderLogo provider={data.provider} size={24} />
              ) : data.tech ? (
                <TechLogo tech={data.tech} size={24} />
              ) : null}
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-[12px] font-medium text-foreground truncate leading-tight">
                {data.label}
              </p>
              <div className="flex items-center gap-1 mt-0.5">
                <div className={cn('shrink-0', accentColor)}>
                  {resizeIcon(icon, 10)}
                </div>
                <span className="text-[10px] text-muted-foreground truncate">
                  {data.nodeType.replace('_', ' ')}
                </span>
              </div>
              {data.provider && data.tech && (
                <div className="mt-1">
                  <span className="inline-flex items-center gap-1 px-1 py-0.5 bg-secondary/60 border border-border-default rounded-sm">
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
          <div>
            <div className="flex items-center gap-2">
              <div className={cn('shrink-0', accentColor)}>{icon}</div>
              <p className="text-[12px] font-medium text-foreground truncate">
                {data.label}
              </p>
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
        className={cn(
          '!w-2.5 !h-2.5 !bg-handle !border-handle-border !-right-[5px] !border-2',
          'transition-opacity duration-150',
          !hovered && !isSelected && '!opacity-0'
        )}
      />
    </div>
  );
}

export const BaseNode = memo(BaseNodeComponent);
