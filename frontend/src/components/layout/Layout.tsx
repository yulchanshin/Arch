import { ReactFlowProvider } from '@xyflow/react';
import { Sidebar } from './Sidebar';
import { Canvas } from '@/components/canvas/Canvas';
import { Toolbar } from '@/components/canvas/Toolbar';
import { InspectorPanel } from '@/components/inspector/InspectorPanel';
import { ChatPanel } from '@/components/chat/ChatPanel';
import { EmptyState } from '@/components/canvas/EmptyState';
import { useStore } from '@/store';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';

function LayoutInner() {
  useKeyboardShortcuts();
  const nodes = useStore((s) => s.nodes);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background">
      <Sidebar />
      <div className="flex-1 relative">
        <Toolbar />
        <Canvas />
        {nodes.length === 0 && <EmptyState />}
        <InspectorPanel />
      </div>
      <ChatPanel />
    </div>
  );
}

export function Layout() {
  return (
    <ReactFlowProvider>
      <LayoutInner />
    </ReactFlowProvider>
  );
}
