import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronDown, ChevronRight } from 'lucide-react';
import { useStore } from '@/store';
import { cn } from '@/lib/utils';
import type { ReviewFinding } from '@/types/actions';

const CATEGORY_LABELS: Record<string, string> = {
  scalability: 'Scalability',
  reliability: 'Reliability',
  security: 'Security',
  performance: 'Performance',
  simplicity: 'Simplicity',
};

const CATEGORY_ORDER = ['scalability', 'reliability', 'security', 'performance', 'simplicity'];

function barColor(score: number): string {
  if (score >= 80) return 'bg-emerald-500';
  if (score >= 60) return 'bg-amber-500';
  return 'bg-red-500';
}

function severityBadge(severity: ReviewFinding['severity']) {
  const config = {
    critical: { bg: 'bg-red-100 text-red-700', icon: '\u{1F534}' },
    warning: { bg: 'bg-amber-100 text-amber-700', icon: '\u{1F7E1}' },
    info: { bg: 'bg-blue-100 text-blue-700', icon: '\u{1F535}' },
  };
  const c = config[severity];
  return (
    <span className={cn('inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium', c.bg)}>
      {c.icon} {severity}
    </span>
  );
}

function CategoryBar({ label, score }: { label: string; score: number }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-gray-500 w-24 shrink-0">{label}</span>
      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className={cn('h-full rounded-full', barColor(score))}
        />
      </div>
      <span className="text-xs font-mono text-gray-500 w-8 text-right">{score}</span>
    </div>
  );
}

function FindingCard({ finding }: { finding: ReviewFinding }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="border border-gray-100 rounded-lg p-2.5">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-start gap-2 w-full text-left"
      >
        {expanded ? <ChevronDown size={14} className="mt-0.5 text-gray-400 shrink-0" /> : <ChevronRight size={14} className="mt-0.5 text-gray-400 shrink-0" />}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            {severityBadge(finding.severity)}
            <span className="text-xs font-medium text-gray-700">{finding.title}</span>
          </div>
        </div>
      </button>
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="pl-6 pt-2 space-y-1.5">
              <p className="text-[11px] text-gray-500">{finding.description}</p>
              {finding.suggestion && (
                <p className="text-[11px] text-gray-600 font-medium">
                  Suggestion: {finding.suggestion}
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function ReviewPanel() {
  const review = useStore((s) => s.reviewResult);
  const reviewPanelOpen = useStore((s) => s.reviewPanelOpen);
  const setReviewPanelOpen = useStore((s) => s.setReviewPanelOpen);

  if (!review || !reviewPanelOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className={cn(
        'absolute top-16 right-4 z-20',
        'w-80 max-h-[calc(100vh-120px)]',
        'bg-white border border-gray-200 rounded-xl',
        'shadow-xl shadow-gray-200/50',
        'overflow-y-auto',
      )}
    >
      {/* Header */}
      <div className="sticky top-0 bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between rounded-t-xl">
        <h3 className="text-sm font-semibold text-gray-800">Architecture Review</h3>
        <button
          onClick={() => setReviewPanelOpen(false)}
          className="p-1 rounded-md hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X size={14} />
        </button>
      </div>

      <div className="p-4 space-y-5">
        {/* Category scores */}
        <div className="space-y-2.5">
          <h4 className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Categories</h4>
          {CATEGORY_ORDER.map((cat) => (
            <CategoryBar
              key={cat}
              label={CATEGORY_LABELS[cat] ?? cat}
              score={review.categories[cat] ?? 0}
            />
          ))}
        </div>

        {/* Cost breakdown */}
        <div className="space-y-2">
          <h4 className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
            Cost Estimate
          </h4>
          <div className="border border-gray-100 rounded-lg overflow-hidden">
            <table className="w-full text-[11px]">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-left px-2.5 py-1.5 font-medium text-gray-500">Component</th>
                  <th className="text-right px-2.5 py-1.5 font-medium text-gray-500">$/mo</th>
                </tr>
              </thead>
              <tbody>
                {review.cost_estimate.components.map((comp, i) => (
                  <tr key={i} className="border-t border-gray-50">
                    <td className="px-2.5 py-1.5 text-gray-600">
                      {comp.name}
                      {comp.tech && <span className="text-gray-400 ml-1">({comp.tech})</span>}
                    </td>
                    <td className="px-2.5 py-1.5 text-right font-mono text-gray-600">
                      ${comp.monthly_cost}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t border-gray-200 bg-gray-50">
                  <td className="px-2.5 py-1.5 font-semibold text-gray-700">Total</td>
                  <td className="px-2.5 py-1.5 text-right font-mono font-semibold text-gray-700">
                    ${review.cost_estimate.total_monthly}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Findings */}
        {review.findings.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
              Findings ({review.findings.length})
            </h4>
            <div className="space-y-1.5">
              {review.findings.map((finding, i) => (
                <FindingCard key={i} finding={finding} />
              ))}
            </div>
          </div>
        )}

        {/* Summary */}
        <div className="space-y-1.5">
          <h4 className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Summary</h4>
          <p className="text-xs text-gray-600 leading-relaxed">{review.summary}</p>
        </div>
      </div>
    </motion.div>
  );
}
