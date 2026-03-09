import { useState } from 'react';
import { Hexagon, LayoutDashboard } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useStore } from '@/store';

export function TopBar() {
  const metadata = useStore((s) => s.metadata);
  const renameGraph = useStore((s) => s.renameGraph);
  const renameProject = useStore((s) => s.renameProject);
  const currentProject = useStore((s) => s.currentProject);
  const user = useStore((s) => s.user);
  const [isEditing, setIsEditing] = useState(false);

  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || '';
  const initials = displayName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <header className="h-12 flex items-center justify-between px-4 border-b border-gray-200 bg-white shrink-0">
      {/* Left: Logo + Project Name */}
      <div className="flex items-center gap-3">
        <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <div className="relative">
            <Hexagon size={20} className="text-gray-900" strokeWidth={2} />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-1 h-1 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400" />
            </div>
          </div>
          <span className="text-sm font-semibold text-gray-900 tracking-tight">Arch</span>
        </Link>

        <div className="w-px h-5 bg-gray-200" />

        {isEditing ? (
          <input
            autoFocus
            className="bg-transparent text-sm font-medium text-gray-900 outline-none border-b border-blue-400 pb-0.5 w-48"
            defaultValue={metadata.name}
            onBlur={(e) => {
              const val = e.currentTarget.value.trim();
              if (val && val !== metadata.name) {
                renameGraph(val);
                if (currentProject) renameProject(currentProject.id, val);
              }
              setIsEditing(false);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') e.currentTarget.blur();
              if (e.key === 'Escape') setIsEditing(false);
            }}
          />
        ) : (
          <button
            onClick={() => setIsEditing(true)}
            className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors truncate max-w-[200px]"
            title="Click to rename"
          >
            {metadata.name}
          </button>
        )}
      </div>

      {/* Right: Dashboard link + user avatar */}
      <div className="flex items-center gap-2">
        <Link
          to="/dashboard"
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <LayoutDashboard size={13} />
          <span className="hidden sm:inline">Dashboard</span>
        </Link>

        {user && (
          <Link to="/dashboard">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center cursor-pointer hover:opacity-90 transition-opacity">
              <span className="text-[11px] font-semibold text-white">{initials}</span>
            </div>
          </Link>
        )}
      </div>
    </header>
  );
}
