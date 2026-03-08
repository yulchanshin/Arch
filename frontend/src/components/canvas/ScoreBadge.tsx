import { motion } from 'framer-motion';
import { useStore } from '@/store';
import { cn } from '@/lib/utils';

function strokeColor(score: number): string {
  if (score >= 80) return '#10b981';
  if (score >= 60) return '#f59e0b';
  return '#ef4444';
}

export function ScoreBadge() {
  const review = useStore((s) => s.reviewResult);
  const setReviewPanelOpen = useStore((s) => s.setReviewPanelOpen);
  const reviewPanelOpen = useStore((s) => s.reviewPanelOpen);

  if (!review) return null;

  const score = review.overall_score;
  const radius = 20;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 100) * circumference;
  const cost = review.cost_estimate.total_monthly;

  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      onClick={() => setReviewPanelOpen(!reviewPanelOpen)}
      className={cn(
        'absolute top-4 right-4 z-20',
        'flex items-center gap-2.5 px-3 py-2',
        'bg-white border border-gray-200 rounded-xl',
        'shadow-lg shadow-gray-200/50',
        'hover:shadow-xl transition-shadow cursor-pointer',
      )}
    >
      <svg width="48" height="48" viewBox="0 0 48 48">
        <circle
          cx="24" cy="24" r={radius}
          fill="none" stroke="#e5e7eb" strokeWidth="3"
        />
        <circle
          cx="24" cy="24" r={radius}
          fill="none"
          stroke={strokeColor(score)}
          strokeWidth="3"
          strokeDasharray={circumference}
          strokeDashoffset={circumference - progress}
          strokeLinecap="round"
          transform="rotate(-90 24 24)"
        />
        <text
          x="24" y="25" textAnchor="middle" dominantBaseline="central"
          fill={strokeColor(score)}
          fontSize="13"
          fontWeight="700"
        >
          {score}
        </text>
      </svg>
      <div className="flex flex-col items-start">
        <span className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">Score</span>
        <span className="text-xs font-semibold text-gray-600">${cost}/mo</span>
      </div>
    </motion.button>
  );
}
