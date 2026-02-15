import type { StateCreator } from 'zustand';
import type { AppStore } from './index';

export type UISlice = {
  selectedNodeId: string | null;
  selectedEdgeId: string | null;
  chatOpen: boolean;
  inspectorOpen: boolean;
  sidebarCollapsed: boolean;
  selectNode: (id: string | null) => void;
  selectEdge: (id: string | null) => void;
  toggleChat: () => void;
  toggleInspector: () => void;
  toggleSidebar: () => void;
  setChatOpen: (open: boolean) => void;
};

export const createUISlice: StateCreator<AppStore, [['zustand/immer', never]], [], UISlice> = (set) => ({
  selectedNodeId: null,
  selectedEdgeId: null,
  chatOpen: true,
  inspectorOpen: false,
  sidebarCollapsed: false,

  selectNode: (id) => {
    set((state) => {
      state.selectedNodeId = id;
      state.selectedEdgeId = null;
      state.inspectorOpen = id !== null;
    });
  },

  selectEdge: (id) => {
    set((state) => {
      state.selectedEdgeId = id;
      state.selectedNodeId = null;
      state.inspectorOpen = id !== null;
    });
  },

  toggleChat: () => {
    set((state) => {
      state.chatOpen = !state.chatOpen;
    });
  },

  toggleInspector: () => {
    set((state) => {
      state.inspectorOpen = !state.inspectorOpen;
    });
  },

  toggleSidebar: () => {
    set((state) => {
      state.sidebarCollapsed = !state.sidebarCollapsed;
    });
  },

  setChatOpen: (open) => {
    set((state) => {
      state.chatOpen = open;
    });
  },
});
