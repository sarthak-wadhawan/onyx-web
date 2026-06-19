'use client';

import Link from 'next/link';
import { AnimatedContainer } from './animated-container';
import { cn } from '../lib/utils';

export function Hero() {
  return (
    <section className="hero-gradient pt-28 pb-16 md:pt-36 md:pb-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <AnimatedContainer>
            <div className="inline-flex items-center gap-2 bg-white/5 border border-border rounded-full px-4 py-1.5 text-xs font-medium text-muted mb-6">
              <span className="w-2 h-2 rounded-full bg-emerald-400/70 animate-pulse"></span>
              C++ · Negamax · Alpha-Beta
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-[1.1] text-white">
              Building a Chess Engine
              <span className="text-gradient"> from Scratch</span>
            </h1>
            <p className="mt-5 text-lg text-muted max-w-lg leading-relaxed">
              A complete, self-contained chess engine written in C++ with negamax search,
              alpha-beta pruning, and PeSTO-style evaluation. Now running in your browser.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/play"
                className="inline-flex items-center gap-2 bg-accent hover:bg-accent-hover text-white font-semibold px-6 py-3 rounded-full transition shadow-lg shadow-accent/20"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-4m0 0l-4-4m4 4H4" />
                </svg>
                Play the Engine
              </Link>
              <Link
                href="/architecture"
                className="inline-flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white font-medium px-6 py-3 rounded-full transition border border-white/10"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Explore How It Works
              </Link>
            </div>
            <div className="mt-10 flex gap-8 text-sm">
              <div>
                <span className="block text-2xl font-bold text-white">~2,500</span>
                <span className="text-muted">lines of C++</span>
              </div>
              <div>
                <span className="block text-2xl font-bold text-white">4</span>
                <span className="text-muted">search depth (configurable)</span>
              </div>
              <div>
                <span className="block text-2xl font-bold text-white">♔</span>
                <span className="text-muted">fully legal moves</span>
              </div>
            </div>
          </AnimatedContainer>

          <AnimatedContainer delay={0.2}>
            <div className="glass rounded-2xl p-6 shadow-glow border border-border">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-medium text-muted uppercase tracking-wider">Architecture</span>
                <span className="text-xs text-muted">C++ → WebAssembly</span>
              </div>
              <div className="space-y-3">
                {[
                  { icon: '🧩', label: 'Board Representation', sub: '64‑int array · piece codes · game state' },
                  { icon: '⚡', label: 'Move Generation', sub: 'pseudo‑legal + legality filter · copy‑make' },
                  { icon: '🔍', label: 'Search', sub: 'Negamax · Alpha‑Beta · MVV‑LVA ordering' },
                  { icon: '📊', label: 'Evaluation', sub: 'PeSTO tables · material · positional' },
                  { icon: '🌐', label: 'UI Layer', sub: 'Next.js · Chessboard.js · Tailwind', highlight: true },
                ].map((item, i) => (
                  <div
                    key={i}
                    className={cn(
                      'flex items-center gap-3 bg-white/5 rounded-xl px-4 py-3 border',
                      item.highlight ? 'border-emerald-500/20' : 'border-border'
                    )}
                  >
                    <span className="text-lg">{item.icon}</span>
                    <div>
                      <div className="text-sm font-medium text-white">{item.label}</div>
                      <div className="text-xs text-muted">{item.sub}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-border flex justify-between text-xs text-muted">
                <span>⬅️ from C++</span>
                <span>➡️ to browser</span>
              </div>
            </div>
            <div className="absolute -bottom-3 -right-3 bg-[#1e2329] border border-border rounded-full px-4 py-1.5 text-xs font-medium text-white shadow-lg">
              ⚡ WASM ready
            </div>
          </AnimatedContainer>
        </div>
      </div>
    </section>
  );
}