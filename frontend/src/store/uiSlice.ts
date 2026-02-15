import type { StateCreator } from 'zustand';
import type { AppStore } from './index';

export type Theme = 'dark' | 'light';

export type UISlice = {
  selectedNodeId: string | null;
  selectedEdgeId: string | null;
  chatOpen: boolean;
  inspectorOpen: boolean;
  sidebarCollapsed: boolean;
  theme: Theme;
  selectNode: (id: string | null) => void;
  selectEdge: (id: string | null) => void;
  toggleChat: () => void;
  toggleInspector: () => void;
  toggleSidebar: () => void;
  setChatOpen: (open: boolean) => void;
  toggleTheme: () => void;
};

function getInitialTheme(): Theme {
  if (typeof window === 'undefined') return 'dark';
  const stored = localStorage.getItem('arch-theme');
  if (stored === 'light' || stored === 'dark') return stored;
  return 'dark';
}

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  if (theme === 'light') {
    root.classList.add('light');
  } else {
    root.classList.remove('light');
  }
  localStorage.setItem('arch-theme', theme);
}

// Apply on load
const initialTheme = getInitialTheme();
if (typeof document !== 'undefined') {
  applyTheme(initialTheme);
}

export const createUISlice: StateCreator<AppStore, [['zustand/immer', never]], [], UISlice> = (set) => ({
  selectedNodeId: null,
  selectedEdgeId: null,
  chatOpen: true,
  inspectorOpen: false,
  sidebarCollapsed: false,
  theme: initialTheme,

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

  toggleTheme: () => {
    set((state) => {
      state.theme = state.theme === 'dark' ? 'light' : 'dark';
      applyTheme(state.theme);
    });
  },
});
