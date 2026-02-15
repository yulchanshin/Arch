import type { NodeType } from '@/types/graph';

export const NODE_TYPE_CONFIG: Record<NodeType, { label: string; icon: string; color: string }> = {
  service: { label: 'Service', icon: 'Server', color: 'text-cyan-400' },
  database: { label: 'Database', icon: 'Database', color: 'text-amber-400' },
  cache: { label: 'Cache', icon: 'Zap', color: 'text-emerald-400' },
  queue: { label: 'Queue', icon: 'ArrowLeftRight', color: 'text-violet-400' },
  gateway: { label: 'Gateway', icon: 'Globe', color: 'text-blue-400' },
  load_balancer: { label: 'Load Balancer', icon: 'Network', color: 'text-orange-400' },
};

export const NODE_TYPES = Object.keys(NODE_TYPE_CONFIG) as NodeType[];

export const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000';

export const GRID_UNIT_X = 250;
export const GRID_UNIT_Y = 200;
export const MAX_HISTORY = 50;
