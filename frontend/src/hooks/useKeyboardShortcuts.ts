import { useEffect } from 'react';
import { useStore } from '@/store';

export function useKeyboardShortcuts() {
  const undo = useStore((s) => s.undo);
  const redo = useStore((s) => s.redo);
  const toggleChat = useStore((s) => s.toggleChat);
  const saveCurrentGraph = useStore((s) => s.saveCurrentGraph);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const isMod = e.metaKey || e.ctrlKey;

      // Cmd+S should work even in inputs
      if (isMod && e.key === 's') {
        e.preventDefault();
        saveCurrentGraph();
        return;
      }

      // Ignore when typing in inputs
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return;
      }

      if (isMod && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
      }
      if (isMod && e.key === 'z' && e.shiftKey) {
        e.preventDefault();
        redo();
      }
      if (isMod && e.key === '/') {
        e.preventDefault();
        toggleChat();
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [undo, redo, toggleChat, saveCurrentGraph]);
}
