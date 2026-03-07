import type { StateCreator } from 'zustand';
import type { AppStore } from './index';

export type Theme = 'light';
export type RightTab = 'Inspector' | 'Chat';

export type UISlice = {
  selectedNodeId: string | null;
  selectedEdgeId: string | null;
  activeRightTab: RightTab;
  rightPanelOpen: boolean;
  sidebarCollapsed: boolean;
  theme: Theme;
  selectNode: (id: string | null) => void;
  selectEdge: (id: string | null) => void;
  setActiveRightTab: (tab: RightTab) => void;
  toggleRightPanel: () => void;
  toggleSidebar: () => void;
  toggleTheme: () => void;

  // Legacy compat
  chatOpen: boolean;
  inspectorOpen: boolean;
  toggleChat: () => void;
  toggleInspector: () => void;
  setChatOpen: (open: boolean) => void;
};

export const createUISlice: StateCreator<AppStore, [['zustand/immer', never]], [], UISlice> = (set) => ({
  selectedNodeId: null,
  selectedEdgeId: null,
  activeRightTab: 'Chat',
  rightPanelOpen: true,
  sidebarCollapsed: false,
  theme: 'light' as Theme,

  // Legacy compat
  chatOpen: true,
  inspectorOpen: false,

  selectNode: (id) => {
    set((state) => {
      state.selectedNodeId = id;
      state.selectedEdgeId = null;
      if (id !== null) {
        state.activeRightTab = 'Inspector';
        state.rightPanelOpen = true;
      }
      state.inspectorOpen = id !== null;
    });
  },

  selectEdge: (id) => {
    set((state) => {
      state.selectedEdgeId = id;
      state.selectedNodeId = null;
      if (id !== null) {
        state.activeRightTab = 'Inspector';
        state.rightPanelOpen = true;
      }
      state.inspectorOpen = id !== null;
    });
  },

  setActiveRightTab: (tab) => {
    set((state) => {
      state.activeRightTab = tab;
    });
  },

  toggleRightPanel: () => {
    set((state) => {
      state.rightPanelOpen = !state.rightPanelOpen;
    });
  },

  toggleSidebar: () => {
    set((state) => {
      state.sidebarCollapsed = !state.sidebarCollapsed;
    });
  },

  // No-op — always light
  toggleTheme: () => {},

  // Legacy compat methods
  toggleChat: () => {
    set((state) => {
      state.activeRightTab = 'Chat';
      state.rightPanelOpen = true;
    });
  },
  toggleInspector: () => {
    set((state) => {
      state.activeRightTab = 'Inspector';
      state.rightPanelOpen = true;
    });
  },
  setChatOpen: () => {
    set((state) => {
      state.activeRightTab = 'Chat';
      state.rightPanelOpen = true;
    });
  },
});
