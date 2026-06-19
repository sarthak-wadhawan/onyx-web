interface EvaluationBarProps {
  score: number; // centipawns, positive = white advantage
  sideToMove: 'w' | 'b';
}

export function EvaluationBar({ score, sideToMove }: EvaluationBarProps) {
  // Map score to percentage (clamp between -1000 and 1000 centipawns)
  const clamped = Math.max(-1000, Math.min(1000, score));
  const percentage = 50 + (clamped / 2000) * 50; // 0-100, 50 is equal
  const barColor = score > 0 ? 'from-accent to-purple-400' : 'from-red-400 to-orange-400';
  const barWidth = Math.min(100, Math.max(0, percentage));

  return (
    <div className="glass rounded-2xl p-4 border border-border">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-muted uppercase tracking-wider">Evaluation</span>
        <span className="text-xs text-muted">{score > 0 ? '+' : ''}{score/100}</span>
      </div>
      <div className="h-2.5 w-full bg-white/10 rounded-full overflow-hidden">
        <div className={`h-full bg-gradient-to-r ${barColor} rounded-full`} style={{ width: `${barWidth}%` }} />
      </div>
      <div className="flex justify-between text-[10px] text-muted mt-1.5">
        <span>Black</span>
        <span>White</span>
      </div>
      <div className="flex justify-between text-[10px] text-muted mt-1">
        <span>{sideToMove === 'w' ? 'White to move' : 'Black to move'}</span>
      </div>
    </div>
  );
}