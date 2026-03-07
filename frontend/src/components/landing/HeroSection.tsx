import { motion } from 'framer-motion';
import { ArrowRight, Play } from 'lucide-react';
import { HeroCanvas } from './HeroCanvas';

export function HeroSection() {
  return (
    <section className="relative pt-32 pb-20 px-6 overflow-hidden">
      {/* Subtle gradient blob backgrounds */}
      <div className="absolute top-20 left-1/4 w-96 h-96 bg-blue-100/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-40 right-1/4 w-80 h-80 bg-cyan-100/30 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-6xl mx-auto text-center relative">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 mb-6"
        >
          <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
          <span className="text-xs font-medium text-blue-700">
            AI-Powered System Design
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-gray-900 mb-6"
        >
          Design systems
          <br />
          <span className="bg-gradient-to-r from-blue-600 via-cyan-500 to-teal-400 bg-clip-text text-transparent">
            that scale.
          </span>
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.35 }}
          className="text-lg md:text-xl text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          AI-powered architecture diagrams — describe, iterate, export.
          <br className="hidden md:block" />
          From idea to production blueprint in minutes.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
        >
          <a
            href="/signup"
            className="group inline-flex items-center gap-2 px-7 py-3.5 bg-gray-900 text-white rounded-xl text-sm font-semibold hover:bg-gray-800 transition-all shadow-lg shadow-gray-900/20 hover:shadow-xl hover:shadow-gray-900/25 hover:-translate-y-0.5"
          >
            Get Started Free
            <ArrowRight
              size={16}
              className="group-hover:translate-x-0.5 transition-transform"
            />
          </a>
          <button className="group inline-flex items-center gap-2 px-7 py-3.5 bg-white text-gray-700 rounded-xl text-sm font-medium border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all">
            <Play
              size={14}
              className="text-gray-500 group-hover:text-blue-600 transition-colors"
            />
            Watch Demo
          </button>
        </motion.div>

        {/* Hero Canvas */}
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.6, type: 'spring', damping: 25 }}
        >
          <HeroCanvas />
        </motion.div>
      </div>
    </section>
  );
}
