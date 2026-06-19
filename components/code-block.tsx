'use client';

import { cn } from '../lib/utils';

interface CodeBlockProps {
  code: string;
  language?: string;
  className?: string;
}

export function CodeBlock({ code, language = 'cpp', className }: CodeBlockProps) {
  return (
    <div className={cn('glass rounded-2xl p-6 md:p-8 border border-border', className)}>
      <div className="flex items-center gap-3 mb-4">
        <span className="text-sm font-medium text-white">🔧 {language.toUpperCase()}</span>
        <span className="text-xs text-muted bg-white/5 px-2 py-0.5 rounded-full">C++</span>
      </div>
      <pre className="code-block">
        <code className="font-mono text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap">
          {code}
        </code>
      </pre>
      <div className="mt-4 text-xs text-muted flex items-center gap-4">
        <span>⬅️ Alpha‑Beta pruning</span>
        <span>•</span>
        <span>MVV‑LVA move ordering</span>
        <span>•</span>
        <span>Copy‑make board state</span>
      </div>
    </div>
  );
}