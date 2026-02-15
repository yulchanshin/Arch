import { memo } from 'react';
import type { NodeProps } from '@xyflow/react';
import { Zap } from 'lucide-react';
import { BaseNode } from './BaseNode';
import type { NodeData } from '@/types/graph';

function CacheNodeComponent(props: NodeProps & { data: NodeData }) {
  return <BaseNode {...props} icon={<Zap size={16} />} accentColor="text-emerald-400" />;
}

export const CacheNode = memo(CacheNodeComponent);
