import { motion } from 'framer-motion';
import { MessageSquare, GitBranch, FileDown } from 'lucide-react';
import type { ReactNode } from 'react';

interface Step {
  number: string;
  title: string;
  desc: string;
  icon: ReactNode;
  gradient: string;
}

const steps: Step[] = [
  {
    number: '01',
    title: 'Describe',
    desc: 'Tell the AI what you want to build. "Design a real-time chat system with message queues and caching."',
    icon: <MessageSquare size={22} />,
    gradient: 'from-blue-500 to-cyan-500',
  },
  {
    number: '02',
    title: 'Iterate',
    desc: 'Refine with follow-up prompts. Add components, scale services, compare versions side by side.',
    icon: <GitBranch size={22} />,
    gradient: 'from-violet-500 to-purple-500',
  },
  {
    number: '03',
    title: 'Export',
    desc: 'Generate professional PDFs with architecture diagrams, cost analysis, and security scores.',
    icon: <FileDown size={22} />,
    gradient: 'from-emerald-500 to-teal-500',
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 px-6 bg-gray-50/80">
      <div className="max-w-5xl mx-auto">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5 }}
          className="text-center mb-20"
        >
          <span className="text-sm font-medium text-blue-600 mb-3 block">
            How It Works
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Three steps to production-ready
          </h2>
          <p className="text-gray-500 max-w-md mx-auto">
            Go from a rough idea to a polished architecture diagram faster than ever.
          </p>
        </motion.div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-4 relative">
          {/* Connector lines (desktop) */}
          <div className="hidden md:block absolute top-16 left-[calc(33.33%+0.5rem)] right-[calc(33.33%+0.5rem)] h-[2px]">
            <motion.div
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="h-full bg-gradient-to-r from-blue-200 via-violet-200 to-emerald-200 origin-left"
            />
          </div>

          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ delay: index * 0.15, duration: 0.5 }}
              className="relative text-center"
            >
              {/* Number circle */}
              <div className="relative mx-auto mb-6">
                <div
                  className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${step.gradient} flex items-center justify-center text-white mx-auto shadow-lg`}
                >
                  {step.icon}
                </div>
                <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-white border-2 border-gray-100 flex items-center justify-center shadow-sm">
                  <span className="text-[11px] font-bold text-gray-600">
                    {step.number}
                  </span>
                </div>
              </div>

              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {step.title}
              </h3>
              <p className="text-sm text-gray-500 leading-relaxed max-w-[260px] mx-auto">
                {step.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
