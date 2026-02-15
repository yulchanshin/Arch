import { memo } from 'react';
import type { NodeProps } from '@xyflow/react';
import { Globe } from 'lucide-react';
import { BaseNode } from './BaseNode';
import type { NodeData } from '@/types/graph';

function GatewayNodeComponent(props: NodeProps & { data: NodeData }) {
  return <BaseNode {...props} icon={<Globe size={16} />} accentColor="text-blue-400" />;
}

export const GatewayNode = memo(GatewayNodeComponent);
