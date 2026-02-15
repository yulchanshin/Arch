import { memo } from 'react';
import type { NodeProps } from '@xyflow/react';
import { Network } from 'lucide-react';
import { BaseNode } from './BaseNode';
import type { NodeData } from '@/types/graph';

function LoadBalancerNodeComponent(props: NodeProps & { data: NodeData }) {
  return <BaseNode {...props} icon={<Network size={16} />} accentColor="text-orange-400" />;
}

export const LoadBalancerNode = memo(LoadBalancerNodeComponent);
