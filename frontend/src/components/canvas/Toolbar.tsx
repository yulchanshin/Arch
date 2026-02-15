import {
  ZoomIn,
  ZoomOut,
  Maximize,
  Undo2,
  Redo2,
  MessageSquare,
  Save,
} from 'lucide-react';
import { useReactFlow } from '@xyflow/react';
import { useStore } from '@/store';
import { cn } from '@/lib/utils';

function ToolbarButton({
  onClick,
  disabled,
  active,
  children,
  title,
}: {
  onClick: () => void;
  disabled?: boolean;
  active?: boolean;
  children: React.ReactNode;
  title: string;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={cn(
        'p-1.5 rounded-md text-zinc-400 transition-colors',
        'hover:bg-zinc-800/50 hover:text-zinc-200',
        'disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-zinc-400',
        active && 'text-cyan-400 bg-zinc-800/50'
      )}
    >
      {children}
    </button>
  );
}

function ToolbarDivider() {
  return <div className="w-px h-4 bg-zinc-800" />;
}

export function Toolbar() {
  const { zoomIn, zoomOut, fitView } = useReactFlow();
  const undo = useStore((s) => s.undo);
  const redo = useStore((s) => s.redo);
  const canUndo = useStore((s) => s.canUndo);
  const canRedo = useStore((s) => s.canRedo);
  const chatOpen = useStore((s) => s.chatOpen);
  const toggleChat = useStore((s) => s.toggleChat);

  return (
    <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10">
      <div
        className={cn(
          'flex items-center gap-0.5 px-2 py-1',
          'bg-zinc-950/80 backdrop-blur-md',
          'border border-zinc-800 rounded-md',
          'shadow-sm'
        )}
      >
        <ToolbarButton onClick={() => zoomIn()} title="Zoom in">
          <ZoomIn size={15} />
        </ToolbarButton>
        <ToolbarButton onClick={() => zoomOut()} title="Zoom out">
          <ZoomOut size={15} />
        </ToolbarButton>
        <ToolbarButton onClick={() => fitView({ padding: 0.2, duration: 300 })} title="Fit view">
          <Maximize size={15} />
        </ToolbarButton>

        <ToolbarDivider />

        <ToolbarButton onClick={undo} disabled={!canUndo()} title="Undo (Cmd+Z)">
          <Undo2 size={15} />
        </ToolbarButton>
        <ToolbarButton onClick={redo} disabled={!canRedo()} title="Redo (Cmd+Shift+Z)">
          <Redo2 size={15} />
        </ToolbarButton>

        <ToolbarDivider />

        <ToolbarButton onClick={() => {}} title="Save">
          <Save size={15} />
        </ToolbarButton>
        <ToolbarButton onClick={toggleChat} active={chatOpen} title="Toggle chat">
          <MessageSquare size={15} />
        </ToolbarButton>
      </div>
    </div>
  );
}
