import { ReactFlowProvider } from '@xyflow/react';
import { TopBar } from './TopBar';
import { LeftSidebar } from './LeftSidebar';
import { RightPanel } from './RightPanel';
import { Canvas } from '@/components/canvas/Canvas';
import { Toolbar } from '@/components/canvas/Toolbar';
import { EmptyState } from '@/components/canvas/EmptyState';
import { ChatWidget } from '@/components/chat/ChatWidget';
import { useStore } from '@/store';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';

function LayoutInner() {
  useKeyboardShortcuts();
  const nodes = useStore((s) => s.nodes);

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-white">
      <TopBar />
      <div className="flex flex-1 overflow-hidden">
        <LeftSidebar />
        <div className="flex-1 relative">
          <Canvas />
          {nodes.length === 0 && <EmptyState />}
          <Toolbar />
          <ChatWidget />
        </div>
        <RightPanel />
      </div>
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
