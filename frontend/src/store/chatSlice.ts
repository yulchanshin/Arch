import type { StateCreator } from 'zustand';
import type { ChatMessage, ToolCallState } from '@/types/actions';
import type { AppStore } from './index';
import { streamGenerate, streamModify } from '@/lib/api';
import { toast } from 'sonner';

export type ChatSlice = {
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
  lastFailedPrompt: string | null;
  _pendingFitView: boolean;

  // Streaming state
  isStreaming: boolean;
  streamTokens: string;
  activeToolCalls: ToolCallState[];

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

  // Streaming
  isStreaming: false,
  streamTokens: '',
  activeToolCalls: [],

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
      state.isStreaming = true;
      state.streamTokens = '';
      state.activeToolCalls = [];
      state.error = null;
    });

    try {
      // Snapshot before mutation
      get().pushSnapshot();

      const chatHistory = messages.slice(-10).map((m) => ({
        role: m.role,
        content: m.content,
      }));

      // Use streaming API
      const stream = isEmptyCanvas
        ? streamGenerate(prompt, chatHistory)
        : streamModify({ nodes, edges }, prompt, chatHistory);

      let finalResponse = null;

      for await (const event of stream) {
        switch (event.type) {
          case 'token':
            set((state) => {
              state.streamTokens += event.token;
            });
            break;

          case 'tool_start':
            set((state) => {
              state.activeToolCalls.push({
                name: event.name,
                status: 'running',
                input: event.input,
              });
            });
            break;

          case 'tool_end':
            set((state) => {
              const tc = state.activeToolCalls.find(
                (t) => t.name === event.name && t.status === 'running'
              );
              if (tc) {
                tc.status = 'done';
                tc.output = event.output;
              }
            });
            break;

          case 'done':
            finalResponse = event.response;
            break;

          case 'error':
            throw new Error(event.message);
        }
      }

      if (!finalResponse) {
        throw new Error('Stream ended without a response');
      }

      // Apply the patch
      const hasNewNodes = finalResponse.actions.some((a) => a.op === 'add_node');
      if (finalResponse.actions.length > 0) {
        get().applyPatch(finalResponse.actions);
      } else {
        // No actions = undo the empty snapshot
        set((state) => {
          if (state.past.length > 0) {
            state.past.pop();
          }
        });
      }

      const summary = finalResponse.summary
        || (finalResponse.actions.length === 0
          ? "I understood your request but didn't generate any changes. Could you be more specific?"
          : 'Done.');

      const assistantMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: summary,
        thought_process: finalResponse.thought_process,
        timestamp: new Date().toISOString(),
      };

      set((state) => {
        state.messages.push(assistantMessage);
        state.isLoading = false;
        state.isStreaming = false;
        state.streamTokens = '';
        state.activeToolCalls = [];
        if (hasNewNodes) {
          state._pendingFitView = true;
        }
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Something went wrong';
      set((state) => {
        state.isLoading = false;
        state.isStreaming = false;
        state.streamTokens = '';
        state.activeToolCalls = [];
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
