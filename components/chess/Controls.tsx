// components/chess/Controls.tsx
interface ControlsProps {
  onNewGame: () => void;
  onUndo: () => void;
  onFlip: () => void;
  onEngineMove: () => void;
  disabled?: boolean;
  thinking?: boolean;
}

export function Controls({
  onNewGame,
  onUndo,
  onFlip,
  onEngineMove,
  disabled,
  thinking,
}: ControlsProps) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mt-5 pt-1">
      <button
        onClick={onNewGame}
        className="text-xs sm:text-sm font-medium bg-white/5 hover:bg-white/10 px-4 py-2 rounded-full transition border border-border text-muted hover:text-white"
      >
        ↻ New Game
      </button>
      <button
        onClick={onUndo}
        className="text-xs sm:text-sm font-medium bg-white/5 hover:bg-white/10 px-4 py-2 rounded-full transition border border-border text-muted hover:text-white disabled:opacity-40 disabled:cursor-not-allowed"
        disabled={disabled || thinking}
      >
        ↺ Undo
      </button>
      <button
        onClick={onFlip}
        className="text-xs sm:text-sm font-medium bg-white/5 hover:bg-white/10 px-4 py-2 rounded-full transition border border-border text-muted hover:text-white"
      >
        ⇄ Flip
      </button>
      <button
        onClick={onEngineMove}
        className="text-xs sm:text-sm font-medium bg-accent/20 hover:bg-accent/30 px-4 py-2 rounded-full transition border border-accent/30 text-accent font-semibold disabled:opacity-40 disabled:cursor-not-allowed"
        disabled={disabled || thinking}
      >
        ⚡ Engine Move
      </button>
    </div>
  );
}