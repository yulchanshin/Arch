import { type DragEvent } from 'react';
import {
  Server,
  Database,
  Zap,
  ArrowLeftRight,
  Globe,
  Network,
} from 'lucide-react';
import type { NodeType } from '@/types/graph';
import { cn } from '@/lib/utils';

const iconMap = {
  service: Server,
  database: Database,
  cache: Zap,
  queue: ArrowLeftRight,
  gateway: Globe,
  load_balancer: Network,
} as const;

const colorMap: Record<NodeType, string> = {
  service: 'text-cyan-400',
  database: 'text-amber-400',
  cache: 'text-emerald-400',
  queue: 'text-violet-400',
  gateway: 'text-blue-400',
  load_balancer: 'text-orange-400',
};

const labelMap: Record<NodeType, string> = {
  service: 'Service',
  database: 'Database',
  cache: 'Cache',
  queue: 'Queue',
  gateway: 'Gateway',
  load_balancer: 'Load Balancer',
};

type Props = {
  nodeType: NodeType;
};

export function DraggableNodeItem({ nodeType }: Props) {
  const Icon = iconMap[nodeType];
  const color = colorMap[nodeType];
  const label = labelMap[nodeType];

  const onDragStart = (event: DragEvent) => {
    event.dataTransfer.setData('application/reactflow-type', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div
      draggable
      onDragStart={onDragStart}
      className={cn(
        'flex items-center gap-2.5 px-3 py-2 rounded-md cursor-grab',
        'border border-transparent',
        'hover:bg-secondary hover:border-border-subtle',
        'active:cursor-grabbing',
        'transition-colors duration-150'
      )}
    >
      <Icon size={14} className={color} />
      <span className="text-xs text-foreground font-medium">{label}</span>
    </div>
  );
}
