import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { createGraphSlice, type GraphSlice } from './graphSlice';
import { createUISlice, type UISlice } from './uiSlice';
import { createHistorySlice, type HistorySlice } from './historySlice';
import { createChatSlice, type ChatSlice } from './chatSlice';
import { createAuthSlice, type AuthSlice } from './authSlice';
import { createProjectSlice, type ProjectSlice } from './projectSlice';

export type AppStore = GraphSlice & UISlice & HistorySlice & ChatSlice & AuthSlice & ProjectSlice;

export const useStore = create<AppStore>()(
  immer((...a) => ({
    ...createGraphSlice(...a),
    ...createUISlice(...a),
    ...createHistorySlice(...a),
    ...createChatSlice(...a),
    ...createAuthSlice(...a),
    ...createProjectSlice(...a),
  }))
);
