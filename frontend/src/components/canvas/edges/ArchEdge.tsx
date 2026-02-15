import { memo } from 'react';
import {
  BaseEdge,
  EdgeLabelRenderer,
  getBezierPath,
  type EdgeProps,
} from '@xyflow/react';
import type { EdgeData } from '@/types/graph';

function ArchEdgeComponent({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  selected,
}: EdgeProps & { data?: EdgeData }) {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const isAnimated = data?.animated ?? false;
  const label = data?.label;
  const protocol = data?.protocol;
  const latency = data?.latency;

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        style={{
          stroke: selected ? '#22d3ee' : '#3f3f46',
          strokeWidth: selected ? 2 : 1.5,
          strokeDasharray: isAnimated ? '5 5' : undefined,
        }}
        className={isAnimated ? 'animated-edge' : ''}
      />
      {(label || protocol || latency) && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
              pointerEvents: 'all',
            }}
            className="px-1.5 py-0.5 bg-zinc-900/90 border border-zinc-800 rounded text-[10px] font-mono text-zinc-400 whitespace-nowrap"
          >
            {label && <span>{label}</span>}
            {protocol && (
              <span className="text-zinc-500 ml-1 uppercase">{protocol}</span>
            )}
            {latency && (
              <span className="text-zinc-600 ml-1">{latency}</span>
            )}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
}

export const ArchEdge = memo(ArchEdgeComponent);
