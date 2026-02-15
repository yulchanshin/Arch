import type { StateCreator } from 'zustand';
import type { ChatMessage } from '@/types/actions';
import type { AppStore } from './index';
import { generateGraph, modifyGraph } from '@/lib/api';
import { toast } from 'sonner';

export type ChatSlice = {
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
  sendMessage: (prompt: string) => Promise<void>;
  clearMessages: () => void;
};

export const createChatSlice: StateCreator<AppStore, [['zustand/immer', never]], [], ChatSlice> = (set, get) => ({
  messages: [],
  isLoading: false,
  error: null,

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
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Something went wrong';
      set((state) => {
        state.isLoading = false;
        state.error = message;
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

  clearMessages: () => {
    set((state) => {
      state.messages = [];
      state.error = null;
    });
  },
});
