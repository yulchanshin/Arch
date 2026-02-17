import { useState, useRef, useEffect, useCallback } from 'react';
import { X, Trash2, ChevronDown } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useStore } from '@/store';
import { cn } from '@/lib/utils';
import type { NodeData, EdgeData, Provider, Tech, Protocol } from '@/types/graph';
import { TechLogo, ProviderLogo } from '@/components/shared/TechLogo';
import { getProviderLabel, getTechLabel } from '@/lib/logos';
import { getTechnologiesForNodeType } from '@/lib/techCatalog';

const PROVIDERS: Provider[] = ['aws', 'gcp', 'azure', 'supabase', 'vercel', 'cloudflare'];
const PROTOCOLS: Protocol[] = ['http', 'grpc', 'ws', 'tcp', 'amqp', 'kafka'];

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground block mb-1">
      {children}
    </label>
  );
}

function InputField({
  value,
  onChange,
  placeholder,
  type = 'text',
}: {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full px-2 py-1.5 bg-secondary border border-border-default rounded-md text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-cyan-500/50 placeholder:text-muted-foreground"
    />
  );
}

// Custom dropdown with logo support
function LogoDropdown<T extends string>({
  value,
  options,
  onChange,
  placeholder,
  renderOption,
}: {
  value: T | undefined;
  options: T[];
  onChange: (val: T | undefined) => void;
  placeholder: string;
  renderOption: (opt: T) => React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const handleClickOutside = useCallback(
    (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    },
    []
  );

  useEffect(() => {
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [open, handleClickOutside]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={cn(
          'w-full flex items-center justify-between px-2 py-1.5 bg-secondary border border-border-default rounded-md text-sm',
          'focus:outline-none focus:ring-1 focus:ring-cyan-500/50 cursor-pointer',
          value ? 'text-foreground' : 'text-muted-foreground'
        )}
      >
        <span className="flex items-center gap-2 min-w-0 truncate">
          {value ? renderOption(value) : placeholder}
        </span>
        <ChevronDown size={12} className={cn('shrink-0 text-muted-foreground transition-transform', open && 'rotate-180')} />
      </button>

      {open && (
        <div className={cn(
          'absolute z-50 mt-1 w-full max-h-[200px] overflow-y-auto',
          'bg-surface-overlay backdrop-blur-md',
          'border border-border-default rounded-md shadow-sm',
          'py-0.5'
        )}>
          {/* None option */}
          <button
            type="button"
            onClick={() => { onChange(undefined); setOpen(false); }}
            className={cn(
              'w-full flex items-center gap-2 px-2 py-1.5 text-xs text-muted-foreground',
              'hover:bg-secondary transition-colors',
              !value && 'bg-secondary/50'
            )}
          >
            None
          </button>
          {options.map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => { onChange(opt); setOpen(false); }}
              className={cn(
                'w-full flex items-center gap-2 px-2 py-1.5 text-xs',
                'hover:bg-secondary transition-colors',
                opt === value ? 'text-foreground bg-secondary/50' : 'text-muted-foreground'
              )}
            >
              {renderOption(opt)}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function SelectField<T extends string>({
  value,
  options,
  onChange,
  placeholder,
}: {
  value: T | undefined;
  options: T[];
  onChange: (val: T | undefined) => void;
  placeholder?: string;
}) {
  return (
    <select
      value={value ?? ''}
      onChange={(e) => onChange((e.target.value || undefined) as T | undefined)}
      className={cn(
        'w-full px-2 py-1.5 bg-secondary border border-border-default rounded-md text-sm',
        'text-foreground focus:outline-none focus:ring-1 focus:ring-cyan-500/50',
        'appearance-none cursor-pointer',
        !value && 'text-muted-foreground'
      )}
    >
      <option value="">{placeholder ?? 'None'}</option>
      {options.map((opt) => (
        <option key={opt} value={opt}>
          {opt}
        </option>
      ))}
    </select>
  );
}

export function InspectorPanel() {
  const selectedNodeId = useStore((s) => s.selectedNodeId);
  const selectedEdgeId = useStore((s) => s.selectedEdgeId);
  const inspectorOpen = useStore((s) => s.inspectorOpen);
  const nodes = useStore((s) => s.nodes);
  const edges = useStore((s) => s.edges);
  const updateNodeData = useStore((s) => s.updateNodeData);
  const updateEdgeData = useStore((s) => s.updateEdgeData);
  const selectNode = useStore((s) => s.selectNode);
  const selectEdge = useStore((s) => s.selectEdge);
  const pushSnapshot = useStore((s) => s.pushSnapshot);
  const removeNode = useStore((s) => s.removeNode);
  const removeEdge = useStore((s) => s.removeEdge);

  const selectedNode = selectedNodeId
    ? nodes.find((n) => n.id === selectedNodeId)
    : null;
  const selectedEdge = selectedEdgeId
    ? edges.find((e) => e.id === selectedEdgeId)
    : null;

  const isVisible = inspectorOpen && (selectedNode || selectedEdge);

  const handleNodeUpdate = (data: Partial<NodeData>) => {
    if (!selectedNode) return;
    pushSnapshot();
    updateNodeData(selectedNode.id, data);
  };

  const handleEdgeUpdate = (data: Partial<EdgeData>) => {
    if (!selectedEdge) return;
    pushSnapshot();
    updateEdgeData(selectedEdge.id, data);
  };

  const techOptions = selectedNode
    ? getTechnologiesForNodeType(selectedNode.data.nodeType).map((t) => t.id)
    : [];

  return (
    <AnimatePresence>
      {isVisible && (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
      data-toolbar
      className={cn(
        'absolute bottom-3 right-3 z-10 w-72',
        'bg-surface-overlay backdrop-blur-md',
        'border border-border-default rounded-md',
        'shadow-sm'
      )}
    >
      <div className="flex items-center justify-between px-3 py-2 border-b border-border-default">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          {selectedNode ? 'Node' : 'Edge'}
        </span>
        <button
          onClick={() => {
            selectNode(null);
            selectEdge(null);
          }}
          className="p-0.5 rounded hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
        >
          <X size={14} />
        </button>
      </div>

      <div className="px-3 py-2.5 space-y-2.5 max-h-[60vh] overflow-y-auto">
        {selectedNode && (
          <>
            {/* Label */}
            <div>
              <FieldLabel>Label</FieldLabel>
              <InputField
                value={selectedNode.data.label}
                onChange={(val) => handleNodeUpdate({ label: val })}
                placeholder="Node label"
              />
            </div>

            {/* Type (read-only) */}
            <div>
              <FieldLabel>Type</FieldLabel>
              <p className="text-xs font-mono text-muted-foreground px-2 py-1.5">
                {selectedNode.data.nodeType}
              </p>
            </div>

            {/* Provider - custom dropdown with logos */}
            <div>
              <FieldLabel>Provider</FieldLabel>
              <LogoDropdown
                value={selectedNode.data.provider}
                options={PROVIDERS}
                onChange={(val) => handleNodeUpdate({ provider: val })}
                placeholder="Select provider"
                renderOption={(provider) => (
                  <>
                    <ProviderLogo provider={provider} size={18} />
                    <span>{getProviderLabel(provider)}</span>
                  </>
                )}
              />
            </div>

            {/* Technology - custom dropdown with logos */}
            <div>
              <FieldLabel>Technology</FieldLabel>
              <LogoDropdown
                value={selectedNode.data.tech}
                options={techOptions}
                onChange={(val) => handleNodeUpdate({ tech: val })}
                placeholder="Select technology"
                renderOption={(tech) => (
                  <>
                    <TechLogo tech={tech} size={18} />
                    <span>{getTechLabel(tech)}</span>
                  </>
                )}
              />
            </div>

            {/* Replicas */}
            <div>
              <FieldLabel>Replicas</FieldLabel>
              <input
                type="number"
                min={1}
                max={100}
                value={selectedNode.data.replicas ?? ''}
                onChange={(e) => {
                  const val = e.target.value ? parseInt(e.target.value, 10) : undefined;
                  handleNodeUpdate({ replicas: val });
                }}
                placeholder="1"
                className="w-full px-2 py-1.5 bg-secondary border border-border-default rounded-md text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-cyan-500/50 placeholder:text-muted-foreground"
              />
            </div>

            {/* Port */}
            <div>
              <FieldLabel>Port</FieldLabel>
              <input
                type="number"
                min={1}
                max={65535}
                value={selectedNode.data.port ?? ''}
                onChange={(e) => {
                  const val = e.target.value ? parseInt(e.target.value, 10) : undefined;
                  handleNodeUpdate({ port: val });
                }}
                placeholder="8080"
                className="w-full px-2 py-1.5 bg-secondary border border-border-default rounded-md text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-cyan-500/50 placeholder:text-muted-foreground"
              />
            </div>

            {/* Region */}
            <div>
              <FieldLabel>Region</FieldLabel>
              <InputField
                value={selectedNode.data.region ?? ''}
                onChange={(val) => handleNodeUpdate({ region: val || undefined })}
                placeholder="us-east-1"
              />
            </div>

            {/* Description */}
            <div>
              <FieldLabel>Description</FieldLabel>
              <textarea
                value={selectedNode.data.description ?? ''}
                onChange={(e) => handleNodeUpdate({ description: e.target.value || undefined })}
                placeholder="Optional description..."
                rows={2}
                className="w-full px-2 py-1.5 bg-secondary border border-border-default rounded-md text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-cyan-500/50 placeholder:text-muted-foreground resize-none"
              />
            </div>

            {/* ID */}
            <div>
              <FieldLabel>ID</FieldLabel>
              <p className="text-[10px] font-mono text-muted-foreground break-all px-2 py-1">
                {selectedNode.id}
              </p>
            </div>

            {/* Delete */}
            <button
              onClick={() => {
                pushSnapshot();
                removeNode(selectedNode.id);
                selectNode(null);
              }}
              className="w-full flex items-center justify-center gap-1.5 mt-1 px-2 py-1.5 text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-md hover:bg-red-500/20 transition-colors"
            >
              <Trash2 size={12} />
              Delete Node
            </button>
          </>
        )}

        {selectedEdge && (
          <>
            {/* Label */}
            <div>
              <FieldLabel>Label</FieldLabel>
              <InputField
                value={selectedEdge.data?.label ?? ''}
                onChange={(val) => handleEdgeUpdate({ label: val })}
                placeholder="Connection label"
              />
            </div>

            {/* Protocol */}
            <div>
              <FieldLabel>Protocol</FieldLabel>
              <SelectField
                value={selectedEdge.data?.protocol}
                options={PROTOCOLS}
                onChange={(val) => handleEdgeUpdate({ protocol: val })}
                placeholder="Select protocol"
              />
            </div>

            {/* Latency */}
            <div>
              <FieldLabel>Latency</FieldLabel>
              <InputField
                value={selectedEdge.data?.latency ?? ''}
                onChange={(val) => handleEdgeUpdate({ latency: val || undefined })}
                placeholder="e.g. 50ms"
              />
            </div>

            {/* Throughput */}
            <div>
              <FieldLabel>Throughput</FieldLabel>
              <InputField
                value={selectedEdge.data?.throughput ?? ''}
                onChange={(val) => handleEdgeUpdate({ throughput: val || undefined })}
                placeholder="e.g. 1000 rps"
              />
            </div>

            {/* Animated */}
            <div className="flex items-center justify-between">
              <FieldLabel>Animated</FieldLabel>
              <button
                onClick={() => handleEdgeUpdate({ animated: !selectedEdge.data?.animated })}
                className={cn(
                  'w-8 h-4.5 rounded-full transition-colors relative',
                  selectedEdge.data?.animated
                    ? 'bg-cyan-500'
                    : 'bg-zinc-700'
                )}
              >
                <div
                  className={cn(
                    'absolute top-0.5 w-3.5 h-3.5 rounded-full bg-white transition-transform',
                    selectedEdge.data?.animated ? 'translate-x-4' : 'translate-x-0.5'
                  )}
                />
              </button>
            </div>

            {/* Connection */}
            <div>
              <FieldLabel>Connection</FieldLabel>
              <p className="text-[10px] font-mono text-muted-foreground px-2 py-1">
                {selectedEdge.source} → {selectedEdge.target}
              </p>
            </div>

            {/* Delete */}
            <button
              onClick={() => {
                pushSnapshot();
                removeEdge(selectedEdge.id);
                selectEdge(null);
              }}
              className="w-full flex items-center justify-center gap-1.5 mt-1 px-2 py-1.5 text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-md hover:bg-red-500/20 transition-colors"
            >
              <Trash2 size={12} />
              Delete Edge
            </button>
          </>
        )}
      </div>
    </motion.div>
      )}
    </AnimatePresence>
  );
}
