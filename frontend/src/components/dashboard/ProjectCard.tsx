import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MoreHorizontal, ExternalLink, Pencil, Trash2, Copy } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import type { Project } from '@/types/projects';
import { cn } from '@/lib/utils';

function projectGradient(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const h = Math.abs(hash) % 360;
  const h2 = (h + 40) % 360;
  return `linear-gradient(135deg, hsl(${h}, 65%, 60%) 0%, hsl(${h2}, 70%, 50%) 100%)`;
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

  const timeAgo = formatDistanceToNow(new Date(project.updatedAt), { addSuffix: true });

  return (
    <motion.div
      whileHover={{ y: -2, boxShadow: '0 8px 30px rgba(0,0,0,0.08)' }}
      transition={{ duration: 0.15 }}
      className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden cursor-pointer group"
      onClick={() => !menuOpen && !renaming && onOpen()}
    >
      {/* Thumbnail */}
      <div
        className="h-32 w-full relative overflow-hidden"
        style={{ background: projectGradient(project.name) }}
      >
        {/* Decorative nodes pattern */}
        <div className="absolute inset-0 flex items-center justify-center opacity-20">
          <div className="grid grid-cols-3 gap-4">
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} className="w-3 h-3 rounded-full bg-white" />
            ))}
          </div>
        </div>
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
              className={cn(
                'p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors',
                'opacity-0 group-hover:opacity-100'
              )}
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
