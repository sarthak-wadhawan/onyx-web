// components/chess/EngineStats.tsx
interface EngineStatsProps {
  depth: number;
  nodes: number;
  nps: number;
  score: number;
  bestMove: string;
  time: number;
}

export function EngineStats({ depth, nodes, nps, score, bestMove, time }: EngineStatsProps) {
  return (
    <div className="glass rounded-2xl p-4 border border-border">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium text-muted uppercase tracking-wider">Engine Stats</span>
        <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/20">
          active
        </span>
      </div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-muted">Depth</span>
          <span className="text-white font-mono font-medium">{depth}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted">Nodes</span>
          <span className="text-white font-mono font-medium">{nodes.toLocaleString()}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted">NPS</span>
          <span className="text-white font-mono font-medium">{nps.toLocaleString()}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted">Score</span>
          <span className="text-white font-mono font-medium">
            {score > 0 ? '+' : ''}{(score / 100).toFixed(2)}
          </span>
        </div>
        <div className="col-span-2 flex justify-between">
          <span className="text-muted">Best Move</span>
          <span className="text-white font-mono font-medium">{bestMove || '—'}</span>
        </div>
        <div className="col-span-2 flex justify-between">
          <span className="text-muted">Time</span>
          <span className="text-white font-mono font-medium">{time}ms</span>
        </div>
      </div>
    </div>
  );
}