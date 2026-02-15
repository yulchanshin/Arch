import type { StateCreator } from 'zustand';
import type { AppNode, AppEdge, NodeData, EdgeData, GraphMetadata } from '@/types/graph';
import type { GraphAction } from '@/types/actions';
import type {
  OnNodesChange,
  OnEdgesChange,
  OnConnect,
  Connection,
} from '@xyflow/react';
import { applyNodeChanges, applyEdgeChanges, addEdge } from '@xyflow/react';
import type { AppStore } from './index';

export type GraphSlice = {
  nodes: AppNode[];
  edges: AppEdge[];
  metadata: GraphMetadata;
  onNodesChange: OnNodesChange<AppNode>;
  onEdgesChange: OnEdgesChange<AppEdge>;
  onConnect: OnConnect;
  addNode: (node: AppNode) => void;
  removeNode: (id: string) => void;
  updateNodeData: (id: string, data: Partial<NodeData>) => void;
  moveNode: (id: string, position: { x: number; y: number }) => void;
  addEdgeToGraph: (edge: AppEdge) => void;
  removeEdge: (id: string) => void;
  updateEdgeData: (id: string, data: Partial<EdgeData>) => void;
  applyPatch: (actions: GraphAction[]) => void;
  setGraph: (nodes: AppNode[], edges: AppEdge[], metadata?: Partial<GraphMetadata>) => void;
  clearGraph: () => void;
};

const defaultMetadata: GraphMetadata = {
  id: crypto.randomUUID(),
  name: 'Untitled Architecture',
  version: 1,
  createdAt: new Date().toISOString(),
  lastModified: new Date().toISOString(),
};

export const createGraphSlice: StateCreator<AppStore, [['zustand/immer', never]], [], GraphSlice> = (set, get) => ({
  nodes: [],
  edges: [],
  metadata: { ...defaultMetadata },

  onNodesChange: (changes) => {
    set((state) => {
      state.nodes = applyNodeChanges(changes, state.nodes) as AppNode[];
    });
  },

  onEdgesChange: (changes) => {
    set((state) => {
      state.edges = applyEdgeChanges(changes, state.edges) as AppEdge[];
    });
  },

  onConnect: (connection: Connection) => {
    const edge: AppEdge = {
      id: `edge_${connection.source}_${connection.target}_${Date.now()}`,
      source: connection.source,
      target: connection.target,
      sourceHandle: connection.sourceHandle,
      targetHandle: connection.targetHandle,
      type: 'arch',
      data: { label: '' },
    };
    get().pushSnapshot();
    set((state) => {
      state.edges = addEdge(edge, state.edges) as AppEdge[];
    });
  },

  addNode: (node) => {
    set((state) => {
      state.nodes.push(node);
    });
  },

  removeNode: (id) => {
    set((state) => {
      state.nodes = state.nodes.filter((n) => n.id !== id);
      state.edges = state.edges.filter((e) => e.source !== id && e.target !== id);
    });
  },

  updateNodeData: (id, data) => {
    set((state) => {
      const node = state.nodes.find((n) => n.id === id);
      if (node) {
        node.data = { ...node.data, ...data };
      }
    });
  },

  moveNode: (id, position) => {
    set((state) => {
      const node = state.nodes.find((n) => n.id === id);
      if (node) {
        node.position = position;
      }
    });
  },

  addEdgeToGraph: (edge) => {
    set((state) => {
      state.edges.push(edge);
    });
  },

  removeEdge: (id) => {
    set((state) => {
      state.edges = state.edges.filter((e) => e.id !== id);
    });
  },

  updateEdgeData: (id, data) => {
    set((state) => {
      const edge = state.edges.find((e) => e.id === id);
      if (edge) {
        edge.data = { ...edge.data, ...data } as EdgeData;
      }
    });
  },

  applyPatch: (actions) => {
    set((state) => {
      for (const action of actions) {
        switch (action.op) {
          case 'add_node': {
            const exists = state.nodes.some((n) => n.id === action.id);
            if (!exists) {
              state.nodes.push({
                id: action.id,
                type: action.data.nodeType,
                position: action.position,
                data: action.data,
              } as AppNode);
            }
            break;
          }
          case 'remove_node': {
            state.nodes = state.nodes.filter((n) => n.id !== action.id);
            state.edges = state.edges.filter(
              (e) => e.source !== action.id && e.target !== action.id
            );
            break;
          }
          case 'update_node': {
            const node = state.nodes.find((n) => n.id === action.id);
            if (node) {
              node.data = { ...node.data, ...action.data };
            }
            break;
          }
          case 'move_node': {
            const node = state.nodes.find((n) => n.id === action.id);
            if (node) {
              node.position = action.position;
            }
            break;
          }
          case 'add_edge': {
            const exists = state.edges.some((e) => e.id === action.id);
            if (!exists) {
              state.edges.push({
                id: action.id,
                source: action.source,
                target: action.target,
                type: 'arch',
                data: action.data ?? { label: '' },
              } as AppEdge);
            }
            break;
          }
          case 'remove_edge': {
            state.edges = state.edges.filter((e) => e.id !== action.id);
            break;
          }
          case 'update_edge': {
            const edge = state.edges.find((e) => e.id === action.id);
            if (edge) {
              edge.data = { ...edge.data, ...action.data } as EdgeData;
            }
            break;
          }
        }
      }
      state.metadata.version += 1;
      state.metadata.lastModified = new Date().toISOString();
    });
  },

  setGraph: (nodes, edges, metadata) => {
    set((state) => {
      state.nodes = nodes;
      state.edges = edges;
      if (metadata) {
        Object.assign(state.metadata, metadata);
      }
    });
  },

  clearGraph: () => {
    set((state) => {
      state.nodes = [];
      state.edges = [];
      state.metadata.version += 1;
      state.metadata.lastModified = new Date().toISOString();
    });
  },
});
