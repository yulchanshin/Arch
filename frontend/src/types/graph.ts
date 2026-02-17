import type { Node, Edge } from '@xyflow/react';
import type { TechId } from '@/lib/techCatalog';

export type NodeType = 'service' | 'database' | 'cache' | 'queue' | 'gateway' | 'load_balancer';
export type Provider = 'aws' | 'gcp' | 'azure' | 'supabase' | 'vercel' | 'cloudflare';
export type Tech = TechId;
export type Protocol = 'http' | 'grpc' | 'ws' | 'tcp' | 'amqp' | 'kafka';

export type NodeData = {
  label: string;
  nodeType: NodeType;
  provider?: Provider;
  tech?: Tech;
  replicas?: number;
  region?: string;
  description?: string;
  port?: number;
};

export type EdgeData = {
  label?: string;
  protocol?: Protocol;
  latency?: string;
  throughput?: string;
  animated?: boolean;
};

export type AppNode = Node<NodeData, NodeType>;
export type AppEdge = Edge<EdgeData>;

export type GraphMetadata = {
  id: string;
  name: string;
  version: number;
  createdAt: string;
  lastModified: string;
};

export type GraphState = {
  nodes: AppNode[];
  edges: AppEdge[];
  metadata: GraphMetadata;
};
