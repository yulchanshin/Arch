import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MoreHorizontal, ExternalLink, Pencil, Trash2, Copy } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import type { Project, PreviewNode } from '@/types/projects';
import { cn } from '@/lib/utils';

const NODE_COLORS: Record<string, string> = {
  service: '#38bdf8',
  database: '#fbbf24',
  cache: '#34d399',
  queue: '#a78bfa',
  gateway: '#60a5fa',
  load_balancer: '#fb923c',
};

function projectBg(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const h = Math.abs(hash) % 360;
  return `linear-gradient(135deg, hsl(${h},25%,11%) 0%, hsl(${(h + 35) % 360},20%,9%) 100%)`;
}

function GraphMinimap({ nodes }: { nodes: PreviewNode[] }) {
  const W = 320, H = 128, PAD = 22;
  const NW = 26, NH = 12;
  const uid = nodes.length;

  if (!nodes.length) {
    return (
      <svg viewBox={`0 0 ${W} ${H}`} className="absolute inset-0 w-full h-full opacity-20">
        <defs>
          <pattern id="eg" width="18" height="18" patternUnits="userSpaceOnUse">
            <path d="M18 0L0 0 0 18" fill="none" stroke="white" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width={W} height={H} fill="url(#eg)" />
      </svg>
    );
  }

  const xs = nodes.map((n) => n.x);
  const ys = nodes.map((n) => n.y);
  const minX = Math.min(...xs), maxX = Math.max(...xs);
  const minY = Math.min(...ys), maxY = Math.max(...ys);
  const rangeX = maxX - minX || 120;
  const rangeY = maxY - minY || 80;
  const scale = Math.min((W - PAD * 2 - NW) / rangeX, (H - PAD * 2 - NH) / rangeY, 1.5);
  const scaledW = rangeX * scale + NW;
  const scaledH = rangeY * scale + NH;
  const offX = (W - scaledW) / 2;
  const offY = (H - scaledH) / 2;

  const px = (x: number) => offX + (x - minX) * scale;
  const py = (y: number) => offY + (y - minY) * scale;

  // Connect each node to its single nearest neighbor (deduplicated)
  const edges: [number, number][] = [];
  const seen = new Set<string>();
  nodes.forEach((a, i) => {
    let nearest = -1, nearestDist = Infinity;
    nodes.forEach((b, j) => {
      if (i === j) return;
      const d = Math.hypot(a.x - b.x, a.y - b.y);
      if (d < nearestDist) { nearestDist = d; nearest = j; }
    });
    const key = `${Math.min(i, nearest)}-${Math.max(i, nearest)}`;
    if (nearest !== -1 && !seen.has(key)) { seen.add(key); edges.push([i, nearest]); }
  });

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="absolute inset-0 w-full h-full">
      <defs>
        <pattern id={`g${uid}`} width="18" height="18" patternUnits="userSpaceOnUse">
          <path d="M18 0L0 0 0 18" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="0.5" />
        </pattern>
      </defs>
      <rect width={W} height={H} fill={`url(#g${uid})`} />

      {edges.map(([i, j]) => (
        <line
          key={`${i}-${j}`}
          x1={px(nodes[i].x) + NW / 2} y1={py(nodes[i].y) + NH / 2}
          x2={px(nodes[j].x) + NW / 2} y2={py(nodes[j].y) + NH / 2}
          stroke="rgba(255,255,255,0.12)" strokeWidth={0.8}
        />
      ))}

      {nodes.map((n, i) => {
        const color = NODE_COLORS[n.type] ?? '#94a3b8';
        return (
          <g key={i}>
            <rect x={px(n.x)} y={py(n.y)} width={NW} height={NH} rx={3}
              fill={`${color}1a`} stroke={color} strokeWidth={0.9} opacity={0.95} />
            <rect x={px(n.x)} y={py(n.y)} width={3} height={NH} rx={1.5}
              fill={color} opacity={0.8} />
          </g>
        );
      })}
    </svg>
  );
}

type Props = {
  project: Project;
  onOpen: () => void;
  onRename: (name: string) => void;
  onDelete: () => void;
  onDuplicate: () => void;
};

export function ProjectCard({ project, onOpen, onRename, onDelete, onDuplicate }: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const [nameValue, setNameValue] = useState(project.name);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (renaming) inputRef.current?.focus();
  }, [renaming]);

  const commitRename = () => {
    const trimmed = nameValue.trim();
    if (trimmed && trimmed !== project.name) onRename(trimmed);
    else setNameValue(project.name);
    setRenaming(false);
  };

  const updatedDate = project.updatedAt ? new Date(project.updatedAt) : new Date();
  const timeAgo = formatDistanceToNow(updatedDate, { addSuffix: true });

  return (
    <motion.div
      whileHover={{ y: -2, boxShadow: '0 8px 30px rgba(0,0,0,0.08)' }}
      transition={{ duration: 0.15 }}
      className="bg-white rounded-2xl border border-gray-100 shadow-sm cursor-pointer group"
      onClick={() => !menuOpen && !renaming && onOpen()}
    >
      {/* Thumbnail */}
      <div
        className="h-32 w-full relative overflow-hidden"
        style={{ background: projectBg(project.name) }}
      >
        <GraphMinimap nodes={project.previewNodes ?? []} />
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          {/* Name */}
          {renaming ? (
            <input
              ref={inputRef}
              value={nameValue}
              onChange={(e) => setNameValue(e.target.value)}
              onBlur={commitRename}
              onKeyDown={(e) => {
                if (e.key === 'Enter') commitRename();
                if (e.key === 'Escape') { setNameValue(project.name); setRenaming(false); }
              }}
              onClick={(e) => e.stopPropagation()}
              className="text-sm font-semibold text-gray-900 bg-transparent border-b border-blue-400 outline-none flex-1 pb-0.5"
            />
          ) : (
            <h3 className="text-sm font-semibold text-gray-900 truncate flex-1">{project.name}</h3>
          )}

          {/* Menu button */}
          <div className="relative shrink-0">
            <button
              onClick={(e) => { e.stopPropagation(); setMenuOpen(!menuOpen); }}
              className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            >
              <MoreHorizontal size={15} />
            </button>

            <AnimatePresence>
              {menuOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={(e) => { e.stopPropagation(); setMenuOpen(false); }} />
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -4 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -4 }}
                    transition={{ duration: 0.1 }}
                    className="absolute right-0 top-full mt-1 w-44 bg-white rounded-xl border border-gray-100 shadow-lg z-20 overflow-hidden p-1"
                  >
                    {[
                      { icon: ExternalLink, label: 'Open', action: onOpen, className: 'text-gray-600' },
                      { icon: Pencil, label: 'Rename', action: () => { setRenaming(true); setMenuOpen(false); }, className: 'text-gray-600' },
                      { icon: Copy, label: 'Duplicate', action: onDuplicate, className: 'text-gray-600' },
                      { icon: Trash2, label: 'Delete', action: onDelete, className: 'text-red-600 hover:bg-red-50' },
                    ].map(({ icon: Icon, label, action, className }) => (
                      <button
                        key={label}
                        onClick={(e) => { e.stopPropagation(); setMenuOpen(false); action(); }}
                        className={cn('w-full flex items-center gap-2.5 px-3 py-2 text-sm rounded-lg hover:bg-gray-50 transition-colors', className)}
                      >
                        <Icon size={13} />
                        {label}
                      </button>
                    ))}
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Badges */}
        <div className="flex items-center gap-2 mt-2.5">
          <span className="text-[11px] px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full">
            {project.nodeCount} {project.nodeCount === 1 ? 'node' : 'nodes'}
          </span>
          <span className="text-[11px] px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full">
            {project.iterationCount} {project.iterationCount === 1 ? 'version' : 'versions'}
          </span>
        </div>

        {/* Timestamp */}
        <p className="text-[11px] text-gray-400 mt-2">{timeAgo}</p>
      </div>
    </motion.div>
  );
}
