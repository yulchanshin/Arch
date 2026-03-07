import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useScrollPosition } from '@/hooks/useScrollPosition';
import { Hexagon, Menu, X } from 'lucide-react';

export function LandingNavbar() {
  const scrollY = useScrollPosition();
  const scrolled = scrollY > 50;
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <a href="/" className="flex items-center gap-2 group">
          <div className="relative">
            <Hexagon
              size={28}
              className="text-gray-900 group-hover:text-blue-600 transition-colors"
              strokeWidth={2}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400" />
            </div>
          </div>
          <span className="text-[17px] font-semibold tracking-tight text-gray-900">
            Arch
          </span>
        </a>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-8">
          <a
            href="#features"
            className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            Features
          </a>
          <a
            href="#how-it-works"
            className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            How it Works
          </a>
          <a
            href="/login"
            className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            Log in
          </a>
          <a
            href="/signup"
            className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors shadow-sm"
          >
            Get Started Free
          </a>
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden p-2 text-gray-700 hover:text-gray-900"
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-b border-gray-100 overflow-hidden"
          >
            <div className="px-6 py-4 space-y-3">
              <a
                href="#features"
                className="block text-sm text-gray-600 hover:text-gray-900 py-1"
              >
                Features
              </a>
              <a
                href="#how-it-works"
                className="block text-sm text-gray-600 hover:text-gray-900 py-1"
              >
                How it Works
              </a>
              <a
                href="/login"
                className="block text-sm text-gray-600 hover:text-gray-900 py-1"
              >
                Log in
              </a>
              <a
                href="/signup"
                className="block w-full text-center px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium"
              >
                Get Started Free
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
