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
  service: 'text-cyan-500',
  database: 'text-amber-500',
  cache: 'text-emerald-500',
  queue: 'text-violet-500',
  gateway: 'text-blue-500',
  load_balancer: 'text-orange-500',
};

const bgMap: Record<NodeType, string> = {
  service: 'bg-cyan-50',
  database: 'bg-amber-50',
  cache: 'bg-emerald-50',
  queue: 'bg-violet-50',
  gateway: 'bg-blue-50',
  load_balancer: 'bg-orange-50',
};

const labelMap: Record<NodeType, string> = {
  service: 'Service',
  database: 'Database',
  cache: 'Cache',
  queue: 'Queue',
  gateway: 'Gateway',
  load_balancer: 'LB',
};

type Props = {
  nodeType: NodeType;
};

export function DraggableNodeItem({ nodeType }: Props) {
  const Icon = iconMap[nodeType];
  const color = colorMap[nodeType];
  const bg = bgMap[nodeType];
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
        'flex flex-col items-center gap-1.5 p-2.5 rounded-xl cursor-grab',
        'border border-transparent',
        'hover:bg-gray-50 hover:border-gray-200',
        'active:cursor-grabbing',
        'transition-all duration-150'
      )}
    >
      <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center', bg)}>
        <Icon size={16} className={color} />
      </div>
      <span className="text-[10px] text-gray-500 font-medium leading-tight text-center">
        {label}
      </span>
    </div>
  );
}
