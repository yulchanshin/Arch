import { useState } from 'react';
import {
  ZoomIn,
  ZoomOut,
  Maximize,
  Undo2,
  Redo2,
  Save,
  Download,
  ClipboardCheck,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useReactFlow } from '@xyflow/react';
import { toast } from 'sonner';
import { useStore } from '@/store';
import { cn } from '@/lib/utils';
import { downloadPng } from '@/lib/exportPng';

function ToolbarButton({
  onClick,
  disabled,
  children,
  title,
}: {
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
  title: string;
}) {
  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      title={title}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={cn(
        'p-1.5 rounded-lg text-gray-400 transition-colors',
        'hover:bg-gray-100 hover:text-gray-600',
        'disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-gray-400'
      )}
    >
      {children}
    </motion.button>
  );
}

function ToolbarDivider() {
  return <div className="w-px h-4 bg-gray-200" />;
}

export function Toolbar() {
  const { zoomIn, zoomOut, fitView, getZoom } = useReactFlow();
  const undo = useStore((s) => s.undo);
  const redo = useStore((s) => s.redo);
  const canUndo = useStore((s) => s.canUndo);
  const canRedo = useStore((s) => s.canRedo);
  const saveCurrentGraph = useStore((s) => s.saveCurrentGraph);
  const isSaving = useStore((s) => s.isSaving);
  const graphName = useStore((s) => s.metadata.name);
  const requestReview = useStore((s) => s.requestReview);
  const isReviewing = useStore((s) => s.isReviewing);
  const [isExporting, setIsExporting] = useState(false);
  const [zoom, setZoom] = useState(100);

  const updateZoom = () => {
    setZoom(Math.round(getZoom() * 100));
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
      await downloadPng(`${graphName}_${timestamp}.png`);
      toast.success('Exported as PNG');
    } catch {
      toast.error('Export failed. Try again.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10" data-toolbar>
      <div
        className={cn(
          'flex items-center gap-0.5 px-2.5 py-1.5',
          'bg-white',
          'border border-gray-200 rounded-xl',
          'shadow-lg shadow-gray-200/50'
        )}
      >
        <ToolbarButton
          onClick={() => { zoomOut(); setTimeout(updateZoom, 50); }}
          title="Zoom out"
        >
          <ZoomOut size={15} />
        </ToolbarButton>

        <span
          className="text-[11px] font-mono text-gray-400 w-10 text-center tabular-nums cursor-pointer select-none hover:text-gray-600 transition-colors"
          onClick={() => { fitView({ padding: 0.2, duration: 300 }); setTimeout(updateZoom, 350); }}
          title="Reset zoom"
        >
          {zoom}%
        </span>

        <ToolbarButton
          onClick={() => { zoomIn(); setTimeout(updateZoom, 50); }}
          title="Zoom in"
        >
          <ZoomIn size={15} />
        </ToolbarButton>

        <ToolbarDivider />

        <ToolbarButton
          onClick={() => fitView({ padding: 0.2, duration: 300 })}
          title="Fit view"
        >
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

        <ToolbarButton onClick={saveCurrentGraph} disabled={isSaving} title="Save (Cmd+S)">
          <Save size={15} />
        </ToolbarButton>
        <ToolbarButton onClick={handleExport} disabled={isExporting} title="Export as PNG">
          <Download size={15} />
        </ToolbarButton>

        <ToolbarDivider />

        <motion.button
          onClick={requestReview}
          disabled={isReviewing}
          title="Review Architecture"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={cn(
            'flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors',
            isReviewing
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
          )}
        >
          <ClipboardCheck size={13} />
          {isReviewing ? 'Reviewing...' : 'Review'}
        </motion.button>
      </div>
    </div>
  );
}
