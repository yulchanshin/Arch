import { memo } from 'react';
import type { NodeProps } from '@xyflow/react';
import { ArrowLeftRight } from 'lucide-react';
import { BaseNode } from './BaseNode';
import type { NodeData } from '@/types/graph';

function QueueNodeComponent(props: NodeProps & { data: NodeData }) {
  return <BaseNode {...props} icon={<ArrowLeftRight size={16} />} accentColor="text-violet-400" />;
}

export const QueueNode = memo(QueueNodeComponent);
