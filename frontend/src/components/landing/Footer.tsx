import { Hexagon, Github } from 'lucide-react';

export function Footer() {
  return (
    <footer className="py-10 bg-gray-950 text-gray-400">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <Hexagon size={18} className="text-white" />
            <span className="text-sm font-semibold text-white">Arch</span>
          </div>

          {/* Links */}
          <div className="flex items-center gap-6 text-xs">
            <a
              href="#features"
              className="hover:text-white transition-colors"
            >
              Features
            </a>
            <a
              href="#how-it-works"
              className="hover:text-white transition-colors"
            >
              How it Works
            </a>
            <span className="text-gray-600">•</span>
            <span>Built with Claude Code</span>
          </div>

          {/* Social */}
          <div className="flex gap-4">
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors"
            >
              <Github size={18} />
            </a>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-800 text-center">
          <p className="text-xs text-gray-600">
            © {new Date().getFullYear()} Arch. AI-native system design.
          </p>
        </div>
      </div>
    </footer>
  );
}
