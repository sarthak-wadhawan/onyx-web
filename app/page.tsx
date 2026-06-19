import { Hero } from '../components/hero';
import { Section } from '../components/section-layout';
import { CodeBlock } from '../components/code-block';
import { AnimatedContainer } from '../components/animated-container';

export default function Home() {
  return (
    <>
      <Hero />

      {/* Play teaser section */}
      <Section
        title="Play the Engine"
        subtitle="Challenge the engine or analyze positions"
        action={{ label: 'Full page →', href: '/play' }}
      >
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="glass rounded-2xl p-4 border border-border">
              <div className="aspect-square max-w-[500px] mx-auto bg-[#1a1f26] rounded-xl flex items-center justify-center border border-border">
                <div className="text-center text-muted">
                  <span className="text-5xl block mb-2">♔</span>
                  <span className="text-sm">Chessboard.js will render here</span>
                  <span className="block text-xs mt-1">interactive · draggable pieces</span>
                </div>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-3 mt-4">
                <button className="text-xs font-medium bg-white/5 hover:bg-white/10 px-4 py-2 rounded-full transition border border-border text-muted hover:text-white">
                  New Game
                </button>
                <button className="text-xs font-medium bg-white/5 hover:bg-white/10 px-4 py-2 rounded-full transition border border-border text-muted hover:text-white">
                  Undo
                </button>
                <button className="text-xs font-medium bg-white/5 hover:bg-white/10 px-4 py-2 rounded-full transition border border-border text-muted hover:text-white">
                  Flip Board
                </button>
                <button className="text-xs font-medium bg-accent/20 hover:bg-accent/30 px-4 py-2 rounded-full transition border border-accent/30 text-accent font-semibold">
                  Engine Move
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="glass rounded-2xl p-4 border border-border">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium text-muted uppercase tracking-wider">Engine Stats</span>
                <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full">active</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div><span className="text-muted">Depth</span> <span className="text-white font-medium ml-2">4</span></div>
                <div><span className="text-muted">Nodes</span> <span className="text-white font-medium ml-2">12.4k</span></div>
                <div><span className="text-muted">NPS</span> <span className="text-white font-medium ml-2">8.2k</span></div>
                <div><span className="text-muted">Score</span> <span className="text-white font-medium ml-2">+0.42</span></div>
              </div>
            </div>

            <div className="glass rounded-2xl p-4 border border-border">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-muted uppercase tracking-wider">Evaluation</span>
                <span className="text-xs text-muted">+0.42</span>
              </div>
              <div className="h-2.5 w-full bg-white/10 rounded-full overflow-hidden">
                <div className="h-full w-[58%] bg-gradient-to-r from-accent to-purple-400 rounded-full"></div>
              </div>
              <div className="flex justify-between text-[10px] text-muted mt-1.5">
                <span>Black</span>
                <span>White</span>
              </div>
            </div>

            <div className="glass rounded-2xl p-4 border border-border">
              <span className="text-xs font-medium text-muted uppercase tracking-wider">Move History</span>
              <div className="mt-2 text-xs text-muted font-mono leading-relaxed">
                1. e4 e5 2. Nf3 Nc6 3. Bb5 a6 ...
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* Educational cards */}
      <Section title="How It Works" subtitle="A deep dive into the engine's internals">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { icon: '🧩', title: 'Board Representation', desc: '64‑int array with piece codes, side to move, castling rights, en passant, and move clocks.', code: 'int squares[64];  int side_to_move;' },
            { icon: '⚡', title: 'Move Generation', desc: 'Pseudo‑legal move generation with a legality filter using copy‑make and king‑safety checks.', code: 'add_pawn_moves() · add_knight_moves()' },
            { icon: '🔍', title: 'Negamax Search', desc: 'Alpha‑beta pruning with MVV‑LVA move ordering. Depth‑4 search, configurable.', code: 'negamax(depth, α, β) · order_moves()' },
            { icon: '📊', title: 'PeSTO Evaluation', desc: 'Material + piece‑square tables for middlegame and endgame, interpolated by phase.', code: 'mg_score + eg_score · phase = 24' },
            { icon: '📈', title: 'Performance', desc: 'Nodes per second, depth reached, benchmark positions. Optimized with move ordering.', code: '~8k NPS · depth 4 in < 100ms' },
            { icon: '🌐', title: 'Web Integration', desc: 'C++ compiled to WebAssembly, bridged to Next.js + Chessboard.js UI.', code: 'WASM · Emscripten · React' },
          ].map((item, i) => (
            <AnimatedContainer key={i} className="glass rounded-2xl p-6 border border-border hover:border-white/10 transition" delay={i * 0.05}>
              <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent text-lg mb-4">
                {item.icon}
              </div>
              <h3 className="text-lg font-semibold text-white">{item.title}</h3>
              <p className="text-sm text-muted mt-2 leading-relaxed">{item.desc}</p>
              <div className="mt-4 text-xs font-mono text-muted bg-white/5 rounded-lg px-3 py-2 border border-border">
                {item.code}
              </div>
            </AnimatedContainer>
          ))}
        </div>
      </Section>

      {/* Code snippet */}
      <Section title="Core Search" subtitle="Negamax with alpha-beta pruning (C++)" className="max-w-4xl mx-auto">
        <CodeBlock
          language="cpp"
          code={`// Negamax with alpha-beta pruning
static int negamax(Board& b, int depth, int alpha, int beta) {
  nodes_count++;
  if (depth == 0) return evaluate(b);
  auto moves = generate_legal_moves(b);
  if (moves.empty()) {
    return is_in_check(b, b.side_to_move) ? -100000 + (100 - depth) : 0;
  }
  order_moves(moves, b);
  for (const auto& m : moves) {
    Board copy = b;
    make_move(copy, m);
    int score = -negamax(copy, depth - 1, -beta, -alpha);
    if (score >= beta) return beta;
    if (score > alpha) alpha = score;
  }
  return alpha;
}`}
        />
      </Section>
    </>
  );
}