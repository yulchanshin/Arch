import { useState } from 'react';
import { Hexagon } from 'lucide-react';
import { useStore } from '@/store';

export function TopBar() {
  const metadata = useStore((s) => s.metadata);
  const renameGraph = useStore((s) => s.renameGraph);
  const [isEditing, setIsEditing] = useState(false);

  return (
    <header className="h-12 flex items-center justify-between px-4 border-b border-gray-200 bg-white shrink-0">
      {/* Left: Logo + Project Name */}
      <div className="flex items-center gap-3">
        <a href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <Hexagon size={20} className="text-gray-900" strokeWidth={2} />
          <span className="text-sm font-semibold text-gray-900 tracking-tight">
            Arch
          </span>
        </a>

        <div className="w-px h-5 bg-gray-200" />

        {isEditing ? (
          <input
            autoFocus
            className="bg-transparent text-sm font-medium text-gray-900 outline-none border-b border-blue-400 pb-0.5 w-48"
            defaultValue={metadata.name}
            onBlur={(e) => {
              const val = e.currentTarget.value.trim();
              if (val && val !== metadata.name) renameGraph(val);
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
    </header>
  );
}
