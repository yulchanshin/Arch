import type { StateCreator } from 'zustand';
import type { AppNode, AppEdge } from '@/types/graph';
import type { AppStore } from './index';
import { MAX_HISTORY } from '@/lib/constants';

type Snapshot = {
  nodes: AppNode[];
  edges: AppEdge[];
};

export type HistorySlice = {
  past: Snapshot[];
  future: Snapshot[];
  pushSnapshot: () => void;
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
};

export const createHistorySlice: StateCreator<AppStore, [['zustand/immer', never]], [], HistorySlice> = (set, get) => ({
  past: [],
  future: [],

  pushSnapshot: () => {
    const { nodes, edges } = get();
    const snapshot: Snapshot = {
      nodes: JSON.parse(JSON.stringify(nodes)),
      edges: JSON.parse(JSON.stringify(edges)),
    };
    set((state) => {
      state.past.push(snapshot);
      if (state.past.length > MAX_HISTORY) {
        state.past.shift();
      }
      state.future = [];
    });
  },

  undo: () => {
    const { past, nodes, edges } = get();
    if (past.length === 0) return;

    const currentSnapshot: Snapshot = {
      nodes: JSON.parse(JSON.stringify(nodes)),
      edges: JSON.parse(JSON.stringify(edges)),
    };
    const previous = past[past.length - 1];

    set((state) => {
      state.past.pop();
      state.future.push(currentSnapshot);
      state.nodes = previous.nodes;
      state.edges = previous.edges;
    });
  },

  redo: () => {
    const { future, nodes, edges } = get();
    if (future.length === 0) return;

    const currentSnapshot: Snapshot = {
      nodes: JSON.parse(JSON.stringify(nodes)),
      edges: JSON.parse(JSON.stringify(edges)),
    };
    const next = future[future.length - 1];

    set((state) => {
      state.future.pop();
      state.past.push(currentSnapshot);
      state.nodes = next.nodes;
      state.edges = next.edges;
    });
  },

  canUndo: () => get().past.length > 0,
  canRedo: () => get().future.length > 0,
});
