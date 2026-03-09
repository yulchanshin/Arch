import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
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
  const projects = useStore((s) => s.projects);
  const currentProject = useStore((s) => s.currentProject);
  const setCurrentProject = useStore((s) => s.setCurrentProject);
  const renameGraph = useStore((s) => s.renameGraph);
  const loadIteration = useStore((s) => s.loadIteration);
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const projectId = searchParams.get('project');
    if (!projectId) return;
    // Find project in already-fetched list
    const project = projects.find((p) => p.id === projectId);
    if (project && currentProject?.id !== project.id) {
      setCurrentProject(project);
      renameGraph(project.name);
      // Load the first iteration if available
      if (project.firstIterationId) {
        loadIteration(project.firstIterationId);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, projects]);

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
