import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTypewriter } from '@/hooks/useTypewriter';

// ─── Fake node data ───
const NODES = [
  {
    id: 'gw',
    label: 'API Gateway',
    type: 'gateway',
    tech: 'NGINX',
    x: 60,
    y: 100,
    delay: 0.5,
    color: '#6366f1',
    emoji: '🌐',
  },
  {
    id: 'svc',
    label: 'App Service',
    type: 'service',
    tech: 'Node.js',
    x: 300,
    y: 100,
    delay: 0.8,
    color: '#10b981',
    emoji: '⚡',
  },
  {
    id: 'db',
    label: 'Database',
    type: 'database',
    tech: 'PostgreSQL',
    x: 540,
    y: 100,
    delay: 1.1,
    color: '#3b82f6',
    emoji: '🗄️',
  },
  {
    id: 'cache',
    label: 'Redis Cache',
    type: 'cache',
    tech: 'Redis',
    x: 540,
    y: 260,
    delay: 4.0,
    color: '#ef4444',
    emoji: '⚡',
    isAiAdded: true,
  },
];

const EDGES = [
  { from: 'gw', to: 'svc', delay: 1.5 },
  { from: 'svc', to: 'db', delay: 1.8 },
  { from: 'svc', to: 'cache', delay: 4.3 },
];

// ─── Edge positions (computing from node positions) ───
function getEdgePoints(fromId: string, toId: string) {
  const from = NODES.find((n) => n.id === fromId)!;
  const to = NODES.find((n) => n.id === toId)!;
  const x1 = from.x + 155;
  const y1 = from.y + 30;
  const x2 = to.x;
  const y2 = to.y + 30;
  const cx1 = x1 + (x2 - x1) * 0.4;
  const cy1 = y1;
  const cx2 = x1 + (x2 - x1) * 0.6;
  const cy2 = y2;
  return { x1, y1, x2, y2, cx1, cy1, cx2, cy2 };
}

// ─── Fake Node Component ───
function FakeNode({
  node,
  visible,
}: {
  node: (typeof NODES)[0];
  visible: boolean;
}) {
  if (!visible) return null;
  return (
    <motion.div
      initial={{ opacity: 0, y: 25, scale: 0.85 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        type: 'spring',
        damping: 20,
        stiffness: 300,
      }}
      className="absolute w-[155px] rounded-lg bg-white border border-gray-200 shadow-sm overflow-hidden"
      style={{ left: node.x, top: node.y }}
    >
      {/* Accent bar */}
      <div className="h-[3px]" style={{ background: node.color }} />
      <div className="px-3 py-2.5 flex items-center gap-2.5">
        <div
          className="w-8 h-8 rounded-md flex items-center justify-center text-sm shrink-0"
          style={{ backgroundColor: node.color + '12' }}
        >
          {node.emoji}
        </div>
        <div className="min-w-0">
          <p className="text-[12px] font-medium text-gray-900 truncate">
            {node.label}
          </p>
          <p className="text-[10px] text-gray-500">{node.tech}</p>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Fake Edge Component ───
function FakeEdge({
  edge,
  visible,
}: {
  edge: (typeof EDGES)[0];
  visible: boolean;
}) {
  if (!visible) return null;
  const { x1, y1, x2, y2, cx1, cy1, cx2, cy2 } = getEdgePoints(
    edge.from,
    edge.to
  );
  return (
    <motion.path
      d={`M ${x1} ${y1} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${x2} ${y2}`}
      stroke="#d1d5db"
      strokeWidth={1.5}
      fill="none"
      initial={{ pathLength: 0 }}
      animate={{ pathLength: 1 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    />
  );
}

// ─── Score Gauge Component ───
function ScoreGauge({ score, visible }: { score: number; visible: boolean }) {
  if (!visible) return null;
  const circumference = 2 * Math.PI * 28;
  const filled = circumference * (score / 100);
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="absolute bottom-4 right-4 flex items-center gap-2 px-3 py-2 bg-white rounded-lg border border-gray-200 shadow-sm"
    >
      <svg width={64} height={64} className="-rotate-90">
        <circle
          cx={32}
          cy={32}
          r={28}
          fill="none"
          stroke="#f3f4f6"
          strokeWidth={4}
        />
        <motion.circle
          cx={32}
          cy={32}
          r={28}
          fill="none"
          stroke="#10b981"
          strokeWidth={4}
          strokeLinecap="round"
          initial={{ strokeDasharray: circumference, strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: circumference - filled }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
        />
      </svg>
      <div className="absolute" style={{ left: 12, top: 8, width: 64, height: 64 }}>
        <div className="w-full h-full flex items-center justify-center rotate-90">
          <motion.span
            className="text-[14px] font-bold text-gray-900"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            {score}
          </motion.span>
        </div>
      </div>
      <div>
        <p className="text-[10px] font-medium text-gray-900">Score</p>
        <p className="text-[9px] text-gray-500">Reliability</p>
      </div>
    </motion.div>
  );
}

// ─── Chat Overlay Component ───
function ChatOverlay({
  visible,
  showThinking,
  showResponse,
}: {
  visible: boolean;
  showThinking: boolean;
  showResponse: boolean;
}) {
  const chatText = useTypewriter(
    'Add a Redis cache between the service and database',
    35,
    visible ? 100 : 99999
  );

  if (!visible) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="absolute bottom-4 left-4 w-[280px] bg-white rounded-lg border border-gray-200 shadow-md overflow-hidden"
    >
      {/* Chat header */}
      <div className="px-3 py-1.5 bg-gray-50 border-b border-gray-100 flex items-center gap-1.5">
        <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
        <span className="text-[10px] font-medium text-gray-600">AI Chat</span>
      </div>

      {/* Chat input / typed text */}
      <div className="p-2.5">
        <div className="flex items-start gap-2 mb-2">
          <div className="w-5 h-5 rounded-full bg-gray-900 flex items-center justify-center shrink-0 mt-0.5">
            <span className="text-[9px] text-white font-medium">U</span>
          </div>
          <div className="text-[11px] text-gray-700 leading-relaxed">
            {chatText}
            {!showThinking && (
              <motion.span
                animate={{ opacity: [1, 0] }}
                transition={{ repeat: Infinity, duration: 0.8 }}
                className="inline-block ml-0.5 w-[6px] h-[13px] bg-blue-500"
              />
            )}
          </div>
        </div>

        {/* Thinking indicator */}
        <AnimatePresence>
          {showThinking && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="flex items-center gap-2 pl-7"
            >
              <div className="flex items-center gap-1">
                <div className="w-4 h-4 rounded-full bg-blue-50 flex items-center justify-center">
                  <span className="text-[8px]">✨</span>
                </div>
                <span className="text-[10px] text-gray-500">Thinking</span>
                <div className="flex gap-0.5 ml-1">
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      className="w-1 h-1 rounded-full bg-blue-400"
                      animate={{ scale: [0.6, 1, 0.6], opacity: [0.4, 1, 0.4] }}
                      transition={{
                        repeat: Infinity,
                        duration: 1.4,
                        delay: i * 0.16,
                      }}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* AI Response: "Adding Redis cache..." */}
        <AnimatePresence>
          {showResponse && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-start gap-2 mt-2 pl-0"
            >
              <div className="w-5 h-5 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-[9px] text-white">✦</span>
              </div>
              <p className="text-[10px] text-gray-600 leading-relaxed">
                Adding Redis cache layer with read-through caching pattern...
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

// ─── Main HeroCanvas Component ───
export function HeroCanvas() {
  const CYCLE_DURATION = 12000; // ms per full cycle
  const [phase, setPhase] = useState(0);
  const [cycle, setCycle] = useState(0);

  // Reset and restart the animation cycle
  const resetCycle = useCallback(() => {
    setPhase(0);
    setCycle((c) => c + 1);
  }, []);

  // Phase timeline
  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    const schedule = (ms: number, p: number) =>
      timers.push(setTimeout(() => setPhase(p), ms));

    // Phase 0: Canvas visible (immediate)
    schedule(500, 1); // Nodes start
    schedule(1500, 2); // Edges draw
    schedule(2000, 3); // Chat appears
    schedule(4000, 4); // Thinking indicator
    schedule(4800, 5); // AI response
    schedule(5200, 6); // Cache node + edge
    schedule(6000, 7); // Score gauge
    schedule(CYCLE_DURATION - 2000, 8); // Fade out
    timers.push(setTimeout(resetCycle, CYCLE_DURATION));

    return () => timers.forEach(clearTimeout);
  }, [cycle, resetCycle]);

  return (
    <div className="relative mx-auto max-w-4xl rounded-xl border border-gray-200 bg-white shadow-2xl shadow-gray-200/50 overflow-hidden">
      {/* Fake window chrome */}
      <div className="flex items-center gap-1.5 px-4 py-2.5 bg-gray-50 border-b border-gray-200">
        <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
        <div className="w-3 h-3 rounded-full bg-[#febc2e]" />
        <div className="w-3 h-3 rounded-full bg-[#28c840]" />
        <span className="ml-3 text-[11px] text-gray-400 font-mono">
          arch.app/project/demo
        </span>
      </div>

      {/* Canvas area */}
      <AnimatePresence mode="wait">
        <motion.div
          key={cycle}
          initial={{ opacity: 0 }}
          animate={{ opacity: phase >= 0 ? 1 : 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
          className="relative h-[380px] md:h-[420px]"
          style={{
            background: '#f8f8f8',
            backgroundImage:
              'radial-gradient(circle, #e0e0e0 1px, transparent 1px)',
            backgroundSize: '20px 20px',
          }}
        >
          {/* SVG edges layer */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            {EDGES.map((edge) => {
              const visible =
                (edge.from !== 'svc' || edge.to !== 'cache')
                  ? phase >= 2
                  : phase >= 6;
              return (
                <FakeEdge key={`${edge.from}-${edge.to}`} edge={edge} visible={visible} />
              );
            })}
          </svg>

          {/* Nodes */}
          {NODES.map((node) => {
            const visible = node.isAiAdded ? phase >= 6 : phase >= 1;
            return <FakeNode key={node.id} node={node} visible={visible} />;
          })}

          {/* Chat overlay */}
          <ChatOverlay
            visible={phase >= 3}
            showThinking={phase >= 4 && phase < 6}
            showResponse={phase >= 5}
          />

          {/* Score gauge */}
          <ScoreGauge score={85} visible={phase >= 7} />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
