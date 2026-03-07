import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

export function CTASection() {
  return (
    <section className="py-24 px-6 bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 text-white text-center relative overflow-hidden">
      {/* Subtle radial glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(59,130,246,0.08)_0%,_transparent_70%)] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="relative max-w-lg mx-auto"
      >
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          Ready to architect your
          <br />
          <span className="bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
            next system?
          </span>
        </h2>
        <p className="text-gray-400 mb-8 max-w-md mx-auto leading-relaxed">
          Start designing production-ready architectures with AI assistance.
          Free to use, no credit card required.
        </p>
        <a
          href="/signup"
          className="group inline-flex items-center gap-2 px-8 py-3.5 bg-white text-gray-900 rounded-xl font-semibold hover:bg-gray-100 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
        >
          Get Started Free
          <ArrowRight
            size={18}
            className="group-hover:translate-x-0.5 transition-transform"
          />
        </a>
      </motion.div>
    </section>
  );
}
