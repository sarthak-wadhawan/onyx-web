interface MoveHistoryProps {
  moves: string[]; // list of moves in algebraic notation (e.g., "e4", "Nf3")
}

export function MoveHistory({ moves }: MoveHistoryProps) {
  // Group moves in pairs
  const pairs: { w?: string; b?: string }[] = [];
  for (let i = 0; i < moves.length; i += 2) {
    pairs.push({ w: moves[i], b: moves[i+1] });
  }

  return (
    <div className="glass rounded-2xl p-4 border border-border">
      <span className="text-xs font-medium text-muted uppercase tracking-wider">Move History</span>
      <div className="mt-2 max-h-40 overflow-y-auto">
        {pairs.length === 0 && <div className="text-xs text-muted italic">No moves yet</div>}
        {pairs.map((pair, idx) => (
          <div key={idx} className="flex gap-4 text-xs font-mono text-muted leading-relaxed border-b border-border/30 py-1">
            <span className="text-white/50 w-6">{idx+1}.</span>
            <span className="text-white/80 w-16">{pair.w || ''}</span>
            <span className="text-white/80 w-16">{pair.b || ''}</span>
          </div>
        ))}
      </div>
    </div>
  );
}