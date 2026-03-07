import { X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useStore } from '@/store';
import { InspectorPanel } from '@/components/inspector/InspectorPanel';

export function RightPanel() {
  const selectedNodeId = useStore((s) => s.selectedNodeId);
  const selectedEdgeId = useStore((s) => s.selectedEdgeId);
  const selectNode = useStore((s) => s.selectNode);
  const selectEdge = useStore((s) => s.selectEdge);

  const hasSelection = !!(selectedNodeId || selectedEdgeId);

  const handleClose = () => {
    selectNode(null);
    selectEdge(null);
  };

  return (
    <AnimatePresence>
      {hasSelection && (
        <motion.div
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: 320, opacity: 1 }}
          exit={{ width: 0, opacity: 0 }}
          transition={{ type: 'spring', damping: 30, stiffness: 400 }}
          className="h-full border-l border-gray-200 bg-white flex flex-col shrink-0 overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-3 py-2.5 border-b border-gray-100">
            <span className="text-[12px] font-semibold text-gray-900 uppercase tracking-wider">
              Inspector
            </span>
            <button
              onClick={handleClose}
              className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
              title="Close"
            >
              <X size={14} />
            </button>
          </div>

          {/* Inspector content */}
          <div className="flex-1 overflow-hidden">
            <InspectorPanel />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
