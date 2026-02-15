import type { StateCreator } from 'zustand';
import type { ChatMessage } from '@/types/actions';
import type { AppStore } from './index';
import { generateGraph, modifyGraph } from '@/lib/api';
import { toast } from 'sonner';

export type ChatSlice = {
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
  lastFailedPrompt: string | null;
  _pendingFitView: boolean;
  sendMessage: (prompt: string) => Promise<void>;
  retryLastMessage: () => Promise<void>;
  clearMessages: () => void;
  clearError: () => void;
  consumeFitView: () => boolean;
};

export const createChatSlice: StateCreator<AppStore, [['zustand/immer', never]], [], ChatSlice> = (set, get) => ({
  messages: [],
  isLoading: false,
  error: null,
  lastFailedPrompt: null,
  _pendingFitView: false,

  sendMessage: async (prompt) => {
    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: prompt,
      timestamp: new Date().toISOString(),
    };

    // Capture state before modifying
    const { nodes, edges, messages } = get();
    const isEmptyCanvas = nodes.length === 0;

    set((state) => {
      state.messages.push(userMessage);
      state.isLoading = true;
      state.error = null;
    });

    try {
      // Snapshot before mutation
      get().pushSnapshot();

      const chatHistory = messages.slice(-10).map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const aiResponse = isEmptyCanvas
        ? await generateGraph(prompt)
        : await modifyGraph(
            { nodes, edges },
            prompt,
            chatHistory
          );

      // Apply the patch
      const hasNewNodes = aiResponse.actions.some((a) => a.op === 'add_node');
      if (aiResponse.actions.length > 0) {
        get().applyPatch(aiResponse.actions);
      }

      const assistantMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: aiResponse.summary,
        thought_process: aiResponse.thought_process,
        timestamp: new Date().toISOString(),
      };

      set((state) => {
        state.messages.push(assistantMessage);
        state.isLoading = false;
        if (hasNewNodes) {
          state._pendingFitView = true;
        }
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Something went wrong';
      set((state) => {
        state.isLoading = false;
        state.error = message;
        state.lastFailedPrompt = prompt;
      });
      // Remove the snapshot since we failed
      set((state) => {
        if (state.past.length > 0) {
          state.past.pop();
        }
      });
      toast.error('AI request failed', { description: message });
    }
  },

  retryLastMessage: async () => {
    const { lastFailedPrompt } = get();
    if (!lastFailedPrompt) return;

    // Remove the failed user message before retrying
    set((state) => {
      const lastUserIdx = [...state.messages].reverse().findIndex((m) => m.role === 'user');
      if (lastUserIdx !== -1) {
        state.messages.splice(state.messages.length - 1 - lastUserIdx, 1);
      }
      state.error = null;
      state.lastFailedPrompt = null;
    });

    await get().sendMessage(lastFailedPrompt);
  },

  clearMessages: () => {
    set((state) => {
      state.messages = [];
      state.error = null;
      state.lastFailedPrompt = null;
    });
  },

  clearError: () => {
    set((state) => {
      state.error = null;
      state.lastFailedPrompt = null;
    });
  },

  consumeFitView: () => {
    const pending = get()._pendingFitView;
    if (pending) {
      set((state) => {
        state._pendingFitView = false;
      });
    }
    return pending;
  },
});
