// app/page.tsx
import Link from 'next/link';
import { 
  Cpu, 
  Move, 
  Search as SearchIcon, 
  BarChart3, 
  Gauge,
  ArrowRight,
  Sparkles
} from 'lucide-react';

const sections = [
  {
    id: 'architecture',
    title: 'Architecture',
    description: 'Deep dive into the Onyx engine stack: C++ core, WebAssembly, and React frontend.',
    icon: Cpu,
    href: '/architecture',
    color: 'from-blue-500 to-cyan-400',
  },
  {
    id: 'move-generation',
    title: 'Move Generation',
    description: 'Interactive visualization of pseudo-legal moves, legal moves, check detection, pins, and attack maps.',
    icon: Move,
    href: '/learn/move-generation',
    color: 'from-emerald-500 to-teal-400',
  },
  {
    id: 'search',
    title: 'Search Algorithms',
    description: 'Explore minimax, alpha-beta pruning, iterative deepening, and principal variation in the search tree.',
    icon: SearchIcon,
    href: '/learn/search',
    color: 'from-purple-500 to-pink-400',
  },
  {
    id: 'evaluation',
    title: 'Evaluation',
    description: 'Understand material, piece-square tables, mobility, and king safety with interactive examples.',
    icon: BarChart3,
    href: '/learn/evaluation',
    color: 'from-orange-500 to-red-400',
  },
  {
    id: 'performance',
    title: 'Performance',
    description: 'Benchmark engine speed, measure NPS, and track optimization progress over time.',
    icon: Gauge,
    href: '/performance',
    color: 'from-indigo-500 to-blue-400',
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background pt-20 px-4 sm:px-6 lg:px-8 pb-12">
      <div className="max-w-7xl mx-auto">
        {/* Hero */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-accent/10 text-accent px-4 py-1.5 rounded-full border border-accent/20 text-sm font-medium mb-4">
            <Sparkles size={16} />
            <span>Onyx Chess Engine — Interactive Learning</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-white tracking-tight">
            Understand Chess AI,
            <br />
            <span className="bg-gradient-to-r from-accent to-purple-400 bg-clip-text text-transparent">
              One Concept at a Time
            </span>
          </h1>
          <p className="mt-4 text-lg text-muted max-w-2xl mx-auto">
            Explore the inner workings of a chess engine through visual, interactive explanations.
            From move generation to search and evaluation — see how Onyx thinks.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              href="/play"
              className="inline-flex items-center gap-2 bg-accent hover:bg-accent/80 text-white font-medium px-6 py-3 rounded-full transition shadow-lg shadow-accent/25"
            >
              Play Against Onyx
              <ArrowRight size={18} />
            </Link>
            <Link
              href="#explore"
              className="inline-flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white font-medium px-6 py-3 rounded-full transition border border-border"
            >
              Explore Concepts
            </Link>
          </div>
        </div>

        {/* Preview Cards */}
        <div id="explore" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sections.map((section) => {
            const Icon = section.icon;
            return (
              <Link
                key={section.id}
                href={section.href}
                className="group relative glass rounded-2xl p-6 border border-border hover:border-accent/40 transition-all duration-300 hover:shadow-xl hover:shadow-accent/5 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-5 transition-opacity duration-300" />
                <div className="relative">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${section.color} p-2.5 text-white shadow-lg mb-4`}>
                    <Icon size={24} strokeWidth={1.5} />
                  </div>
                  <h3 className="text-lg font-semibold text-white group-hover:text-accent transition">
                    {section.title}
                  </h3>
                  <p className="mt-2 text-sm text-muted leading-relaxed">
                    {section.description}
                  </p>
                  <div className="mt-4 flex items-center text-xs font-medium text-accent gap-1 group-hover:gap-2 transition-all">
                    <span>Learn more</span>
                    <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Quick Stats Bar */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 glass rounded-2xl p-6 border border-border bg-white/5">
          <div className="text-center">
            <div className="text-2xl font-bold text-white">~15k</div>
            <div className="text-xs text-muted mt-0.5">NPS (WASM)</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-white">4</div>
            <div className="text-xs text-muted mt-0.5">Search Depth</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-white">6</div>
            <div className="text-xs text-muted mt-0.5">Piece Types</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-white">100%</div>
            <div className="text-xs text-muted mt-0.5">Interactive</div>
          </div>
        </div>
      </div>
    </div>
  );
}