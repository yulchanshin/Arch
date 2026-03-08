import type { StateCreator } from 'zustand';
import type { AppStore } from './index';
import type { ArchReview } from '@/types/actions';
import { reviewArchitecture } from '@/lib/api';
import { toast } from 'sonner';

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

  // Review
  reviewResult: ArchReview | null;
  isReviewing: boolean;
  reviewPanelOpen: boolean;
  requestReview: () => Promise<void>;
  clearReview: () => void;
  setReviewPanelOpen: (open: boolean) => void;

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

  // Review
  reviewResult: null,
  isReviewing: false,
  reviewPanelOpen: false,

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

  requestReview: async () => {
    const { nodes, edges, isReviewing } = get();
    if (isReviewing || nodes.length === 0) return;

    set((state) => { state.isReviewing = true; });

    try {
      const review = await reviewArchitecture({ nodes, edges });
      set((state) => {
        state.reviewResult = review;
        state.isReviewing = false;
        state.reviewPanelOpen = false;
      });
      toast.success('Architecture review complete');
    } catch (error) {
      set((state) => { state.isReviewing = false; });
      const message = error instanceof Error ? error.message : 'Review failed';
      toast.error('Review failed', { description: message });
    }
  },

  clearReview: () => {
    set((state) => {
      state.reviewResult = null;
      state.reviewPanelOpen = false;
    });
  },

  setReviewPanelOpen: (open) => {
    set((state) => { state.reviewPanelOpen = open; });
  },
});
