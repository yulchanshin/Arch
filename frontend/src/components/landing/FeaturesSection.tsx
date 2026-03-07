import { motion } from 'framer-motion';
import { Sparkles, Zap, BarChart3, FileDown } from 'lucide-react';
import type { ReactNode } from 'react';

interface Feature {
  icon: ReactNode;
  title: string;
  description: string;
  gradient: string;
}

const features: Feature[] = [
  {
    icon: <Sparkles size={20} />,
    title: 'AI-Powered Generation',
    description:
      'Describe your architecture in plain English. The AI generates nodes, edges, and connections instantly.',
    gradient: 'from-blue-500 to-cyan-500',
  },
  {
    icon: <Zap size={20} />,
    title: 'Real-time Streaming',
    description:
      'Watch the AI think and build in real-time. Token-by-token streaming with visible tool execution.',
    gradient: 'from-emerald-500 to-teal-500',
  },
  {
    icon: <BarChart3 size={20} />,
    title: 'Cost & Reliability Scoring',
    description:
      'Instant scoreboard for every iteration. Cost estimates, SPOF detection, security posture analysis.',
    gradient: 'from-amber-500 to-orange-500',
  },
  {
    icon: <FileDown size={20} />,
    title: 'Professional PDF Export',
    description:
      'Export your architecture as a polished PDF with diagrams, summaries, and scoreboard results.',
    gradient: 'from-violet-500 to-purple-500',
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <span className="text-sm font-medium text-blue-600 mb-3 block">
            Features
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Everything you need to design at scale
          </h2>
          <p className="text-gray-500 max-w-lg mx-auto">
            From ideation to production-ready blueprints, Arch gives you the
            tools to iterate fast and ship with confidence.
          </p>
        </motion.div>

        {/* Feature cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="rounded-xl border border-gray-200 bg-white p-6 hover:shadow-lg hover:border-gray-300 transition-shadow cursor-default group"
            >
              <div
                className={`w-10 h-10 rounded-lg bg-gradient-to-br ${feature.gradient} flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform`}
              >
                {feature.icon}
              </div>
              <h3 className="text-[15px] font-semibold text-gray-900 mb-2">
                {feature.title}
              </h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
