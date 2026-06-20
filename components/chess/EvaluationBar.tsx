// components/chess/EvaluationBar.tsx
interface EvaluationBarProps {
  score: number;
  sideToMove: 'w' | 'b';
}

export function EvaluationBar({ score, sideToMove }: EvaluationBarProps) {
  const clamped = Math.max(-1000, Math.min(1000, score));
  const percentage = 50 + (clamped / 2000) * 50;
  const barWidth = Math.min(100, Math.max(0, percentage));
  const barColor = score > 0 ? 'from-accent to-purple-400' : 'from-red-400 to-orange-400';

  return (
    <div className="glass rounded-2xl p-4 border border-border bg-white/5 backdrop-blur-sm">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-muted uppercase tracking-wider">
          Evaluation
        </span>
        <span className="text-xs font-mono text-white font-medium">
          {score > 0 ? '+' : ''}{(score / 100).toFixed(2)}
        </span>
      </div>
      <div className="h-3 w-full bg-white/10 rounded-full overflow-hidden shadow-inner">
        <div
          className={`h-full bg-gradient-to-r ${barColor} rounded-full transition-all duration-500 ease-out`}
          style={{ width: `${barWidth}%` }}
        />
      </div>
      <div className="flex justify-between text-[10px] text-muted mt-1.5 px-0.5">
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-red-400/60" /> Black
        </span>
        <span className="flex items-center gap-1">
          White <span className="w-2 h-2 rounded-full bg-accent/60" />
        </span>
      </div>
      <div className="flex justify-center text-[10px] text-muted/70 mt-1">
        {sideToMove === 'w' ? 'White to move' : 'Black to move'}
      </div>
    </div>
  );
}