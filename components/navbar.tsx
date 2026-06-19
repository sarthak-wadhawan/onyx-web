'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';

const navItems = [
  { label: 'Overview', href: '/' },
  { label: 'Play', href: '/play' },
  { label: 'Architecture', href: '/architecture' },
  { label: 'Move Gen', href: '/movegen' },
  { label: 'Search', href: '/search' },
  { label: 'Evaluation', href: '/eval' },
  { label: 'Performance', href: '/perf' },
  { label: 'Source', href: '/source' },
];

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <Link href="/" className="text-xl font-bold tracking-tight text-white">
              ♚ Onyx
            </Link>
            <span className="text-xs font-medium text-muted bg-white/5 px-2 py-0.5 rounded-full border border-border">
              C++ Engine
            </span>
          </div>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-6">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="nav-link text-sm font-medium text-muted hover:text-white transition"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-3">
            <Link
              href="/play"
              className="hidden sm:inline-flex items-center gap-1.5 text-sm font-medium text-white bg-white/10 hover:bg-white/20 px-4 py-2 rounded-full transition border border-border"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-4m0 0l-4-4m4 4H4" />
              </svg>
              Play Engine
            </Link>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden p-2 text-muted hover:text-white transition"
              aria-label="Toggle menu"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {isOpen && (
          <div className="md:hidden py-4 border-t border-border">
            <nav className="flex flex-col gap-3">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-sm font-medium text-muted hover:text-white transition px-2 py-1"
                  onClick={() => setIsOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        )}
      </div>

      <style jsx>{`
        .nav-link {
          position: relative;
        }
        .nav-link::after {
          content: '';
          position: absolute;
          bottom: -2px;
          left: 0;
          width: 0;
          height: 1.5px;
          background: #6b8cff;
          transition: width 0.25s ease;
        }
        .nav-link:hover::after {
          width: 100%;
        }
        .nav-link:hover {
          color: #f0f4f9;
        }
      `}</style>
    </header>
  );
}