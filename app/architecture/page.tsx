// app/architecture/page.tsx
'use client';

export default function ArchitecturePage() {
  return (
    <div className="min-h-screen bg-background pt-20 px-4 sm:px-6 lg:px-8 pb-12">
      <div className="max-w-4xl mx-auto">
        <div className="mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
            Onyx Engine Architecture
          </h1>
          <p className="text-muted mt-2 text-sm md:text-base">
            How the pieces fit together: from C++ core to interactive React frontend
          </p>
        </div>

        <div className="space-y-8">
          {/* Overview diagram */}
          <div className="glass rounded-2xl p-6 border border-border bg-white/5">
            <h2 className="text-lg font-semibold text-white mb-4">System Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div className="p-4 bg-white/5 rounded-xl border border-border/50">
                <div className="text-3xl mb-2">⚙️</div>
                <h3 className="text-sm font-medium text-white">C++ Engine</h3>
                <p className="text-xs text-muted mt-1">Move generation, search, evaluation, UCI/WASM</p>
              </div>
              <div className="p-4 bg-white/5 rounded-xl border border-border/50">
                <div className="text-3xl mb-2">🌐</div>
                <h3 className="text-sm font-medium text-white">API / WASM</h3>
                <p className="text-xs text-muted mt-1">Binary UCI or WebAssembly for browser</p>
              </div>
              <div className="p-4 bg-white/5 rounded-xl border border-border/50">
                <div className="text-3xl mb-2">⚛️</div>
                <h3 className="text-sm font-medium text-white">React Frontend</h3>
                <p className="text-xs text-muted mt-1">Next.js, react-chessboard, chess.js</p>
              </div>
            </div>
          </div>

          {/* Layers */}
          <div className="glass rounded-2xl p-6 border border-border bg-white/5">
            <h2 className="text-lg font-semibold text-white mb-4">Layered Architecture</h2>
            <div className="space-y-3">
              <div className="flex items-start gap-4 p-3 bg-white/5 rounded-lg border border-border/50">
                <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center text-accent font-bold text-xs">1</div>
                <div>
                  <h4 className="text-sm font-medium text-white">Board Representation</h4>
                  <p className="text-xs text-muted">Bitboards or 8x8 arrays; FEN parsing; move generation with legal checks</p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-3 bg-white/5 rounded-lg border border-border/50">
                <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center text-accent font-bold text-xs">2</div>
                <div>
                  <h4 className="text-sm font-medium text-white">Evaluation</h4>
                  <p className="text-xs text-muted">PeSTO piece-square tables, material, mobility, king safety</p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-3 bg-white/5 rounded-lg border border-border/50">
                <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center text-accent font-bold text-xs">3</div>
                <div>
                  <h4 className="text-sm font-medium text-white">Search</h4>
                  <p className="text-xs text-muted">Negamax with alpha-beta pruning, iterative deepening, principal variation</p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-3 bg-white/5 rounded-lg border border-border/50">
                <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center text-accent font-bold text-xs">4</div>
                <div>
                  <h4 className="text-sm font-medium text-white">Communication</h4>
                  <p className="text-xs text-muted">UCI protocol for binary, Emscripten exports for WASM, REST API for web</p>
                </div>
              </div>
            </div>
          </div>

          {/* Tech Stack */}
          <div className="glass rounded-2xl p-6 border border-border bg-white/5">
            <h2 className="text-lg font-semibold text-white mb-4">Technology Stack</h2>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="p-3 bg-white/5 rounded-lg border border-border/50">
                <span className="text-muted">Language</span>
                <div className="text-white font-medium">C++17, TypeScript</div>
              </div>
              <div className="p-3 bg-white/5 rounded-lg border border-border/50">
                <span className="text-muted">Web</span>
                <div className="text-white font-medium">Next.js 14, React 18</div>
              </div>
              <div className="p-3 bg-white/5 rounded-lg border border-border/50">
                <span className="text-muted">WASM</span>
                <div className="text-white font-medium">Emscripten 3.1</div>
              </div>
              <div className="p-3 bg-white/5 rounded-lg border border-border/50">
                <span className="text-muted">Build</span>
                <div className="text-white font-medium">Make, clang++</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}