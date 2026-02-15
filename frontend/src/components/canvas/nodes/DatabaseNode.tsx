import { memo } from 'react';
import type { NodeProps } from '@xyflow/react';
import { Database } from 'lucide-react';
import { BaseNode } from './BaseNode';
import type { NodeData } from '@/types/graph';

function DatabaseNodeComponent(props: NodeProps & { data: NodeData }) {
  return <BaseNode {...props} icon={<Database size={16} />} accentColor="text-amber-400" />;
}

export const DatabaseNode = memo(DatabaseNodeComponent);
