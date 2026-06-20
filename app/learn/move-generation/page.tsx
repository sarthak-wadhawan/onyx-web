// app/learn/move-generation/page.tsx
'use client';

import { useState, useCallback, useMemo } from 'react';
import { Chess } from 'chess.js';
import { Chessboard } from 'react-chessboard';
import { Square } from 'react-chessboard/dist/chessboard/types';

type Mode = 'pseudo' | 'legal' | 'check' | 'pins' | 'attack';

const initialFen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

export default function MoveGenerationPage() {
  const [game, setGame] = useState(() => new Chess(initialFen));
  const [fen, setFen] = useState(initialFen);
  const [mode, setMode] = useState<Mode>('legal');
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [hoveredSquare, setHoveredSquare] = useState<Square | null>(null);
  const [highlightedSquares, setHighlightedSquares] = useState<{ [key: string]: string }>({});
  const [attackColor, setAttackColor] = useState<'w' | 'b'>('w');

  // Helper to update board from FEN
  const setPosition = useCallback((newFen: string) => {
    try {
      const newGame = new Chess(newFen);
      setGame(newGame);
      setFen(newFen);
      setSelectedSquare(null);
      setHighlightedSquares({});
    } catch (e) {
      alert('Invalid FEN');
    }
  }, []);

  // ----- Helper functions -----

  // Generate pseudo-legal moves for a given square (ignoring king safety)
  function generatePseudoLegalMoves(board: Chess, square: Square): Square[] {
    const piece = board.get(square);
    if (!piece) return [];
    const { color, type } = piece;
    const targets: Square[] = [];

    const squareToIndex = (sq: Square): number => {
      return (sq.charCodeAt(0) - 97) + (8 - parseInt(sq[1])) * 8;
    };
    const indexToSquare = (idx: number): Square => {
      const file = String.fromCharCode(97 + (idx % 8));
      const rank = 8 - Math.floor(idx / 8);
      return `${file}${rank}` as Square;
    };
    const inBounds = (idx: number): boolean => idx >= 0 && idx < 64;

    const boardArray = board.board(); // 8x8 array

    const addTarget = (target: Square) => {
      const targetPiece = board.get(target);
      if (targetPiece && targetPiece.color === color) return; // can't capture own
      targets.push(target);
    };

    const idx = squareToIndex(square);
    const file = idx % 8;
    const rank = Math.floor(idx / 8);

    // Directions for sliding pieces
    const directions: { [key: string]: number[] } = {
      'r': [1, -1, 8, -8],
      'b': [7, -7, 9, -9],
      'q': [1, -1, 8, -8, 7, -7, 9, -9],
    };

    // Helper to add sliding moves
    const addSliding = (dirs: number[]) => {
      for (const d of dirs) {
        let i = idx + d;
        while (inBounds(i)) {
          const sq = indexToSquare(i);
          const pieceOnTarget = board.get(sq);
          if (pieceOnTarget) {
            if (pieceOnTarget.color !== color) targets.push(sq);
            break;
          }
          targets.push(sq);
          // check if edge of board in that direction (file wrap)
          if ((d === 1 && (i % 8) === 0) || (d === -1 && (i % 8) === 7)) break;
          i += d;
        }
      }
    };

    switch (type) {
      case 'p': {
        const forward = color === 'w' ? -8 : 8;
        const startRank = color === 'w' ? 6 : 1;
        // Forward one
        const one = idx + forward;
        if (inBounds(one) && !board.get(indexToSquare(one))) {
          targets.push(indexToSquare(one));
          // Forward two if on start rank
          const two = idx + 2 * forward;
          if (rank === startRank && !board.get(indexToSquare(two))) {
            targets.push(indexToSquare(two));
          }
        }
        // Captures
        for (const cap of [forward - 1, forward + 1]) {
          const capIdx = idx + cap;
          if (inBounds(capIdx)) {
            const capSq = indexToSquare(capIdx);
            const targetPiece = board.get(capSq);
            if (targetPiece && targetPiece.color !== color) {
              targets.push(capSq);
            }
            // En passant (we need to handle ep square from board)
            const epSquare = board.get('ep') as Square | null;
            if (epSquare && epSquare === capSq) {
              targets.push(capSq);
            }
          }
        }
        break;
      }
      case 'n': {
        const knightOffsets = [-17, -15, -10, -6, 6, 10, 15, 17];
        for (const off of knightOffsets) {
          const i = idx + off;
          if (inBounds(i)) {
            const sq = indexToSquare(i);
            const targetPiece = board.get(sq);
            if (!targetPiece || targetPiece.color !== color) {
              targets.push(sq);
            }
          }
        }
        break;
      }
      case 'b':
        addSliding(directions['b']);
        break;
      case 'r':
        addSliding(directions['r']);
        break;
      case 'q':
        addSliding(directions['q']);
        break;
      case 'k': {
        const kingOffsets = [-9, -8, -7, -1, 1, 7, 8, 9];
        for (const off of kingOffsets) {
          const i = idx + off;
          if (inBounds(i)) {
            // Check that we don't wrap around
            const fromFile = idx % 8;
            const toFile = i % 8;
            if (Math.abs(toFile - fromFile) > 2) continue;
            const sq = indexToSquare(i);
            const targetPiece = board.get(sq);
            if (!targetPiece || targetPiece.color !== color) {
              targets.push(sq);
            }
          }
        }
        // Castling (we can omit for simplicity)
        break;
      }
    }
    return targets;
  }

  // Compute pins for a given color
  function computePins(board: Chess, color: 'w' | 'b'): { square: Square; pinnedBy: Square; direction: number }[] {
    const pins: { square: Square; pinnedBy: Square; direction: number }[] = [];
    const kingSquare = board.getKingSquare(color);
    if (!kingSquare) return pins;

    const kingIdx = squareToIndex(kingSquare);
    const enemy = color === 'w' ? 'b' : 'w';

    // Directions to search: 8 directions
    const dirs = [
      { dx: 1, dy: 0, d: 1 }, // right
      { dx: -1, dy: 0, d: -1 }, // left
      { dx: 0, dy: 1, d: 8 }, // down
      { dx: 0, dy: -1, d: -8 }, // up
      { dx: 1, dy: 1, d: 9 }, // down-right
      { dx: -1, dy: -1, d: -9 }, // up-left
      { dx: 1, dy: -1, d: -7 }, // up-right
      { dx: -1, dy: 1, d: 7 }, // down-left
    ];

    for (const dir of dirs) {
      let i = kingIdx + dir.d;
      let foundPin = false;
      let pinSquare: Square | null = null;
      let pinPiece: { color: string; type: string } | null = null;
      let sliderFound = false;

      while (true) {
        if (!inBounds(i)) break;
        const sq = indexToSquare(i);
        const piece = board.get(sq);
        if (piece) {
          if (piece.color === color) {
            // This is a potential pinned piece
            if (!pinPiece) {
              pinPiece = piece;
              pinSquare = sq;
            } else {
              // Found two friendly pieces in line, break
              break;
            }
          } else if (piece.color === enemy) {
            // Enemy piece: check if it can attack along this line
            const isSlider = (type: string) => ['b', 'r', 'q'].includes(type);
            if (isSlider(piece.type)) {
              // Check if direction matches sliding ability
              const isDiagonal = (dir.dx !== 0 && dir.dy !== 0);
              const isOrth = (dir.dx === 0 || dir.dy === 0);
              if ((isDiagonal && (piece.type === 'b' || piece.type === 'q')) ||
                  (isOrth && (piece.type === 'r' || piece.type === 'q'))) {
                // If we already have a pin candidate, then it's a pin
                if (pinPiece) {
                  pins.push({ square: pinSquare!, pinnedBy: sq, direction: dir.d });
                }
                // We found a slider behind, we can stop
                sliderFound = true;
                break;
              } else {
                // Not a slider for this direction, break
                break;
              }
            } else {
              // Not a slider, break
              break;
            }
          }
        } else {
          // Empty square, continue
        }
        i += dir.d;
      }
    }
    return pins;
  }

  // Compute attack map for a color (all squares attacked by any piece of that color)
  function computeAttackMap(board: Chess, color: 'w' | 'b'): Set<Square> {
    const attacked = new Set<Square>();
    const boardArray = board.board();
    for (let r = 0; r < 8; r++) {
      for (let f = 0; f < 8; f++) {
        const piece = boardArray[r][f];
        if (piece && piece.color === color) {
          const sq = indexToSquare(r * 8 + f);
          const moves = generatePseudoLegalMoves(board, sq);
          for (const target of moves) {
            attacked.add(target);
          }
        }
      }
    }
    return attacked;
  }

  // Helper: square to index
  function squareToIndex(sq: Square): number {
    return (sq.charCodeAt(0) - 97) + (8 - parseInt(sq[1])) * 8;
  }
  function indexToSquare(idx: number): Square {
    const file = String.fromCharCode(97 + (idx % 8));
    const rank = 8 - Math.floor(idx / 8);
    return `${file}${rank}` as Square;
  }
  function inBounds(i: number): boolean {
    return i >= 0 && i < 64;
  }

  // ----- Interaction handlers -----

  const onSquareClick = useCallback((square: Square) => {
    if (mode === 'attack') {
      // Toggle attack color
      setAttackColor(prev => prev === 'w' ? 'b' : 'w');
      return;
    }
    setSelectedSquare(square);
  }, [mode]);

  const onSquareHover = useCallback((square: Square | null) => {
    setHoveredSquare(square);
  }, []);

  // Update highlights based on selected square and mode
  useMemo(() => {
    if (!selectedSquare) {
      setHighlightedSquares({});
      return;
    }

    const highlights: { [key: string]: string } = {};
    const piece = game.get(selectedSquare);
    if (!piece) {
      setHighlightedSquares({});
      return;
    }

    switch (mode) {
      case 'pseudo': {
        const targets = generatePseudoLegalMoves(game, selectedSquare);
        for (const t of targets) {
          highlights[t] = 'rgba(0, 255, 0, 0.3)';
        }
        break;
      }
      case 'legal': {
        const moves = game.moves({ square: selectedSquare, verbose: true });
        for (const m of moves) {
          highlights[m.to] = 'rgba(0, 200, 255, 0.4)';
        }
        break;
      }
      case 'check': {
        // Highlight king if in check and show checking pieces
        const kingSq = game.getKingSquare(game.turn());
        if (kingSq) {
          highlights[kingSq] = 'rgba(255, 0, 0, 0.6)';
          // Also highlight checking pieces
          const attackers = game.getAttackers(kingSq, game.turn() === 'w' ? 'b' : 'w');
          for (const a of attackers) {
            highlights[a] = 'rgba(255, 200, 0, 0.5)';
          }
        }
        break;
      }
      case 'pins': {
        const pins = computePins(game, piece.color);
        for (const pin of pins) {
          highlights[pin.square] = 'rgba(255, 0, 255, 0.5)';
          // Also highlight the pinning piece
          highlights[pin.pinnedBy] = 'rgba(255, 0, 255, 0.3)';
        }
        break;
      }
      case 'attack': {
        // Show attack map for the selected color (toggle with click on board)
        const color = attackColor;
        const attacked = computeAttackMap(game, color);
        for (const sq of attacked) {
          highlights[sq] = 'rgba(255, 165, 0, 0.3)';
        }
        break;
      }
    }
    setHighlightedSquares(highlights);
  }, [selectedSquare, mode, game, attackColor]);

  // Reset highlights when mode changes
  const onModeChange = useCallback((newMode: Mode) => {
    setMode(newMode);
    setSelectedSquare(null);
    setHighlightedSquares({});
  }, []);

  // ---- UI ----

  return (
    <div className="min-h-screen bg-background pt-20 px-4 sm:px-6 lg:px-8 pb-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
            Move Generation Explorer
          </h1>
          <p className="text-muted mt-1 text-sm md:text-base">
            Interactive visual guide to chess move generation concepts
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Left column: Board and FEN input */}
          <div className="lg:col-span-2">
            <div className="glass rounded-2xl p-4 sm:p-6 border border-border bg-white/5 backdrop-blur-sm">
              <div className="max-w-[550px] mx-auto">
                <Chessboard
                  position={game.fen()}
                  onSquareClick={onSquareClick}
                  onSquareRightClick={() => {}} // ignore right click
                  onMouseOverSquare={onSquareHover}
                  boardOrientation="white"
                  customSquareStyles={{
                    ...highlightedSquares,
                    ...(selectedSquare ? { [selectedSquare]: { background: 'rgba(255, 255, 0, 0.4)' } } : {}),
                  }}
                  boardWidth={550}
                />
              </div>

              {/* FEN input */}
              <div className="mt-6 flex flex-col sm:flex-row gap-3 items-center">
                <input
                  type="text"
                  value={fen}
                  onChange={(e) => setFen(e.target.value)}
                  className="flex-1 w-full bg-white/10 border border-border rounded-lg px-4 py-2 text-sm text-white placeholder-muted focus:outline-none focus:ring-2 focus:ring-accent/40"
                  placeholder="Enter FEN position"
                />
                <button
                  onClick={() => setPosition(fen)}
                  className="text-sm font-medium bg-accent/20 hover:bg-accent/30 px-4 py-2 rounded-lg transition border border-accent/30 text-accent"
                >
                  Set Position
                </button>
                <button
                  onClick={() => setPosition(initialFen)}
                  className="text-sm font-medium bg-white/5 hover:bg-white/10 px-4 py-2 rounded-lg transition border border-border text-muted hover:text-white"
                >
                  Reset
                </button>
              </div>

              {/* Info box: show selected piece and move count */}
              <div className="mt-4 p-3 glass rounded-xl border border-border/50 bg-white/5 text-sm">
                {selectedSquare && game.get(selectedSquare) ? (
                  <div className="flex justify-between">
                    <span className="text-muted">
                      Selected: <span className="text-white font-mono">{selectedSquare}</span>
                      {' '}
                      <span className="text-white font-medium">
                        {game.get(selectedSquare)?.color === 'w' ? 'White' : 'Black'}{' '}
                        {game.get(selectedSquare)?.type.toUpperCase()}
                      </span>
                    </span>
                    <span className="text-muted">
                      {mode === 'pseudo' && (
                        <>Pseudo-legal moves: <span className="text-white">{generatePseudoLegalMoves(game, selectedSquare).length}</span></>
                      )}
                      {mode === 'legal' && (
                        <>Legal moves: <span className="text-white">{game.moves({ square: selectedSquare }).length}</span></>
                      )}
                      {mode === 'check' && (
                        <>{game.inCheck() ? '⚠️ In check' : '✅ Not in check'}</>
                      )}
                      {mode === 'pins' && (
                        <>Pins: <span className="text-white">{computePins(game, game.get(selectedSquare)!.color).length}</span></>
                      )}
                      {mode === 'attack' && (
                        <>Attacks by {attackColor === 'w' ? 'White' : 'Black'}: <span className="text-white">{computeAttackMap(game, attackColor).size}</span></>
                      )}
                    </span>
                  </div>
                ) : (
                  <span className="text-muted">Click a square to analyze</span>
                )}
              </div>
            </div>
          </div>

          {/* Right column: Mode selector and legend */}
          <div className="space-y-4">
            <div className="glass rounded-2xl p-4 border border-border bg-white/5 backdrop-blur-sm">
              <h3 className="text-sm font-semibold text-muted uppercase tracking-wider mb-3">Mode</h3>
              <div className="flex flex-wrap gap-2">
                {(['pseudo', 'legal', 'check', 'pins', 'attack'] as Mode[]).map((m) => (
                  <button
                    key={m}
                    onClick={() => onModeChange(m)}
                    className={`text-xs font-medium px-3 py-1.5 rounded-full transition border ${
                      mode === m
                        ? 'bg-accent/20 border-accent/30 text-accent'
                        : 'bg-white/5 border-border text-muted hover:text-white hover:bg-white/10'
                    }`}
                  >
                    {m.charAt(0).toUpperCase() + m.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div className="glass rounded-2xl p-4 border border-border bg-white/5 backdrop-blur-sm">
              <h3 className="text-sm font-semibold text-muted uppercase tracking-wider mb-2">Legend</h3>
              <div className="space-y-2 text-xs">
                {mode === 'pseudo' && (
                  <>
                    <div className="flex items-center gap-2">
                      <span className="w-4 h-4 rounded" style={{ background: 'rgba(0, 255, 0, 0.3)' }}></span>
                      <span className="text-muted">Pseudo-legal move targets</span>
                    </div>
                    <p className="text-muted/70 mt-1">Moves generated by piece movement rules, ignoring king safety.</p>
                  </>
                )}
                {mode === 'legal' && (
                  <>
                    <div className="flex items-center gap-2">
                      <span className="w-4 h-4 rounded" style={{ background: 'rgba(0, 200, 255, 0.4)' }}></span>
                      <span className="text-muted">Legal move targets</span>
                    </div>
                    <p className="text-muted/70 mt-1">Moves that do not leave your king in check.</p>
                  </>
                )}
                {mode === 'check' && (
                  <>
                    <div className="flex items-center gap-2">
                      <span className="w-4 h-4 rounded" style={{ background: 'rgba(255, 0, 0, 0.6)' }}></span>
                      <span className="text-muted">King in check</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-4 h-4 rounded" style={{ background: 'rgba(255, 200, 0, 0.5)' }}></span>
                      <span className="text-muted">Checking pieces</span>
                    </div>
                    <p className="text-muted/70 mt-1">Detects if the side to move is in check and shows the attacker(s).</p>
                  </>
                )}
                {mode === 'pins' && (
                  <>
                    <div className="flex items-center gap-2">
                      <span className="w-4 h-4 rounded" style={{ background: 'rgba(255, 0, 255, 0.5)' }}></span>
                      <span className="text-muted">Pinned piece</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-4 h-4 rounded" style={{ background: 'rgba(255, 0, 255, 0.3)' }}></span>
                      <span className="text-muted">Pinning piece</span>
                    </div>
                    <p className="text-muted/70 mt-1">Pieces that are pinned to the king; moving them would expose check.</p>
                  </>
                )}
                {mode === 'attack' && (
                  <>
                    <div className="flex items-center gap-2">
                      <span className="w-4 h-4 rounded" style={{ background: 'rgba(255, 165, 0, 0.3)' }}></span>
                      <span className="text-muted">Attacked squares</span>
                    </div>
                    <p className="text-muted/70 mt-1">
                      All squares attacked by {attackColor === 'w' ? 'White' : 'Black'}.
                      Click board to toggle color.
                    </p>
                  </>
                )}
              </div>
            </div>

            <div className="glass rounded-2xl p-4 border border-border bg-white/5 backdrop-blur-sm">
              <h3 className="text-sm font-semibold text-muted uppercase tracking-wider mb-2">Controls</h3>
              <ul className="text-xs text-muted space-y-1 list-disc list-inside">
                <li>Click a square to select a piece</li>
                <li>Hover over squares (optional)</li>
                <li>Use FEN input to load positions</li>
                <li>Switch modes to explore different concepts</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}