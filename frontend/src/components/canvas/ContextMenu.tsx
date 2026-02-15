import { useCallback, useEffect, useRef } from 'react';
import { Trash2, Copy, Search } from 'lucide-react';
import { cn } from '@/lib/utils';

type MenuItem = {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  destructive?: boolean;
};

type Props = {
  x: number;
  y: number;
  items: MenuItem[];
  onClose: () => void;
};

export function ContextMenu({ x, y, items, onClose }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  const handleClickOutside = useCallback(
    (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    },
    [onClose]
  );

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [handleClickOutside]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div
      ref={ref}
      style={{ top: y, left: x }}
      className={cn(
        'absolute z-50 min-w-[140px]',
        'bg-surface-overlay backdrop-blur-md',
        'border border-border-default rounded-md',
        'shadow-sm py-1',
        'animate-in fade-in-0 zoom-in-95 duration-100'
      )}
    >
      {items.map((item) => (
        <button
          key={item.label}
          onClick={() => {
            item.onClick();
            onClose();
          }}
          className={cn(
            'w-full flex items-center gap-2 px-3 py-1.5 text-xs transition-colors',
            item.destructive
              ? 'text-red-400 hover:bg-red-500/10'
              : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
          )}
        >
          {item.icon}
          {item.label}
        </button>
      ))}
    </div>
  );
}

export type ContextMenuState = {
  x: number;
  y: number;
  nodeId?: string;
  edgeId?: string;
} | null;

export function useContextMenuItems(
  menu: ContextMenuState,
  actions: {
    deleteNode: (id: string) => void;
    duplicateNode: (id: string) => void;
    inspectNode: (id: string) => void;
    deleteEdge: (id: string) => void;
  }
) {
  if (!menu) return [];

  const items: MenuItem[] = [];

  if (menu.nodeId) {
    items.push(
      {
        label: 'Inspect',
        icon: <Search size={12} />,
        onClick: () => actions.inspectNode(menu.nodeId!),
      },
      {
        label: 'Duplicate',
        icon: <Copy size={12} />,
        onClick: () => actions.duplicateNode(menu.nodeId!),
      },
      {
        label: 'Delete',
        icon: <Trash2 size={12} />,
        onClick: () => actions.deleteNode(menu.nodeId!),
        destructive: true,
      }
    );
  }

  if (menu.edgeId) {
    items.push({
      label: 'Delete',
      icon: <Trash2 size={12} />,
      onClick: () => actions.deleteEdge(menu.edgeId!),
      destructive: true,
    });
  }

  return items;
}
