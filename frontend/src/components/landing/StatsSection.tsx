import { motion } from 'framer-motion';
import { useCountUp } from '@/hooks/useCountUp';

interface StatItem {
  value: number;
  suffix: string;
  label: string;
}

const stats: StatItem[] = [
  { value: 60, suffix: '+', label: 'Technologies Supported' },
  { value: 6, suffix: '', label: 'Node Types' },
  { value: 7, suffix: '', label: 'Atomic Operations' },
  { value: 100, suffix: '%', label: 'Open Source' },
];

function StatCounter({ stat, index }: { stat: StatItem; index: number }) {
  const { count, ref } = useCountUp(stat.value, 2000);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, duration: 0.4 }}
      className="text-center"
    >
      <div className="text-4xl md:text-5xl font-bold text-gray-900 tabular-nums">
        {count}
        <span className="text-blue-500">{stat.suffix}</span>
      </div>
      <p className="text-sm text-gray-500 mt-2">{stat.label}</p>
    </motion.div>
  );
}

export function StatsSection() {
  return (
    <section className="py-20 px-6 bg-gray-50/50">
      <div className="max-w-4xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 md:gap-8">
          {stats.map((stat, index) => (
            <StatCounter key={stat.label} stat={stat} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
