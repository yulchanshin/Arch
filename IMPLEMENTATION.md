# Arch — Detailed Implementation Plan

## Context

Arch is an AI-native system design whiteboard for an **internship showcase**. Current codebase (~900 lines) uses React 18 + Vite + ReactFlow + Zustand + shadcn + Tailwind on the frontend, FastAPI + Claude + Supabase on the backend. The UI needs a complete visual overhaul (Figma-style) and key features need to be added: auth, streaming AI with tool calling, dashboard/history, PDF export, and cost/reliability scoreboard.

**Keep the current tech stack** (no framework switches). Enhance, don't rewrite.

---

## Phase 0: Animated Landing Page

The landing page is a **separate route** (`/`) that unauthenticated users see. It's purely client-side (no SSR needed), built with the same Vite + React + Tailwind + Framer Motion stack. The app workspace lives at `/project/:id`, dashboard at `/dashboard`.

### 0.1 Layout & Sections

**File: `frontend/src/components/landing/LandingPage.tsx`**

```
+============================================================================+
|  NAVBAR (fixed, transparent → white on scroll)                             |
|  [Arch Logo]                          [Features] [Pricing] [Login] [CTA]   |
+============================================================================+
|                                                                            |
|  HERO SECTION (full viewport height)                                       |
|  ┌──────────────────────────────────────────────────────────────────────┐  |
|  │  Headline: "Design systems that scale."                              │  |
|  │  Subhead:  "AI-powered architecture diagrams — describe, iterate,   │  |
|  │             export. From idea to production blueprint in minutes."   │  |
|  │                                                                      │  |
|  │  [Get Started Free]  [Watch Demo →]                                  │  |
|  │                                                                      │  |
|  │  ┌──────────────────────────────────────────────┐                    │  |
|  │  │  ANIMATED CANVAS PREVIEW                     │                    │  |
|  │  │  (floating nodes animate in, edges draw,     │                    │  |
|  │  │   cursor moves, chat tokens stream)          │                    │  |
|  │  └──────────────────────────────────────────────┘                    │  |
|  └──────────────────────────────────────────────────────────────────────┘  |
|                                                                            |
|  FEATURES SECTION (scroll-triggered animations)                            |
|  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     |
|  │ AI-Powered  │  │  Real-time  │  │  Scoreboard │  │  PDF Export │     |
|  │ Generation  │  │  Streaming  │  │  Analysis   │  │  & Share    │     |
|  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘     |
|                                                                            |
|  HOW IT WORKS (3-step horizontal timeline)                                 |
|  ┌──────────┐      ┌──────────┐      ┌──────────┐                        |
|  │ 1. Desc  │ ───► │ 2. Iter  │ ───► │ 3. Export │                        |
|  │ ribe it  │      │ ate      │      │          │                        |
|  └──────────┘      └──────────┘      └──────────┘                        |
|                                                                            |
|  TECH SHOWCASE (animated logo grid of 60+ supported technologies)         |
|  [postgres] [redis] [kafka] [nginx] [go] [node] [python] ...              |
|  (infinite horizontal scroll marquee, two rows, opposite directions)       |
|                                                                            |
|  SOCIAL PROOF / STATS (counter animations)                                 |
|  "60+ Technologies"  "6 Node Types"  "Real-time AI"  "PDF Export"         |
|                                                                            |
|  CTA SECTION                                                               |
|  "Ready to architect your next system?"                                    |
|  [Get Started Free]                                                        |
|                                                                            |
|  FOOTER                                                                    |
|  [Arch Logo]  [GitHub]  [Twitter]  Built with Claude Code                  |
+============================================================================+
```

### 0.2 Animation Specifications

All animations use **Framer Motion**. No additional animation libraries needed.

#### Navbar
```tsx
// Transparent on top, solid white with shadow on scroll
const scrolled = useScrollPosition() > 50;

<motion.nav className={cn(
  "fixed top-0 inset-x-0 z-50 transition-all duration-300",
  scrolled ? "bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100" : "bg-transparent"
)}>
  <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
    <ArchLogo />
    <div className="hidden md:flex items-center gap-8">
      <NavLink href="#features">Features</NavLink>
      <NavLink href="#how-it-works">How it Works</NavLink>
      <Link to="/login" className="text-sm text-secondary hover:text-primary">Log in</Link>
      <Link to="/signup" className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium
        hover:bg-gray-800 transition-colors">
        Get Started Free
      </Link>
    </div>
  </div>
</motion.nav>
```

#### Hero — Animated Canvas Preview
The centerpiece of the landing page. A fake canvas that demonstrates the product:

```tsx
// frontend/src/components/landing/HeroCanvas.tsx

// Orchestrated animation sequence (runs on mount, loops every ~15s):
// 1. (0s)     Canvas fades in with dot grid background
// 2. (0.5s)   First node slides in from left with spring physics
// 3. (0.8s)   Second node slides in
// 4. (1.1s)   Third node slides in
// 5. (1.5s)   Edges draw between nodes (SVG path animation with strokeDashoffset)
// 6. (2.0s)   Fake cursor appears, moves to chat input
// 7. (2.5s)   Chat text types character by character: "Add Redis cache..."
// 8. (3.5s)   Thinking indicator appears (3 bouncing dots)
// 9. (4.0s)   New cache node animates in with spring
// 10. (4.3s)  New edge draws to cache node
// 11. (5.0s)  Scoreboard gauge animates from 0 to 85
// 12. (6.0s)  Hold for 3 seconds, then fade and restart

const nodes = [
  { id: 'gw', label: 'API Gateway', type: 'gateway', tech: 'nginx',
    x: 80, y: 120, delay: 0.5 },
  { id: 'svc', label: 'App Service', type: 'service', tech: 'node',
    x: 320, y: 120, delay: 0.8 },
  { id: 'db', label: 'Database', type: 'database', tech: 'postgres',
    x: 560, y: 120, delay: 1.1 },
  { id: 'cache', label: 'Redis Cache', type: 'cache', tech: 'redis',
    x: 560, y: 280, delay: 4.0 },  // Appears after "AI adds" it
];

// Each node uses:
<motion.div
  initial={{ opacity: 0, y: 30, scale: 0.8 }}
  animate={{ opacity: 1, y: 0, scale: 1 }}
  transition={{ delay: node.delay, type: 'spring', damping: 20, stiffness: 300 }}
  className="absolute w-[160px] rounded-lg bg-white border border-gray-200 shadow-sm p-3"
  style={{ left: node.x, top: node.y }}
>
  <div className="flex items-center gap-2">
    <div className="w-8 h-8 rounded-md bg-gray-50 flex items-center justify-center">
      <TechLogo tech={node.tech} size={20} />
    </div>
    <div>
      <p className="text-[12px] font-medium text-gray-900">{node.label}</p>
      <p className="text-[10px] text-gray-500">{node.type}</p>
    </div>
  </div>
</motion.div>

// Edges use SVG path animation:
<motion.path
  d={`M ${x1} ${y1} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${x2} ${y2}`}
  stroke="#d1d5db"
  strokeWidth={1.5}
  fill="none"
  initial={{ pathLength: 0 }}
  animate={{ pathLength: 1 }}
  transition={{ delay: edge.delay, duration: 0.6, ease: 'easeOut' }}
/>

// Typing animation for fake chat:
<motion.span className="text-[12px] text-gray-700">
  {displayText}  {/* useTypewriter hook, 40ms per character */}
  <motion.span animate={{ opacity: [1, 0] }} transition={{ repeat: Infinity, duration: 0.8 }}>|</motion.span>
</motion.span>
```

The hero canvas sits inside a styled container:
```tsx
<div className="relative mx-auto max-w-4xl mt-12 rounded-xl border border-gray-200 bg-white shadow-2xl overflow-hidden">
  {/* Fake window chrome */}
  <div className="flex items-center gap-1.5 px-4 py-2.5 bg-gray-50 border-b border-gray-200">
    <div className="w-3 h-3 rounded-full bg-red-400" />
    <div className="w-3 h-3 rounded-full bg-yellow-400" />
    <div className="w-3 h-3 rounded-full bg-green-400" />
    <span className="ml-3 text-[11px] text-gray-400 font-mono">arch.app/project/demo</span>
  </div>

  {/* Canvas area */}
  <div className="relative h-[420px] bg-[#f8f8f8]" style={{ backgroundImage: 'radial-gradient(#e0e0e0 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
    {/* Animated nodes, edges, chat overlay */}
    <HeroCanvasAnimation />
  </div>
</div>
```

#### Features Section — Scroll-Triggered Cards
```tsx
// frontend/src/components/landing/FeaturesSection.tsx

const features = [
  {
    icon: <Sparkles />,
    title: 'AI-Powered Generation',
    description: 'Describe your architecture in plain English. The AI generates nodes, edges, and connections instantly.',
    gradient: 'from-blue-500 to-cyan-500',
  },
  {
    icon: <Zap />,
    title: 'Real-time Streaming',
    description: 'Watch the AI think and build in real-time. Token-by-token streaming with visible tool execution.',
    gradient: 'from-emerald-500 to-teal-500',
  },
  {
    icon: <BarChart3 />,
    title: 'Cost & Reliability Scoring',
    description: 'Instant scoreboard for every iteration. Cost estimates, SPOF detection, security posture analysis.',
    gradient: 'from-amber-500 to-orange-500',
  },
  {
    icon: <FileDown />,
    title: 'Professional PDF Export',
    description: 'Export your architecture as a polished PDF with diagrams, summaries, and scoreboard results.',
    gradient: 'from-violet-500 to-purple-500',
  },
];

// Each card animates in when scrolled into view:
<motion.div
  initial={{ opacity: 0, y: 40 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true, margin: "-100px" }}
  transition={{ delay: index * 0.1, duration: 0.5 }}
  className="rounded-xl border border-gray-200 bg-white p-6 hover:shadow-lg transition-shadow"
>
  <div className={cn("w-10 h-10 rounded-lg bg-gradient-to-br flex items-center justify-center text-white mb-4", feature.gradient)}>
    {feature.icon}
  </div>
  <h3 className="text-base font-semibold text-gray-900 mb-2">{feature.title}</h3>
  <p className="text-sm text-gray-600 leading-relaxed">{feature.description}</p>
</motion.div>
```

#### How It Works — 3-Step Timeline
```tsx
// frontend/src/components/landing/HowItWorks.tsx

const steps = [
  { number: '01', title: 'Describe', desc: 'Tell the AI what you want to build. "Design a real-time chat system with message queues and caching."', icon: <MessageSquare /> },
  { number: '02', title: 'Iterate', desc: 'Refine with follow-up prompts. Add components, scale services, compare versions side by side.', icon: <GitBranch /> },
  { number: '03', title: 'Export', desc: 'Generate professional PDFs with architecture diagrams, cost analysis, and security scores.', icon: <FileDown /> },
];

// Steps connected by animated dashed lines
// Each step fades in sequentially with whileInView
// Numbers use a large gradient text style
```

#### Tech Marquee — Infinite Scroll
```tsx
// frontend/src/components/landing/TechMarquee.tsx

// Two rows of tech logos scrolling in opposite directions
// Uses CSS animation (translateX), no JS needed for the scroll itself
// Framer Motion for fade-in on scroll

<div className="overflow-hidden py-8">
  {/* Row 1: scrolls left */}
  <div className="flex gap-6 animate-marquee-left">
    {[...TECH_LOGOS, ...TECH_LOGOS].map((tech, i) => (  // Duplicate for seamless loop
      <div key={i} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-50 border border-gray-100 shrink-0">
        <TechLogo tech={tech.id} size={20} />
        <span className="text-sm text-gray-600 whitespace-nowrap">{tech.name}</span>
      </div>
    ))}
  </div>

  {/* Row 2: scrolls right */}
  <div className="flex gap-6 mt-4 animate-marquee-right">
    {/* Same pattern, different tech subset */}
  </div>
</div>

// CSS (add to index.css):
@keyframes marquee-left {
  0% { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}
@keyframes marquee-right {
  0% { transform: translateX(-50%); }
  100% { transform: translateX(0); }
}
.animate-marquee-left {
  animation: marquee-left 60s linear infinite;
}
.animate-marquee-right {
  animation: marquee-right 60s linear infinite;
}
```

#### Stats Counter Section
```tsx
// frontend/src/components/landing/StatsSection.tsx

const stats = [
  { value: 60, suffix: '+', label: 'Technologies Supported' },
  { value: 6, suffix: '', label: 'Node Types' },
  { value: 7, suffix: '', label: 'Atomic Operations' },
  { value: 100, suffix: '%', label: 'Open Source' },
];

// Each number animates from 0 to target when scrolled into view
// Use a simple counter hook:
function useCountUp(target: number, duration: number = 2000) {
  const [count, setCount] = useState(0);
  // ... animate from 0 to target over duration ms when inView
}

<motion.div
  initial={{ opacity: 0 }}
  whileInView={{ opacity: 1 }}
  viewport={{ once: true }}
>
  <span className="text-4xl font-bold text-gray-900">{count}{suffix}</span>
  <p className="text-sm text-gray-500 mt-1">{label}</p>
</motion.div>
```

#### CTA Section
```tsx
// Gradient background, centered text, large button
<section className="py-24 bg-gradient-to-br from-gray-900 to-gray-800 text-white text-center">
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
  >
    <h2 className="text-3xl font-bold mb-4">Ready to architect your next system?</h2>
    <p className="text-gray-400 mb-8 max-w-md mx-auto">
      Start designing production-ready architectures with AI assistance. Free to use.
    </p>
    <Link to="/signup"
      className="inline-flex items-center gap-2 px-8 py-3 bg-white text-gray-900 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
      Get Started Free <ArrowRight size={18} />
    </Link>
  </motion.div>
</section>
```

#### Footer
```tsx
<footer className="py-12 bg-gray-950 text-gray-400">
  <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
    <div className="flex items-center gap-2">
      <Hexagon size={18} className="text-white" />
      <span className="text-sm font-semibold text-white">Arch</span>
    </div>
    <p className="text-xs">Built with Claude Code</p>
    <div className="flex gap-4">
      <a href="#" className="hover:text-white transition-colors"><Github size={18} /></a>
    </div>
  </div>
</footer>
```

### 0.3 Custom Hooks for Landing Page

#### `frontend/src/hooks/useScrollPosition.ts` — NEW
```ts
export function useScrollPosition(): number {
  const [scrollY, setScrollY] = useState(0);
  useEffect(() => {
    const handler = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);
  return scrollY;
}
```

#### `frontend/src/hooks/useTypewriter.ts` — NEW
```ts
export function useTypewriter(text: string, speed: number = 40, delay: number = 0): string {
  const [displayText, setDisplayText] = useState('');
  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;
    let i = 0;
    const startTyping = () => {
      timeout = setInterval(() => {
        if (i < text.length) {
          setDisplayText(text.slice(0, i + 1));
          i++;
        } else {
          clearInterval(timeout);
        }
      }, speed);
    };
    const delayTimeout = setTimeout(startTyping, delay);
    return () => { clearTimeout(delayTimeout); clearInterval(timeout); };
  }, [text, speed, delay]);
  return displayText;
}
```

#### `frontend/src/hooks/useCountUp.ts` — NEW
```ts
export function useCountUp(target: number, duration: number = 2000, startOnView: boolean = true) {
  const [count, setCount] = useState(0);
  const [inView, setInView] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current || !startOnView) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) setInView(true);
    }, { threshold: 0.5 });
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [startOnView]);

  useEffect(() => {
    if (!inView) return;
    const start = performance.now();
    const step = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      setCount(Math.floor(progress * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [inView, target, duration]);

  return { count, ref };
}
```

### 0.4 Routing Update

#### `frontend/src/App.tsx` — Updated routing includes landing page:
```tsx
<Routes>
  <Route path="/" element={<LandingPage />} />
  <Route path="/login" element={<LoginPage />} />
  <Route path="/signup" element={<SignupPage />} />
  <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
  <Route path="/project/:projectId" element={<ProtectedRoute><Workspace /></ProtectedRoute>} />
</Routes>
```

### 0.5 Landing Page Files Summary

```
NEW FILES:
src/components/landing/LandingPage.tsx          Main landing page component
src/components/landing/LandingNavbar.tsx         Fixed navbar with scroll effect
src/components/landing/HeroSection.tsx           Hero text + CTA buttons
src/components/landing/HeroCanvas.tsx            Animated canvas preview (centerpiece)
src/components/landing/FeaturesSection.tsx       4-card feature grid
src/components/landing/HowItWorks.tsx            3-step timeline
src/components/landing/TechMarquee.tsx           Infinite scroll tech logos
src/components/landing/StatsSection.tsx          Animated stat counters
src/components/landing/CTASection.tsx            Bottom call-to-action
src/components/landing/Footer.tsx                Footer
src/hooks/useScrollPosition.ts                   Scroll position hook
src/hooks/useTypewriter.ts                       Typewriter text effect hook
src/hooks/useCountUp.ts                          Number counter animation hook
```

### 0.6 Design Principles for the Landing Page
- **Light mode only** (landing pages should look clean and bright)
- **Max-width 1200px** container, centered
- **Inter font** at 400/500/600 weights
- **Gray-900 for headings**, gray-600 for body text, gray-400 for muted
- **Generous whitespace**: sections have `py-24` or `py-32` padding
- **Smooth scroll** between sections: `html { scroll-behavior: smooth; }`
- **No heavy dependencies**: all animations are Framer Motion + CSS only
- **Mobile responsive**: stack to single column below `md` breakpoint
- **Performance**: lazy-load below-fold sections, use `will-change: transform` on marquee

### 0.7 Execution (insert before Step 1 in the execution order)

**Step 0: Landing Page**
1. Create all landing page components (LandingPage, Navbar, Hero, Features, etc.)
2. Create custom hooks (useScrollPosition, useTypewriter, useCountUp)
3. Add marquee CSS animations to index.css
4. Add landing route to App.tsx
5. Build the HeroCanvas animation sequence (most complex piece)
6. Add smooth scroll behavior
7. **Test**: Load `/`, verify all sections render, animations trigger on scroll, CTA links work, mobile layout works

---

## Phase 1: Complete UI Overhaul — Figma-Style Design

### 1.1 Design System — New Tailwind Theme

**File: `frontend/tailwind.config.ts` (or CSS custom properties in `index.css`)**

Replace the current zinc/glassmorphism palette with a Figma-inspired system:

```
Colors (light mode — primary):
  --bg-app:         #f5f5f5       (app background, warm gray)
  --bg-canvas:      #e8e8e8       (canvas area)
  --bg-surface:     #ffffff       (panels, cards)
  --bg-surface-hover: #fafafa
  --bg-elevated:    #ffffff       (floating menus, modals)
  --border-default: #e0e0e0
  --border-subtle:  #ebebeb
  --text-primary:   #1e1e1e
  --text-secondary: #666666
  --text-tertiary:  #999999
  --accent:         #0d99ff       (Figma blue — primary actions)
  --accent-hover:   #0b85e0
  --accent-subtle:  #0d99ff14     (accent at 8% opacity)
  --danger:         #f24822
  --success:        #14ae5c
  --warning:        #ffcd29

Colors (dark mode):
  --bg-app:         #1e1e1e
  --bg-canvas:      #2c2c2c
  --bg-surface:     #2c2c2c
  --bg-elevated:    #383838
  --border-default: #3e3e3e
  --text-primary:   #ffffff
  --text-secondary: #b3b3b3
  --accent:         #0d99ff

Typography:
  --font-sans:      'Inter', system-ui, sans-serif
  Font sizes:       11px (labels), 12px (body small), 13px (body), 14px (headings), 16px (titles)
  Font weights:     400 (regular), 500 (medium), 600 (semibold)

Spacing:
  Base unit: 4px
  Padding: 8px (tight), 12px (default), 16px (comfortable), 24px (spacious)

Shadows:
  --shadow-panel:   0 0 0 1px rgba(0,0,0,0.04), 0 2px 8px rgba(0,0,0,0.08)
  --shadow-float:   0 2px 16px rgba(0,0,0,0.12)
  --shadow-modal:   0 4px 24px rgba(0,0,0,0.16)

Border radius:
  --radius-sm: 4px   (buttons, inputs)
  --radius-md: 6px   (cards, panels)
  --radius-lg: 8px   (modals, dropdowns)
```

### 1.2 New Layout Structure

**Current layout** (`frontend/src/components/layout/Layout.tsx`):
```
[Sidebar (w-60)] [Canvas + floating Toolbar] [ChatPanel (w-96)]
```

**New layout** — Top bar + left sidebar + canvas + right panel:
```
+------------------------------------------------------------------------+
|  Logo  |  Project Name (editable)  |  [v1] [v2] [+]  |  [Share] [Avatar] |  ← TopBar
+------------------------------------------------------------------------+
|         |                                              |                  |
| Component|                                             | [Inspector]     |
| Palette  |         Canvas (ReactFlow)                  | [Chat]          |
| (icons)  |         with dot grid                       | [Scoreboard]    |
|         |                                              |   (tab group)   |
| --------|                                              |                  |
| Projects |          Toolbar (bottom-center,            |                  |
| (list)   |          horizontal strip)                  |                  |
|         |                                              |                  |
+------------------------------------------------------------------------+
```

**File changes:**

#### `frontend/src/components/layout/Layout.tsx` — REWRITE
```tsx
// New structure:
<div className="flex flex-col h-screen">
  <TopBar />                          {/* NEW: top navigation bar */}
  <div className="flex flex-1 overflow-hidden">
    <LeftSidebar />                   {/* RENAMED from Sidebar, slimmer */}
    <div className="flex-1 relative">
      <Canvas />
      {nodes.length === 0 && <EmptyState />}
      <CanvasToolbar />               {/* MOVED: bottom-center, not top */}
    </div>
    <RightPanel />                    {/* NEW: tabbed panel (Inspector/Chat/Scoreboard) */}
  </div>
</div>
```

#### NEW: `frontend/src/components/layout/TopBar.tsx`
Top navigation bar with:
- Left: Arch logo + project name (click to edit, like Figma's file name)
- Center: Iteration tabs (v1, v2, v3...) with + button to create new iteration
- Right: Share button (future), theme toggle, user avatar + dropdown (logout)
- Height: 48px
- Style: white background, bottom border, no shadow

```tsx
// Key elements:
<header className="h-12 flex items-center justify-between px-4 border-b border-border bg-surface">
  {/* Left */}
  <div className="flex items-center gap-3">
    <ArchLogo />                     {/* Hexagon icon + "Arch" text */}
    <div className="w-px h-5 bg-border" />  {/* Divider */}
    <EditableProjectName />          {/* Click to edit, blur to save */}
  </div>

  {/* Center */}
  <IterationTabs />                  {/* [v1] [v2] [+] — pill-style tabs */}

  {/* Right */}
  <div className="flex items-center gap-2">
    <ThemeToggle />
    <UserMenu />                     {/* Avatar + dropdown: Settings, Logout */}
  </div>
</header>
```

#### `frontend/src/components/layout/Sidebar.tsx` → `LeftSidebar.tsx` — REWRITE
Slimmer left panel (200px wide, collapsible to 48px):
- Component palette: icon-based grid (2 columns), not a text list
- Projects section: compact list with thumbnails
- Collapsible with smooth animation

```tsx
// Component palette renders as a 2-column icon grid:
<div className="grid grid-cols-2 gap-1 p-2">
  {NODE_TYPES.map(type => (
    <DraggableNodeItem key={type} nodeType={type} />
    // Each item: 80x64px card with icon + label, draggable
  ))}
</div>

// Projects section: scrollable list
<div className="border-t border-border">
  <SectionHeader title="Projects" action={<NewProjectButton />} />
  <ProjectList />
</div>
```

#### NEW: `frontend/src/components/layout/RightPanel.tsx`
Tabbed right panel (380px wide) combining Inspector, Chat, and Scoreboard:

```tsx
// Tab bar at top: [Inspector] [Chat] [Scoreboard]
// Active tab content fills remaining space
<div className="w-[380px] border-l border-border bg-surface flex flex-col">
  <TabBar
    tabs={['Inspector', 'Chat', 'Scoreboard']}
    activeTab={activeRightTab}
    onChange={setActiveRightTab}
    // Small badge on Chat tab when there are unread messages
  />
  <div className="flex-1 overflow-hidden">
    {activeRightTab === 'Inspector' && <InspectorPanel />}
    {activeRightTab === 'Chat' && <ChatPanel />}
    {activeRightTab === 'Scoreboard' && <ScoreboardPanel />}
  </div>
</div>
```

### 1.3 Canvas Visual Refresh

#### `frontend/src/components/canvas/Canvas.tsx` — MODIFY
- Background: subtle dot grid on light gray (`#e8e8e8` light / `#2c2c2c` dark)
- MiniMap: cleaner styling, bottom-right (moved from bottom-left)
- Snap grid: keep 25px
- Add: zoom level indicator text near minimap

#### `frontend/src/components/canvas/nodes/BaseNode.tsx` — RESTYLE
New node card design (Figma-style):
```tsx
<div className={cn(
  "w-[200px] rounded-lg bg-surface border border-border transition-all",
  "shadow-sm hover:shadow-md",
  isSelected && "ring-2 ring-accent ring-offset-1 ring-offset-canvas"
)}>
  {/* Top accent bar — thin 3px bar in the node type color */}
  <div className={cn("h-[3px] rounded-t-lg", accentBgColor)} />

  <div className="px-3 py-2.5">
    <div className="flex items-center gap-2.5">
      {/* Tech/type icon */}
      <div className="w-9 h-9 rounded-md bg-gray-50 border border-gray-100 flex items-center justify-center">
        {data.tech ? <TechLogo tech={data.tech} size={22} /> : resizeIcon(icon, 18)}
      </div>

      {/* Label + metadata */}
      <div className="min-w-0 flex-1">
        <p className="text-[13px] font-medium text-primary truncate">{data.label}</p>
        <p className="text-[11px] text-secondary truncate">
          {data.tech || data.nodeType.replace('_', ' ')}
        </p>
      </div>
    </div>

    {/* Optional metadata row */}
    {(data.replicas > 1 || data.provider) && (
      <div className="flex items-center gap-2 mt-2 pt-2 border-t border-border">
        {data.provider && <ProviderBadge provider={data.provider} />}
        {data.replicas > 1 && <span className="text-[10px] text-tertiary">{data.replicas}x</span>}
      </div>
    )}
  </div>

  <Handle type="target" position={Position.Left}
    className="!w-2 !h-2 !bg-accent !border-2 !border-surface !-left-1" />
  <Handle type="source" position={Position.Right}
    className="!w-2 !h-2 !bg-accent !border-2 !border-surface !-right-1" />
</div>
```

Connection handles: hidden by default, appear on hover (like Figma).

#### `frontend/src/components/canvas/edges/ArchEdge.tsx` — RESTYLE
- Default: 1.5px stroke, gray color
- Selected: 2px stroke, accent blue
- Label: small rounded pill on the edge midpoint
- Animated: subtle dash animation for async connections

#### `frontend/src/components/canvas/Toolbar.tsx` → `CanvasToolbar.tsx` — REWRITE
Move toolbar to bottom-center (like Figma's bottom bar):
```tsx
<div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10">
  <div className="flex items-center gap-1 px-2 py-1.5 bg-surface rounded-lg shadow-panel border border-border">
    {/* Zoom controls */}
    <ToolbarButton icon={<Minus />} onClick={zoomOut} />
    <span className="text-[11px] text-secondary w-10 text-center font-mono">{zoomPercent}%</span>
    <ToolbarButton icon={<Plus />} onClick={zoomIn} />
    <ToolbarButton icon={<Maximize2 />} onClick={fitView} tooltip="Fit to view" />

    <Divider />

    {/* History */}
    <ToolbarButton icon={<Undo2 />} onClick={undo} disabled={!canUndo()} tooltip="Undo" />
    <ToolbarButton icon={<Redo2 />} onClick={redo} disabled={!canRedo()} tooltip="Redo" />

    <Divider />

    {/* Actions */}
    <ToolbarButton icon={<Download />} onClick={handleExportPdf} tooltip="Export PDF" />
    <ToolbarButton icon={<Image />} onClick={handleExportPng} tooltip="Export PNG" />
  </div>
</div>
```

### 1.4 Chat Panel Restyle

#### `frontend/src/components/chat/ChatPanel.tsx` — RESTYLE
Now lives inside RightPanel as a tab. Remove the slide-in animation (it's always mounted).

```tsx
<div className="flex flex-col h-full">
  {/* Messages area */}
  <div className="flex-1 overflow-y-auto p-4 space-y-4">
    {messages.length === 0 && <ChatEmptyState />}
    {messages.map(msg => <ChatMessage key={msg.id} message={msg} />)}
    {isStreaming && <StreamingMessage tokens={streamTokens} />}    {/* NEW */}
    {isLoading && !isStreaming && <ThinkingIndicator />}
    {error && <ErrorCard error={error} onRetry={retryLastMessage} />}
  </div>

  {/* Input area */}
  <div className="border-t border-border p-3">
    <ChatInput />
    <div className="flex items-center justify-between mt-2">
      <ModeSelector mode={aiMode} onChange={setAiMode} />   {/* Quick/Full toggle */}
      <span className="text-[10px] text-tertiary">Shift+Enter for new line</span>
    </div>
  </div>
</div>
```

#### `frontend/src/components/chat/ChatMessage.tsx` — RESTYLE
```tsx
// User message: right-aligned, accent background
<div className="flex justify-end">
  <div className="max-w-[85%] rounded-xl rounded-br-sm bg-accent text-white px-3 py-2">
    <p className="text-[13px]">{message.content}</p>
  </div>
</div>

// Assistant message: left-aligned, subtle background
<div className="flex gap-2">
  <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center shrink-0 mt-0.5">
    <Sparkles size={12} className="text-accent" />
  </div>
  <div className="max-w-[85%]">
    <div className="rounded-xl rounded-bl-sm bg-gray-50 px-3 py-2">
      <p className="text-[13px] text-primary">{message.content}</p>
    </div>
    {/* Expandable thought process */}
    {message.thought_process && (
      <details className="mt-1">
        <summary className="text-[11px] text-tertiary cursor-pointer">Show reasoning</summary>
        <p className="text-[11px] text-secondary mt-1 pl-2 border-l-2 border-border">
          {message.thought_process}
        </p>
      </details>
    )}
  </div>
</div>
```

#### NEW: `frontend/src/components/chat/ToolCallCard.tsx`
Visual card showing tool execution during streaming:
```tsx
<div className="border border-border rounded-lg overflow-hidden">
  <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 border-b border-border">
    <Wrench size={12} className="text-secondary" />
    <span className="text-[11px] font-medium text-secondary">{toolName}</span>
    {status === 'running' && <Spinner size={10} />}
    {status === 'done' && <Check size={10} className="text-success" />}
  </div>
  {expanded && (
    <div className="px-3 py-2 text-[11px] font-mono text-secondary bg-white">
      <pre>{JSON.stringify(toolOutput, null, 2)}</pre>
    </div>
  )}
</div>
```

### 1.5 Inspector Panel Restyle

#### `frontend/src/components/inspector/InspectorPanel.tsx` — RESTYLE
Now lives inside RightPanel as a tab. Cleaner form fields:
- Section headers with subtle dividers
- Input fields: 32px height, subtle border, rounded-md
- Dropdowns: custom select with icons (keep existing LogoDropdown pattern but restyle)
- Color-coded node type indicator at top

### 1.6 New Components to Create

| File | Purpose |
|------|---------|
| `components/layout/TopBar.tsx` | Top navigation bar |
| `components/layout/LeftSidebar.tsx` | Slim left panel (replaces Sidebar) |
| `components/layout/RightPanel.tsx` | Tabbed right panel |
| `components/layout/TabBar.tsx` | Reusable tab bar component |
| `components/layout/IterationTabs.tsx` | Iteration version tabs in TopBar |
| `components/layout/UserMenu.tsx` | Avatar + dropdown menu |
| `components/auth/LoginPage.tsx` | Login form |
| `components/auth/SignupPage.tsx` | Signup form |
| `components/dashboard/Dashboard.tsx` | Project grid/list view |
| `components/dashboard/ProjectCard.tsx` | Individual project card |
| `components/chat/StreamingMessage.tsx` | Real-time token display |
| `components/chat/ToolCallCard.tsx` | Tool execution visualization |
| `components/chat/ModeSelector.tsx` | Quick/Full mode toggle |
| `components/scoreboard/ScoreboardPanel.tsx` | Cost/reliability display |

### 1.7 Routing

**New dependency**: `react-router-dom`

#### `frontend/src/App.tsx` — REWRITE
```tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/project/:projectId" element={<ProtectedRoute><Workspace /></ProtectedRoute>} />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
      </Routes>
      <Toaster position="bottom-right" />
    </BrowserRouter>
  );
}
```

#### NEW: `frontend/src/components/auth/ProtectedRoute.tsx`
```tsx
// Redirects to /login if not authenticated
// Uses Supabase auth session check
```

### 1.8 Store Changes for UI

#### `frontend/src/store/uiSlice.ts` — MODIFY
Add:
```ts
activeRightTab: 'Inspector' | 'Chat' | 'Scoreboard';
setActiveRightTab: (tab: string) => void;
// Remove: chatOpen, inspectorOpen (replaced by tab system)
// Keep: selectedNodeId, selectedEdgeId, sidebarCollapsed, theme
```

Auto-switch logic:
- When a node/edge is selected → switch to Inspector tab
- When user clicks Chat tab badge → switch to Chat tab
- Default on workspace load → Chat tab

---

## Phase 2: Auth + Dashboard

### 2.1 Supabase Auth Setup

#### `frontend/src/lib/supabase.ts` — NEW
```ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

#### `frontend/src/hooks/useAuth.ts` — NEW
```ts
// Custom hook wrapping Supabase auth:
// - session: Session | null
// - user: User | null
// - loading: boolean
// - signIn(email, password): Promise
// - signUp(email, password): Promise
// - signInWithGithub(): Promise
// - signOut(): Promise
// Listens to onAuthStateChange for real-time session updates
```

#### `frontend/.env.example` — MODIFY
Add:
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 2.2 Auth Pages

#### `frontend/src/components/auth/LoginPage.tsx` — NEW
Clean centered card layout:
```
+----------------------------------+
|           Arch Logo              |
|     Welcome back to Arch         |
|                                  |
|  [Email                       ]  |
|  [Password                    ]  |
|                                  |
|  [      Sign In (accent)      ]  |
|                                  |
|  ─── or continue with ───       |
|                                  |
|  [  GitHub  ]                    |
|                                  |
|  Don't have an account? Sign up  |
+----------------------------------+
```

#### `frontend/src/components/auth/SignupPage.tsx` — NEW
Same layout with email + password + confirm password.

### 2.3 Database Schema Changes

**SQL migration to run in Supabase SQL editor:**

```sql
-- 1. Create projects table
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL DEFAULT 'Untitled Project',
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Create iterations table
CREATE TABLE iterations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL DEFAULT 'v1',
  ordinal INT NOT NULL DEFAULT 1,
  nodes JSONB NOT NULL DEFAULT '[]'::jsonb,
  edges JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Create chat_messages table
CREATE TABLE chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  iteration_id UUID REFERENCES iterations(id) ON DELETE CASCADE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  thought_process TEXT,
  tool_calls JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Create scoreboard_snapshots table
CREATE TABLE scoreboard_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  iteration_id UUID REFERENCES iterations(id) ON DELETE CASCADE NOT NULL,
  cost JSONB NOT NULL DEFAULT '{}'::jsonb,
  reliability JSONB NOT NULL DEFAULT '{}'::jsonb,
  security JSONB NOT NULL DEFAULT '{}'::jsonb,
  overall_score NUMERIC(4,1),
  explanation TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Add RLS policies
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE iterations ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE scoreboard_snapshots ENABLE ROW LEVEL SECURITY;

-- Projects: users see only their own
CREATE POLICY "Users manage own projects"
  ON projects FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Iterations: users see iterations of their projects
CREATE POLICY "Users manage own iterations"
  ON iterations FOR ALL
  USING (project_id IN (SELECT id FROM projects WHERE user_id = auth.uid()))
  WITH CHECK (project_id IN (SELECT id FROM projects WHERE user_id = auth.uid()));

-- Chat messages: users see messages of their iterations
CREATE POLICY "Users manage own chat messages"
  ON chat_messages FOR ALL
  USING (iteration_id IN (
    SELECT i.id FROM iterations i
    JOIN projects p ON i.project_id = p.id
    WHERE p.user_id = auth.uid()
  ))
  WITH CHECK (iteration_id IN (
    SELECT i.id FROM iterations i
    JOIN projects p ON i.project_id = p.id
    WHERE p.user_id = auth.uid()
  ));

-- Scoreboard: same pattern
CREATE POLICY "Users manage own scoreboard snapshots"
  ON scoreboard_snapshots FOR ALL
  USING (iteration_id IN (
    SELECT i.id FROM iterations i
    JOIN projects p ON i.project_id = p.id
    WHERE p.user_id = auth.uid()
  ))
  WITH CHECK (iteration_id IN (
    SELECT i.id FROM iterations i
    JOIN projects p ON i.project_id = p.id
    WHERE p.user_id = auth.uid()
  ));

-- 6. Indexes
CREATE INDEX idx_projects_user_id ON projects(user_id);
CREATE INDEX idx_iterations_project_id ON iterations(project_id);
CREATE INDEX idx_chat_messages_iteration_id ON chat_messages(iteration_id);
CREATE INDEX idx_scoreboard_iteration_id ON scoreboard_snapshots(iteration_id);

-- 7. Updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER projects_updated_at BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER iterations_updated_at BEFORE UPDATE ON iterations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- 8. Drop old graphs table (after migrating data if needed)
-- DROP TABLE IF EXISTS graphs;
```

### 2.4 Backend Auth Middleware

#### `backend/app/config.py` — MODIFY
Add:
```python
SUPABASE_JWT_SECRET = os.getenv("SUPABASE_JWT_SECRET", "")
```

#### NEW: `backend/app/middleware/auth.py`
```python
import jwt
from fastapi import Request, HTTPException
from app.config import SUPABASE_JWT_SECRET

async def get_current_user(request: Request) -> str:
    """Extract and validate user_id from Supabase JWT in Authorization header."""
    auth_header = request.headers.get("Authorization", "")
    if not auth_header.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing authorization")

    token = auth_header[7:]
    try:
        payload = jwt.decode(token, SUPABASE_JWT_SECRET, algorithms=["HS256"],
                           audience="authenticated")
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token")
        return user_id
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")
```

#### `backend/app/routes/persistence.py` — REWRITE
Replace graph CRUD with project/iteration CRUD:

```python
# New endpoints:

# Projects
POST   /api/projects                    → create project
GET    /api/projects                    → list user's projects
GET    /api/projects/{id}              → get project with iterations
DELETE /api/projects/{id}              → delete project

# Iterations
POST   /api/projects/{id}/iterations    → create new iteration
GET    /api/iterations/{id}            → get iteration (nodes + edges + chat)
PUT    /api/iterations/{id}            → update iteration (save nodes/edges)
DELETE /api/iterations/{id}            → delete iteration

# Chat messages (for persistence)
POST   /api/iterations/{id}/messages    → save a chat message
GET    /api/iterations/{id}/messages    → get chat history
```

All endpoints require auth via `Depends(get_current_user)`. The Supabase client is initialized with the user's JWT so RLS policies apply automatically.

#### `backend/app/services/persistence.py` — REWRITE
Replace graph CRUD with project/iteration/chat CRUD using user-scoped Supabase queries.

Key pattern change — use user's JWT for RLS:
```python
def _get_client_for_user(access_token: str) -> Client:
    """Create a Supabase client authenticated as the user (for RLS)."""
    client = create_client(SUPABASE_URL, SUPABASE_KEY)
    client.auth.set_session(access_token, "")  # or use postgrest token header
    return client
```

### 2.5 Dashboard

#### NEW: `frontend/src/components/dashboard/Dashboard.tsx`
```tsx
// Full-page view with:
// - Header: "Your Projects" + [New Project] button
// - Grid of ProjectCard components (3 columns on desktop)
// - Empty state if no projects
// - Search/filter bar (optional, simple text filter)
```

#### NEW: `frontend/src/components/dashboard/ProjectCard.tsx`
```tsx
// Card showing:
// - Project name (editable on click)
// - Last modified timestamp
// - Node count + iteration count badges
// - Thumbnail: small canvas preview (optional v1, placeholder colored square for now)
// - Actions: [...] menu with Rename, Delete
// - Click → navigate to /project/:id
```

### 2.6 Frontend API Client Updates

#### `frontend/src/lib/api.ts` — REWRITE
Add auth headers to all requests + new endpoints:

```ts
import { supabase } from './supabase';

async function authHeaders(): Promise<HeadersInit> {
  const { data: { session } } = await supabase.auth.getSession();
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${session?.access_token}`,
  };
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = await authHeaders();
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: { ...headers, ...options.headers },
  });
  // ... error handling (keep existing 429 handling)
  return res.json();
}

// Projects API
export async function createProject(name: string): Promise<Project> { ... }
export async function listProjects(): Promise<Project[]> { ... }
export async function getProject(id: string): Promise<ProjectDetail> { ... }
export async function deleteProject(id: string): Promise<void> { ... }

// Iterations API
export async function createIteration(projectId: string, name: string): Promise<Iteration> { ... }
export async function getIteration(id: string): Promise<IterationDetail> { ... }
export async function saveIteration(id: string, nodes: AppNode[], edges: AppEdge[]): Promise<void> { ... }

// Chat API
export async function saveChatMessage(iterationId: string, msg: ChatMessage): Promise<void> { ... }
export async function getChatHistory(iterationId: string): Promise<ChatMessage[]> { ... }

// AI API (existing, updated with auth)
export async function generateGraph(prompt: string): Promise<AIResponse> { ... }
export async function modifyGraph(...): Promise<AIResponse> { ... }
```

### 2.7 Store Updates for Auth + Projects

#### NEW: `frontend/src/store/authSlice.ts`
```ts
export type AuthSlice = {
  user: User | null;
  session: Session | null;
  authLoading: boolean;
  setUser: (user: User | null) => void;
  setSession: (session: Session | null) => void;
};
```

#### NEW: `frontend/src/store/projectSlice.ts`
```ts
export type ProjectSlice = {
  projects: Project[];
  currentProject: ProjectDetail | null;
  currentIteration: IterationDetail | null;
  fetchProjects: () => Promise<void>;
  createProject: (name: string) => Promise<string>;
  loadProject: (id: string) => Promise<void>;
  loadIteration: (id: string) => Promise<void>;
  createIteration: (name: string) => Promise<void>;
  saveCurrentIteration: () => Promise<void>;
};
```

#### `frontend/src/store/index.ts` — MODIFY
Add new slices:
```ts
export type AppStore = GraphSlice & UISlice & HistorySlice & ChatSlice & AuthSlice & ProjectSlice;
```

---

## Phase 3: Streaming AI + Tool Calling + Provider Abstraction

### 3.1 LLM Provider Abstraction

#### NEW: `backend/app/services/providers/__init__.py`
#### NEW: `backend/app/services/providers/base.py`
```python
from abc import ABC, abstractmethod
from typing import AsyncIterator
from app.models.actions import AIResponse

class StreamEvent:
    """Base class for stream events."""
    pass

class TokenEvent(StreamEvent):
    def __init__(self, token: str):
        self.token = token

class ToolCallStartEvent(StreamEvent):
    def __init__(self, tool_name: str, tool_input: dict):
        self.tool_name = tool_name
        self.tool_input = tool_input

class ToolCallEndEvent(StreamEvent):
    def __init__(self, tool_name: str, tool_output: dict):
        self.tool_name = tool_name
        self.tool_output = tool_output

class DoneEvent(StreamEvent):
    def __init__(self, response: AIResponse):
        self.response = response

class LLMProvider(ABC):
    @abstractmethod
    async def generate(self, system: str, user_content: str) -> AIResponse:
        """Non-streaming generation. Returns complete AIResponse."""
        ...

    @abstractmethod
    async def stream(self, system: str, user_content: str) -> AsyncIterator[StreamEvent]:
        """Streaming generation. Yields StreamEvents."""
        ...
```

#### NEW: `backend/app/services/providers/anthropic_provider.py`
```python
class AnthropicProvider(LLMProvider):
    def __init__(self, api_key: str, model: str):
        self.client = AsyncAnthropic(api_key=api_key)
        self.model = model

    async def generate(self, system: str, user_content: str) -> AIResponse:
        # Existing _call_anthropic logic from llm.py
        response = await self.client.messages.create(
            model=self.model,
            system=system,
            messages=[{"role": "user", "content": user_content}],
            temperature=0.3,
            max_tokens=4096,
        )
        text = response.content[0].text
        # ... parse JSON, validate with Pydantic
        return AIResponse.model_validate(parsed)

    async def stream(self, system: str, user_content: str) -> AsyncIterator[StreamEvent]:
        async with self.client.messages.stream(
            model=self.model,
            system=system,
            messages=[{"role": "user", "content": user_content}],
            temperature=0.3,
            max_tokens=4096,
        ) as stream:
            full_text = ""
            async for text in stream.text_stream:
                full_text += text
                yield TokenEvent(token=text)

            # Parse completed text
            parsed = json.loads(strip_markdown_fences(full_text))
            yield DoneEvent(response=AIResponse.model_validate(parsed))
```

#### NEW: `backend/app/services/providers/gemini_provider.py`
```python
import google.generativeai as genai

class GeminiProvider(LLMProvider):
    def __init__(self, api_key: str, model: str = "gemini-2.0-flash"):
        genai.configure(api_key=api_key)
        self.model = genai.GenerativeModel(model, system_instruction=None)

    async def generate(self, system: str, user_content: str) -> AIResponse:
        model = genai.GenerativeModel(self.model_name, system_instruction=system)
        response = await model.generate_content_async(user_content)
        # Parse response.text → AIResponse
        ...

    async def stream(self, system: str, user_content: str) -> AsyncIterator[StreamEvent]:
        model = genai.GenerativeModel(self.model_name, system_instruction=system)
        response = await model.generate_content_async(user_content, stream=True)
        full_text = ""
        async for chunk in response:
            if chunk.text:
                full_text += chunk.text
                yield TokenEvent(token=chunk.text)
        yield DoneEvent(response=AIResponse.model_validate(json.loads(full_text)))
```

#### `backend/app/services/llm.py` — REWRITE
```python
from app.services.providers.base import LLMProvider, StreamEvent
from app.services.providers.anthropic_provider import AnthropicProvider
from app.services.providers.gemini_provider import GeminiProvider

def _create_provider() -> LLMProvider | None:
    """Create LLM provider based on environment configuration."""
    provider_name = os.getenv("LLM_PROVIDER", "anthropic")  # "anthropic" or "gemini"

    if provider_name == "gemini":
        api_key = os.getenv("GEMINI_API_KEY", "")
        if not api_key:
            return None
        return GeminiProvider(api_key=api_key)
    else:
        api_key = os.getenv("ANTHROPIC_API_KEY", "")
        if not api_key:
            return None
        model = os.getenv("ANTHROPIC_MODEL", "claude-haiku-4-5-20251001")
        return AnthropicProvider(api_key=api_key, model=model)

provider = _create_provider()

# Keep: SYSTEM_PROMPT, _DEMO_RESPONSE, _build_generate_prompt, _build_modify_prompt
# Update: call_llm_generate, call_llm_modify to use provider.generate()
# Add: stream_llm_generate, stream_llm_modify using provider.stream()

async def call_llm_generate(prompt: str) -> AIResponse:
    if not provider:
        return _DEMO_RESPONSE
    user_content = _build_generate_prompt(prompt)
    return await provider.generate(SYSTEM_PROMPT, user_content)

async def stream_llm_generate(prompt: str) -> AsyncIterator[StreamEvent]:
    if not provider:
        yield DoneEvent(response=_DEMO_RESPONSE)
        return
    user_content = _build_generate_prompt(prompt)
    async for event in provider.stream(SYSTEM_PROMPT, user_content):
        yield event
```

#### `backend/app/config.py` — MODIFY
Add:
```python
LLM_PROVIDER = os.getenv("LLM_PROVIDER", "anthropic")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
SUPABASE_JWT_SECRET = os.getenv("SUPABASE_JWT_SECRET", "")
```

### 3.2 SSE Streaming Endpoints

#### `backend/app/routes/graph.py` — MODIFY
Add streaming endpoints alongside existing non-streaming ones:

```python
from fastapi.responses import StreamingResponse
import json

@router.post("/generate/stream")
@limiter.limit("10/minute")
async def generate_stream(request: Request, req: GenerateRequest):
    async def event_generator():
        try:
            async for event in stream_llm_generate(req.prompt):
                if isinstance(event, TokenEvent):
                    yield f"data: {json.dumps({'type': 'token', 'token': event.token})}\n\n"
                elif isinstance(event, ToolCallStartEvent):
                    yield f"data: {json.dumps({'type': 'tool_start', 'name': event.tool_name, 'input': event.tool_input})}\n\n"
                elif isinstance(event, ToolCallEndEvent):
                    yield f"data: {json.dumps({'type': 'tool_end', 'name': event.tool_name, 'output': event.tool_output})}\n\n"
                elif isinstance(event, DoneEvent):
                    validated = validate_actions(event.response, current_graph=None)
                    yield f"data: {json.dumps({'type': 'done', 'response': validated.model_dump(by_alias=True)})}\n\n"
        except Exception as e:
            yield f"data: {json.dumps({'type': 'error', 'message': str(e)})}\n\n"

    return StreamingResponse(event_generator(), media_type="text/event-stream")

@router.post("/modify/stream")
@limiter.limit("15/minute")
async def modify_stream(request: Request, req: ModifyRequest):
    # Same pattern, using stream_llm_modify
    ...
```

### 3.3 Frontend Streaming Support

#### `frontend/src/lib/api.ts` — ADD streaming functions
```ts
type StreamEvent =
  | { type: 'token'; token: string }
  | { type: 'tool_start'; name: string; input: Record<string, unknown> }
  | { type: 'tool_end'; name: string; output: Record<string, unknown> }
  | { type: 'done'; response: AIResponse }
  | { type: 'error'; message: string };

export async function* streamGenerate(prompt: string): AsyncGenerator<StreamEvent> {
  const headers = await authHeaders();
  const res = await fetch(`${API_BASE_URL}/api/generate/stream`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ prompt }),
  });

  if (!res.ok) throw new Error(`Request failed (${res.status})`);

  const reader = res.body!.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n\n');
    buffer = lines.pop()!;  // Keep incomplete chunk

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const data = JSON.parse(line.slice(6));
        yield data as StreamEvent;
      }
    }
  }
}

// Same for streamModify
```

#### `frontend/src/store/chatSlice.ts` — MODIFY
Add streaming state and logic:

```ts
export type ChatSlice = {
  // Existing
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
  lastFailedPrompt: string | null;
  _pendingFitView: boolean;

  // New streaming state
  isStreaming: boolean;
  streamTokens: string;             // Accumulated tokens during streaming
  activeToolCalls: ToolCallState[];  // Currently executing tools

  // Existing methods
  sendMessage: (prompt: string) => Promise<void>;
  retryLastMessage: () => Promise<void>;
  clearMessages: () => void;
  clearError: () => void;
  consumeFitView: () => boolean;

  // New
  sendStreamingMessage: (prompt: string) => Promise<void>;
};

// The sendStreamingMessage implementation:
sendStreamingMessage: async (prompt) => {
  // 1. Add user message to messages[]
  // 2. Set isStreaming = true, streamTokens = ''
  // 3. Call streamGenerate or streamModify
  // 4. For each event:
  //    - token: append to streamTokens
  //    - tool_start: add to activeToolCalls
  //    - tool_end: update activeToolCalls entry
  //    - done: apply patch, create assistant message, clear streaming state
  //    - error: set error state
  // 5. Set isStreaming = false
}
```

### 3.4 Tool Calling (Future-Ready)

Tools are defined as Pydantic models on the backend. For v1, the AI generates a complete JSON response including actions. For the showcase, we visualize the "thinking" and "action generation" steps as tool calls in the UI even though they're part of the response parsing.

#### NEW: `backend/app/services/tools.py`
```python
# Tool definitions for the AI agent (used in system prompt and for validation)
TOOLS = {
    "analyze_architecture": {
        "description": "Analyze the current architecture for issues",
        "parameters": {"focus": "cost|reliability|security|all"}
    },
    "suggest_improvements": {
        "description": "Suggest improvements to the architecture",
        "parameters": {"area": "string", "constraints": "optional string"}
    },
    "compute_scoreboard": {
        "description": "Calculate cost, reliability, and security scores",
        "parameters": {"iteration_id": "string"}
    },
}
```

### 3.5 Backend Dependencies Update

#### `backend/requirements.txt` — MODIFY
Add:
```
google-generativeai>=0.8.0
PyJWT>=2.8.0
```

---

## Phase 4: Scoreboard + PDF Export

### 4.1 Scoreboard

#### NEW: `backend/app/services/scoreboard.py`
```python
from pydantic import BaseModel

class CostEstimate(BaseModel):
    compute_monthly: float
    database_monthly: float
    cache_monthly: float
    queue_monthly: float
    cdn_monthly: float
    total_monthly: float
    assumptions: list[str]  # e.g., "t3.medium for each service"

class ReliabilityScore(BaseModel):
    score: float  # 0-100
    spof_count: int  # Single points of failure
    has_redundancy: bool
    has_rate_limiting: bool
    has_health_checks: bool
    has_circuit_breaker: bool
    issues: list[str]

class SecurityScore(BaseModel):
    score: float  # 0-100
    has_gateway: bool
    has_auth: bool
    has_encryption: bool
    issues: list[str]

class ScoreboardResult(BaseModel):
    cost: CostEstimate
    reliability: ReliabilityScore
    security: SecurityScore
    overall_score: float  # Weighted average
    top_improvements: list[str]  # Top 5 actionable suggestions

def compute_scoreboard(nodes: list, edges: list) -> ScoreboardResult:
    """Compute scoreboard from canvas state using heuristic rules."""
    # Cost: estimate based on node types and counts
    # Reliability: check for SPOFs, redundancy (replicas > 1), etc.
    # Security: check for gateway, auth nodes, etc.
    # This is rule-based, not AI-based (fast, deterministic)
    ...
```

The scoreboard uses **heuristic rules**, not AI, for speed and determinism:
- **Cost**: Map each node type to a baseline monthly cost (e.g., service → $20, database → $50, cache → $15). Multiply by replicas.
- **Reliability**: Check for SPOFs (services with replicas=1), missing load balancers, missing caches, no queue (async processing).
- **Security**: Check for gateway presence, auth service, encryption (edge protocols).

#### NEW: `backend/app/routes/scoreboard.py`
```python
@router.post("/api/iterations/{iteration_id}/scoreboard")
async def compute(request: Request, iteration_id: str):
    # 1. Load iteration nodes/edges
    # 2. Compute scoreboard
    # 3. Save snapshot to scoreboard_snapshots table
    # 4. Return result
    ...

@router.get("/api/iterations/{iteration_id}/scoreboard")
async def get_latest(request: Request, iteration_id: str):
    # Return most recent scoreboard snapshot
    ...
```

#### NEW: `frontend/src/components/scoreboard/ScoreboardPanel.tsx`
Lives in the RightPanel as a tab:
```tsx
<div className="p-4 space-y-4">
  {/* Overall score gauge */}
  <div className="text-center">
    <CircularGauge score={scoreboard.overall_score} />
    <p className="text-sm text-secondary mt-1">Overall Score</p>
  </div>

  {/* Breakdown bars */}
  <ScoreBar label="Cost Efficiency" score={...} color="emerald" />
  <ScoreBar label="Reliability" score={scoreboard.reliability.score} color="blue" />
  <ScoreBar label="Security" score={scoreboard.security.score} color="amber" />

  {/* Cost estimate */}
  <Section title="Estimated Monthly Cost">
    <p className="text-2xl font-semibold">${scoreboard.cost.total_monthly}/mo</p>
    <CostBreakdown costs={scoreboard.cost} />
  </Section>

  {/* Top improvements */}
  <Section title="Top Improvements">
    {scoreboard.top_improvements.map((item, i) => (
      <ImprovementItem key={i} text={item} index={i + 1} />
    ))}
  </Section>

  {/* Compute button */}
  <button onClick={computeScoreboard} className="w-full btn-accent">
    {isComputing ? <Spinner /> : 'Compute Scoreboard'}
  </button>
</div>
```

### 4.2 PDF Export

#### `frontend/src/lib/exportPdf.ts` — NEW
```ts
import { toPng } from 'html-to-image';
import { jsPDF } from 'jspdf';

export async function downloadPdf(options: {
  projectName: string;
  iterationName: string;
  nodes: AppNode[];
  edges: AppEdge[];
  scoreboard?: ScoreboardResult;
}): Promise<void> {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

  // --- Page 1: Cover ---
  doc.setFontSize(32);
  doc.text(options.projectName, 148, 80, { align: 'center' });
  doc.setFontSize(16);
  doc.text(options.iterationName, 148, 100, { align: 'center' });
  doc.setFontSize(11);
  doc.setTextColor(128);
  doc.text(`Generated ${new Date().toLocaleDateString()}`, 148, 115, { align: 'center' });
  doc.text('Powered by Arch', 148, 125, { align: 'center' });

  // --- Page 2: Canvas Diagram ---
  doc.addPage();
  const viewport = document.querySelector('.react-flow__viewport') as HTMLElement;
  if (viewport) {
    const dataUrl = await toPng(viewport, {
      quality: 0.95,
      pixelRatio: 2,
      filter: (node) => {
        if (node instanceof HTMLElement && (node.dataset.toolbar !== undefined || node.dataset.panel !== undefined)) {
          return false;
        }
        return true;
      },
    });
    // Calculate dimensions to fit A4 landscape with margins
    const imgWidth = 277;  // A4 landscape width - margins
    const imgHeight = 170; // Maintain aspect ratio
    doc.addImage(dataUrl, 'PNG', 10, 15, imgWidth, imgHeight);
  }

  // --- Page 3: Architecture Summary ---
  doc.addPage('portrait');
  doc.setFontSize(18);
  doc.setTextColor(0);
  doc.text('Architecture Summary', 15, 20);

  // Components table
  doc.setFontSize(12);
  doc.text('Components', 15, 35);
  let y = 42;
  doc.setFontSize(9);
  for (const node of options.nodes) {
    doc.text(`${node.data.label} (${node.data.nodeType}${node.data.tech ? ` — ${node.data.tech}` : ''})`, 20, y);
    y += 6;
  }

  // Connections table
  y += 10;
  doc.setFontSize(12);
  doc.text('Connections', 15, y);
  y += 7;
  doc.setFontSize(9);
  for (const edge of options.edges) {
    const source = options.nodes.find(n => n.id === edge.source)?.data.label || edge.source;
    const target = options.nodes.find(n => n.id === edge.target)?.data.label || edge.target;
    doc.text(`${source} → ${target}${edge.data?.protocol ? ` (${edge.data.protocol})` : ''}`, 20, y);
    y += 6;
  }

  // --- Page 4: Scoreboard (if available) ---
  if (options.scoreboard) {
    doc.addPage('portrait');
    doc.setFontSize(18);
    doc.text('Scoreboard', 15, 20);
    // ... render cost, reliability, security scores
  }

  doc.save(`${options.projectName}_${options.iterationName}.pdf`);
}
```

#### `frontend/src/components/canvas/CanvasToolbar.tsx` — MODIFY
Add PDF export button alongside PNG export. Wire to `downloadPdf()`.

### 4.3 Frontend Dependencies

#### `frontend/package.json` — ADD
```json
{
  "dependencies": {
    "react-router-dom": "^7.0.0",
    "@supabase/supabase-js": "^2.45.0",
    "jspdf": "^2.5.2"
  }
}
```

---

## Phase 5: Polish + Demo Readiness

### 5.1 Template Architectures

#### NEW: `frontend/src/lib/templates.ts`
```ts
export type Template = {
  id: string;
  name: string;
  description: string;
  icon: string;  // Lucide icon name
  nodes: AppNode[];
  edges: AppEdge[];
};

export const TEMPLATES: Template[] = [
  {
    id: 'microservices',
    name: 'Microservices Starter',
    description: 'API gateway + 3 services + Postgres + Redis',
    icon: 'Boxes',
    nodes: [
      // Pre-defined node layout
      { id: 'node_gateway_api_01', type: 'gateway', position: { x: 0, y: 200 }, data: { label: 'API Gateway', nodeType: 'gateway', tech: 'nginx' } },
      { id: 'node_service_users_01', type: 'service', position: { x: 400, y: 100 }, data: { label: 'Users Service', nodeType: 'service', tech: 'node' } },
      // ... more nodes
    ],
    edges: [/* ... */],
  },
  {
    id: 'event-driven',
    name: 'Event-Driven Pipeline',
    description: 'Producers + Kafka + Consumers + Analytics DB',
    icon: 'Workflow',
    nodes: [/* ... */],
    edges: [/* ... */],
  },
  {
    id: 'ml-serving',
    name: 'ML Serving Stack',
    description: 'API + Model Server + Feature Store + Monitoring',
    icon: 'Brain',
    nodes: [/* ... */],
    edges: [/* ... */],
  },
];
```

Templates are shown in:
1. Dashboard "New Project" flow — pick a template or start blank
2. Empty canvas state — template suggestions

### 5.2 Empty State Improvement

#### `frontend/src/components/canvas/EmptyState.tsx` — REWRITE
```tsx
<div className="absolute inset-0 flex items-center justify-center pointer-events-none">
  <div className="pointer-events-auto max-w-md text-center">
    <Hexagon className="w-12 h-12 text-accent mx-auto mb-4" />
    <h2 className="text-lg font-semibold text-primary mb-2">
      Start designing your architecture
    </h2>
    <p className="text-sm text-secondary mb-6">
      Describe your system in the chat, drag components from the sidebar,
      or start from a template.
    </p>

    {/* Template quick-start buttons */}
    <div className="flex flex-wrap gap-2 justify-center">
      {TEMPLATES.map(t => (
        <button key={t.id}
          onClick={() => applyTemplate(t)}
          className="px-3 py-1.5 text-[12px] rounded-md border border-border hover:bg-gray-50 text-secondary hover:text-primary transition">
          {t.name}
        </button>
      ))}
    </div>
  </div>
</div>
```

### 5.3 Keyboard Shortcuts Help Modal

#### NEW: `frontend/src/components/shared/ShortcutsModal.tsx`
Triggered by `?` key. Shows all shortcuts in a clean modal.

---

## Files Summary — Complete Change List

### Frontend — NEW Files (30 files)
```
# Landing Page (13 files)
src/components/landing/LandingPage.tsx        Main landing page
src/components/landing/LandingNavbar.tsx       Fixed navbar with scroll effect
src/components/landing/HeroSection.tsx         Hero text + CTA buttons
src/components/landing/HeroCanvas.tsx          Animated canvas demo (centerpiece)
src/components/landing/FeaturesSection.tsx     4-card feature grid
src/components/landing/HowItWorks.tsx          3-step timeline
src/components/landing/TechMarquee.tsx         Infinite scroll tech logos
src/components/landing/StatsSection.tsx        Animated stat counters
src/components/landing/CTASection.tsx          Bottom call-to-action
src/components/landing/Footer.tsx             Footer
src/hooks/useScrollPosition.ts                Scroll position hook
src/hooks/useTypewriter.ts                    Typewriter text effect hook
src/hooks/useCountUp.ts                       Number counter animation hook

# App (17 files)
src/lib/supabase.ts                          Supabase client initialization
src/lib/exportPdf.ts                         PDF export logic
src/lib/templates.ts                         Template architecture definitions
src/hooks/useAuth.ts                         Auth hook wrapping Supabase
src/store/authSlice.ts                       Auth state slice
src/store/projectSlice.ts                    Project/iteration state slice
src/components/layout/TopBar.tsx             Top navigation bar
src/components/layout/LeftSidebar.tsx         Slim left panel
src/components/layout/RightPanel.tsx          Tabbed right panel
src/components/layout/TabBar.tsx             Reusable tab bar
src/components/layout/IterationTabs.tsx       Version tabs in TopBar
src/components/layout/UserMenu.tsx           Avatar + dropdown menu
src/components/auth/LoginPage.tsx            Login form
src/components/auth/SignupPage.tsx            Signup form
src/components/auth/ProtectedRoute.tsx        Auth guard wrapper
src/components/dashboard/Dashboard.tsx        Project grid view
src/components/dashboard/ProjectCard.tsx      Individual project card
src/components/chat/StreamingMessage.tsx       Real-time token display
src/components/chat/ToolCallCard.tsx           Tool execution card
src/components/chat/ModeSelector.tsx           Quick/Full mode toggle
src/components/scoreboard/ScoreboardPanel.tsx  Cost/reliability display
src/components/shared/ShortcutsModal.tsx       Keyboard shortcuts help
```

### Frontend — MODIFIED Files (14 files)
```
src/App.tsx                                   Add routing (BrowserRouter)
src/store/index.ts                            Add authSlice, projectSlice
src/store/uiSlice.ts                          Add activeRightTab, remove chatOpen/inspectorOpen
src/store/chatSlice.ts                        Add streaming state + sendStreamingMessage
src/store/graphSlice.ts                       Update persistence to use iterations API
src/lib/api.ts                                Add auth headers + new endpoints + streaming
src/lib/constants.ts                          Add Supabase env vars
src/components/layout/Layout.tsx              New layout structure (TopBar + panels)
src/components/canvas/Canvas.tsx              Restyle (background, minimap position)
src/components/canvas/Toolbar.tsx             Move to bottom, rename CanvasToolbar
src/components/canvas/nodes/BaseNode.tsx      New card design
src/components/canvas/edges/ArchEdge.tsx      Restyle
src/components/canvas/EmptyState.tsx          Add templates
src/components/chat/ChatPanel.tsx             Restyle, remove slide animation, add streaming
src/components/chat/ChatMessage.tsx           Restyle (bubbles, expandable thought)
src/components/inspector/InspectorPanel.tsx   Restyle (cleaner form fields)
```

### Frontend — DELETE Files
```
src/components/layout/Sidebar.tsx             Replaced by LeftSidebar.tsx
src/components/layout/GraphListPanel.tsx       Replaced by Dashboard
```

### Backend — NEW Files (6 files)
```
app/middleware/auth.py                         JWT validation
app/services/providers/__init__.py
app/services/providers/base.py                LLM provider protocol
app/services/providers/anthropic_provider.py   Anthropic implementation
app/services/providers/gemini_provider.py      Gemini implementation
app/services/scoreboard.py                     Scoreboard computation
app/services/tools.py                          Tool definitions
app/routes/scoreboard.py                       Scoreboard endpoints
```

### Backend — MODIFIED Files (5 files)
```
app/config.py                                 Add LLM_PROVIDER, GEMINI_API_KEY, SUPABASE_JWT_SECRET
app/main.py                                   Add auth middleware, scoreboard router
app/services/llm.py                           Refactor to use provider abstraction + streaming
app/routes/graph.py                           Add streaming endpoints
app/routes/persistence.py                     Rewrite for project/iteration/chat CRUD
app/services/persistence.py                   Rewrite for new schema with user-scoped queries
```

### Backend — KEEP UNCHANGED (4 files)
```
app/models/graph.py                           Tech normalization + validation (solid)
app/models/actions.py                         Discriminated union patch protocol (solid)
app/services/validator.py                     Reference integrity + collision detection (solid)
app/middleware/rate_limit.py                   Rate limiting (solid)
app/middleware/errors.py                       Error handling (solid)
```

### Backend — MODIFY
```
app/models/api.py                             Add streaming event types
app/models/persistence.py                     Replace Graph models with Project/Iteration models
```

---

## Environment Variables (Final)

### Backend (`backend/.env`)
```
# LLM Provider (choose one)
LLM_PROVIDER=anthropic                         # "anthropic" or "gemini"
ANTHROPIC_API_KEY=sk-...
ANTHROPIC_MODEL=claude-haiku-4-5-20251001
GEMINI_API_KEY=                                # Optional: Gemini API key

# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-key
SUPABASE_JWT_SECRET=your-jwt-secret            # For verifying user JWTs

# Server
CORS_ORIGINS=http://localhost:5173
```

### Frontend (`frontend/.env`)
```
VITE_API_URL=http://localhost:8000
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

---

## Execution Order (Step-by-Step)

### Step 0: Landing Page
1. Create all landing page components (LandingPage, Navbar, Hero, Features, HowItWorks, TechMarquee, Stats, CTA, Footer)
2. Create custom hooks (useScrollPosition, useTypewriter, useCountUp)
3. Add marquee CSS keyframes to index.css
4. Add landing route `/` to App.tsx
5. Build the HeroCanvas animation sequence (orchestrated node/edge/chat animations)
6. Add smooth scroll behavior (`scroll-behavior: smooth`)
7. **Test**: Load `/`, verify all sections render, animations trigger on scroll, CTA links to `/signup`, responsive on mobile

### Step 1: Design System + Layout
1. Update Tailwind theme with new design tokens (colors, shadows, etc.)
2. Create `TopBar.tsx`, `LeftSidebar.tsx`, `RightPanel.tsx`, `TabBar.tsx`
3. Rewrite `Layout.tsx` to use new layout structure
4. Restyle `BaseNode.tsx` with new card design
5. Restyle `ArchEdge.tsx`
6. Move `Toolbar.tsx` → `CanvasToolbar.tsx` (bottom-center)
7. Restyle `InspectorPanel.tsx`
8. Restyle `ChatPanel.tsx`, `ChatMessage.tsx`, `ChatInput.tsx`
9. Update `Canvas.tsx` (background, minimap)
10. Update `EmptyState.tsx`
11. Update `uiSlice.ts` (add `activeRightTab`)
12. **Test**: Run the app, verify all components render with new design

### Step 2: Routing + Auth Pages
13. Add `react-router-dom`, `@supabase/supabase-js` dependencies
14. Create `supabase.ts`, `useAuth.ts`
15. Create `LoginPage.tsx`, `SignupPage.tsx`, `ProtectedRoute.tsx`
16. Rewrite `App.tsx` with routing
17. Create `Dashboard.tsx`, `ProjectCard.tsx`
18. Create `authSlice.ts`
19. **Test**: Sign up, log in, see dashboard (no projects yet)

### Step 3: Database + Backend Auth
20. Run SQL migration in Supabase (create tables, RLS, indexes)
21. Create `backend/app/middleware/auth.py`
22. Rewrite `backend/app/models/persistence.py` for new schema
23. Rewrite `backend/app/services/persistence.py` for new schema
24. Rewrite `backend/app/routes/persistence.py` with new endpoints
25. Update `backend/app/main.py` (add auth middleware)
26. Update `backend/app/config.py` (add new env vars)
27. **Test**: Create project, create iteration, save/load nodes

### Step 4: Frontend Project/Iteration Integration
28. Create `projectSlice.ts`
29. Update `store/index.ts` (add new slices)
30. Rewrite `lib/api.ts` (auth headers, new endpoints)
31. Create `IterationTabs.tsx`, `UserMenu.tsx`
32. Update `graphSlice.ts` (save to iterations instead of graphs)
33. **Test**: Full flow — login → dashboard → create project → edit canvas → save → switch iterations

### Step 5: LLM Provider Abstraction
34. Create provider base class and implementations
35. Refactor `llm.py` to use provider
36. Update `config.py` with provider selection
37. **Test**: Generate architecture with Claude, then switch env to Gemini and test

### Step 6: Streaming
38. Add streaming methods to providers
39. Add streaming endpoints to `routes/graph.py`
40. Add streaming functions to frontend `api.ts`
41. Update `chatSlice.ts` with streaming state
42. Create `StreamingMessage.tsx`, `ToolCallCard.tsx`
43. Update `ChatPanel.tsx` to show streaming
44. Create `ModeSelector.tsx`
45. **Test**: Send prompt, verify tokens stream in real-time

### Step 7: Scoreboard
46. Create `backend/app/services/scoreboard.py`
47. Create `backend/app/routes/scoreboard.py`
48. Create `ScoreboardPanel.tsx`
49. **Test**: Generate architecture, compute scoreboard, verify scores

### Step 8: PDF Export
50. Add `jspdf` dependency
51. Create `exportPdf.ts`
52. Wire PDF export to toolbar button
53. **Test**: Export PDF, verify cover page + diagram + summary

### Step 9: Polish
54. Create `templates.ts` with 3 template architectures
55. Update `EmptyState.tsx` with template buttons
56. Create `ShortcutsModal.tsx`
57. Add demo seed data
58. Performance testing with 50+ nodes

---

## Verification Plan

1. **Landing page**: All sections render, hero canvas animation plays smoothly, scroll animations trigger, navbar becomes solid on scroll, CTAs link to signup, mobile responsive
2. **Design**: Visual inspection — light mode is clean/Figma-like, dark mode works, typography is consistent
2. **Auth**: Sign up with email → receive confirmation → log in → see empty dashboard → log out → redirect to login
3. **Auth (GitHub)**: Sign in with GitHub → see dashboard
4. **Dashboard**: Create project → see it in list → rename → delete with confirmation
5. **Workspace**: Open project → see canvas with empty state → drag nodes → connect edges
6. **Iterations**: Create v1 → add nodes → create v2 → verify v2 starts from v1's state → switch between tabs
7. **AI Generate**: Type "Build a URL shortener" → tokens stream in real-time → canvas populates
8. **AI Modify**: "Add Redis cache to the service" → streaming response → canvas updates
9. **Tool Calls**: During streaming, tool call cards appear and show progress
10. **Provider Switch**: Change `LLM_PROVIDER=gemini` → restart backend → verify generation works
11. **Scoreboard**: Click "Compute Scoreboard" → see cost/reliability/security scores
12. **PDF Export**: Click export → download PDF → verify cover page, canvas image, summary table
13. **PNG Export**: Existing PNG export still works
14. **Undo/Redo**: Cmd+Z/Cmd+Shift+Z work correctly after AI modifications
15. **Keyboard shortcuts**: All shortcuts work, `?` opens help modal
16. **Templates**: Click template in empty state → canvas populates with template architecture
17. **Persistence**: Reload page → state persists from last save
18. **Rate limiting**: Rapid requests → get 429 error → graceful error display
19. **Demo mode**: No API keys → demo response works → streaming shows demo data instantly
20. **Responsive**: Panel resizing works, sidebar collapses properly
