import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface TabBarProps {
  tabs: string[];
  activeTab: string;
  onChange: (tab: string) => void;
  badge?: Record<string, boolean>;
}

export function TabBar({ tabs, activeTab, onChange, badge }: TabBarProps) {
  return (
    <div className="flex items-center px-1 bg-white">
      {tabs.map((tab) => (
        <button
          key={tab}
          onClick={() => onChange(tab)}
          className={cn(
            'relative px-3 py-2.5 text-[12px] font-medium transition-colors',
            activeTab === tab
              ? 'text-gray-900'
              : 'text-gray-400 hover:text-gray-600'
          )}
        >
          <span className="relative">
            {tab}
            {badge?.[tab] && (
              <span className="absolute -top-1 -right-2 w-1.5 h-1.5 rounded-full bg-blue-500" />
            )}
          </span>
          {activeTab === tab && (
            <motion.div
              layoutId="right-panel-tab-indicator"
              className="absolute bottom-0 left-1 right-1 h-[2px] bg-gray-900 rounded-full"
              transition={{ type: 'spring', damping: 30, stiffness: 400 }}
            />
          )}
        </button>
      ))}
    </div>
  );
}
