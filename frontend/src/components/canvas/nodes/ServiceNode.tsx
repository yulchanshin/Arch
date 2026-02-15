import { memo } from 'react';
import type { NodeProps } from '@xyflow/react';
import { Server } from 'lucide-react';
import { BaseNode } from './BaseNode';
import type { NodeData } from '@/types/graph';

function ServiceNodeComponent(props: NodeProps & { data: NodeData }) {
  return <BaseNode {...props} icon={<Server size={16} />} accentColor="text-cyan-400" />;
}

export const ServiceNode = memo(ServiceNodeComponent);
