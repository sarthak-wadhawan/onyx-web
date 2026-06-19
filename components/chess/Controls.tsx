interface ControlsProps {
  onNewGame: () => void;
  onUndo: () => void;
  onFlip: () => void;
  onEngineMove: () => void;
  disabled?: boolean;
}

export function Controls({ onNewGame, onUndo, onFlip, onEngineMove, disabled }: ControlsProps) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-3 mt-4">
      <button
        onClick={onNewGame}
        className="text-xs font-medium bg-white/5 hover:bg-white/10 px-4 py-2 rounded-full transition border border-border text-muted hover:text-white"
      >
        New Game
      </button>
      <button
        onClick={onUndo}
        className="text-xs font-medium bg-white/5 hover:bg-white/10 px-4 py-2 rounded-full transition border border-border text-muted hover:text-white"
        disabled={disabled}
      >
        Undo
      </button>
      <button
        onClick={onFlip}
        className="text-xs font-medium bg-white/5 hover:bg-white/10 px-4 py-2 rounded-full transition border border-border text-muted hover:text-white"
      >
        Flip Board
      </button>
      <button
        onClick={onEngineMove}
        className="text-xs font-medium bg-accent/20 hover:bg-accent/30 px-4 py-2 rounded-full transition border border-accent/30 text-accent font-semibold"
        disabled={disabled}
      >
        Engine Move
      </button>
    </div>
  );
}