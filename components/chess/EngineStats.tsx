interface EngineStatsProps {
  depth: number;
  nodes: number;
  nps: number;
  score: number; // centipawns
  bestMove: string; // e.g., "e2e4"
  time: number; // milliseconds
}

export function EngineStats({ depth, nodes, nps, score, bestMove, time }: EngineStatsProps) {
  return (
    <div className="glass rounded-2xl p-4 border border-border">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium text-muted uppercase tracking-wider">Engine Stats</span>
        <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full">active</span>
      </div>
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div><span className="text-muted">Depth</span> <span className="text-white font-medium ml-2">{depth}</span></div>
        <div><span className="text-muted">Nodes</span> <span className="text-white font-medium ml-2">{nodes.toLocaleString()}</span></div>
        <div><span className="text-muted">NPS</span> <span className="text-white font-medium ml-2">{nps.toLocaleString()}</span></div>
        <div><span className="text-muted">Score</span> <span className="text-white font-medium ml-2">{score > 0 ? '+' : ''}{score/100}</span></div>
        <div className="col-span-2"><span className="text-muted">Best Move</span> <span className="text-white font-medium ml-2 font-mono">{bestMove}</span></div>
        <div className="col-span-2"><span className="text-muted">Time</span> <span className="text-white font-medium ml-2">{time}ms</span></div>
      </div>
    </div>
  );
}