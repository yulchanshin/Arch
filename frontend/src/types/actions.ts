import type { NodeData, EdgeData } from './graph';

export type AddNodeAction = {
  op: 'add_node';
  id: string;
  type: string;
  position: { x: number; y: number };
  data: NodeData;
};

export type RemoveNodeAction = {
  op: 'remove_node';
  id: string;
};

export type UpdateNodeAction = {
  op: 'update_node';
  id: string;
  data: Partial<NodeData>;
};

export type MoveNodeAction = {
  op: 'move_node';
  id: string;
  position: { x: number; y: number };
};

export type AddEdgeAction = {
  op: 'add_edge';
  id: string;
  source: string;
  target: string;
  data?: EdgeData;
};

export type RemoveEdgeAction = {
  op: 'remove_edge';
  id: string;
};

export type UpdateEdgeAction = {
  op: 'update_edge';
  id: string;
  data: Partial<EdgeData>;
};

export type GraphAction =
  | AddNodeAction
  | RemoveNodeAction
  | UpdateNodeAction
  | MoveNodeAction
  | AddEdgeAction
  | RemoveEdgeAction
  | UpdateEdgeAction;

export type AIResponse = {
  thought_process: string;
  actions: GraphAction[];
  summary: string;
};

export type ChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  thought_process?: string;
  timestamp: string;
};

// ── Streaming types ──────────────────────────────────────

export type StreamEvent =
  | { type: 'token'; token: string }
  | { type: 'tool_start'; name: string; input: Record<string, unknown> }
  | { type: 'tool_end'; name: string; output: Record<string, unknown> }
  | { type: 'done'; response: AIResponse }
  | { type: 'error'; message: string };

export type ToolCallState = {
  name: string;
  status: 'running' | 'done';
  input: Record<string, unknown>;
  output?: Record<string, unknown>;
};

