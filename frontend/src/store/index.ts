import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { createGraphSlice, type GraphSlice } from './graphSlice';
import { createUISlice, type UISlice } from './uiSlice';
import { createHistorySlice, type HistorySlice } from './historySlice';
import { createChatSlice, type ChatSlice } from './chatSlice';

export type AppStore = GraphSlice & UISlice & HistorySlice & ChatSlice;

export const useStore = create<AppStore>()(
  immer((...a) => ({
    ...createGraphSlice(...a),
    ...createUISlice(...a),
    ...createHistorySlice(...a),
    ...createChatSlice(...a),
  }))
);
