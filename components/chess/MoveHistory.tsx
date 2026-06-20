// components/chess/MoveHistory.tsx
interface MoveHistoryProps {
  moves: string[];
}

export function MoveHistory({ moves }: MoveHistoryProps) {
  const pairs: { w?: string; b?: string }[] = [];
  for (let i = 0; i < moves.length; i += 2) {
    pairs.push({ w: moves[i], b: moves[i + 1] });
  }

  // Show only last 10 moves for better readability
  const recentPairs = pairs.slice(-10);

  return (
    <div className="glass rounded-2xl p-4 border border-border bg-white/5 backdrop-blur-sm flex-1 min-h-0">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-muted uppercase tracking-wider">
          Move History
        </span>
        <span className="text-[10px] text-muted/60">{moves.length} moves</span>
      </div>
      <div className="max-h-48 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
        {recentPairs.length === 0 && (
          <div className="text-xs text-muted/50 italic py-2">No moves yet</div>
        )}
        {recentPairs.map((pair, idx) => {
          const moveNumber = pairs.length - recentPairs.length + idx + 1;
          return (
            <div
              key={idx}
              className="flex gap-4 text-xs border-b border-border/20 py-1.5 first:pt-0 last:border-0"
            >
              <span className="text-muted/50 w-6 text-right font-mono text-[11px]">
                {moveNumber}.
              </span>
              <span className="text-white/80 w-16 font-mono">{pair.w || ''}</span>
              <span className="text-white/80 w-16 font-mono">{pair.b || ''}</span>
            </div>
          );
        })}
        {pairs.length > 10 && (
          <div className="text-[10px] text-muted/50 mt-1 text-center">
            showing last 10 moves
          </div>
        )}
      </div>
    </div>
  );
}