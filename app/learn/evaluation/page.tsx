// app/learn/evaluation/page.tsx
'use client';

import { useState, useCallback, useEffect } from 'react';
import { Chess } from 'chess.js';
import { Chessboard } from 'react-chessboard';
import { Square } from 'react-chessboard/dist/chessboard/types';

// ------------------------------------------------------------
// Evaluation constants (simplified PeSTO midgame PST)
// ------------------------------------------------------------
const P = 100, N = 320, B = 330, R = 500, Q = 900, K = 0;

// Piece-square tables (from PeSTO, midgame, indexed by square: a1=0, b1=1, ..., h8=63)
const PST: { [piece: string]: number[] } = {
  p: [
     0,  0,  0,  0,  0,  0,  0,  0,
    50, 50, 50, 50, 50, 50, 50, 50,
    10, 10, 20, 30, 30, 20, 10, 10,
     5,  5, 10, 25, 25, 10,  5,  5,
     0,  0,  0, 20, 20,  0,  0,  0,
     5, -5,-10,  0,  0,-10, -5,  5,
     5, 10, 10,-20,-20, 10, 10,  5,
     0,  0,  0,  0,  0,  0,  0,  0
  ],
  n: [
    -50,-40,-30,-30,-30,-30,-40,-50,
    -40,-20,  0,  0,  0,  0,-20,-40,
    -30,  0, 10, 15, 15, 10,  0,-30,
    -30,  5, 15, 20, 20, 15,  5,-30,
    -30,  0, 15, 20, 20, 15,  0,-30,
    -30,  5, 10, 15, 15, 10,  5,-30,
    -40,-20,  0,  5,  5,  0,-20,-40,
    -50,-40,-30,-30,-30,-30,-40,-50
  ],
  b: [
    -20,-10,-10,-10,-10,-10,-10,-20,
    -10,  0,  0,  0,  0,  0,  0,-10,
    -10,  0,  5, 10, 10,  5,  0,-10,
    -10,  5,  5, 10, 10,  5,  5,-10,
    -10,  0, 10, 10, 10, 10,  0,-10,
    -10, 10, 10, 10, 10, 10, 10,-10,
    -10,  5,  0,  0,  0,  0,  5,-10,
    -20,-10,-10,-10,-10,-10,-10,-20
  ],
  r: [
     0,  0,  0,  0,  0,  0,  0,  0,
     5, 10, 10, 10, 10, 10, 10,  5,
    -5,  0,  0,  0,  0,  0,  0, -5,
    -5,  0,  0,  0,  0,  0,  0, -5,
    -5,  0,  0,  0,  0,  0,  0, -5,
    -5,  0,  0,  0,  0,  0,  0, -5,
    -5,  0,  0,  0,  0,  0,  0, -5,
     0,  0,  0,  5,  5,  0,  0,  0
  ],
  q: [
    -20,-10,-10, -5, -5,-10,-10,-20,
    -10,  0,  0,  0,  0,  0,  0,-10,
    -10,  0,  5,  5,  5,  5,  0,-10,
     -5,  0,  5,  5,  5,  5,  0, -5,
      0,  0,  5,  5,  5,  5,  0, -5,
    -10,  5,  5,  5,  5,  5,  0,-10,
    -10,  0,  5,  0,  0,  0,  0,-10,
    -20,-10,-10, -5, -5,-10,-10,-20
  ],
  k: [
    -30,-40,-40,-50,-50,-40,-40,-30,
    -30,-40,-40,-50,-50,-40,-40,-30,
    -30,-40,-40,-50,-50,-40,-40,-30,
    -30,-40,-40,-50,-50,-40,-40,-30,
    -20,-30,-30,-40,-40,-30,-30,-20,
    -10,-20,-20,-20,-20,-20,-20,-10,
     20, 20,  0,  0,  0,  0, 20, 20,
     20, 30, 10,  0,  0, 10, 30, 20
  ]
};

// Mirror square index for black
function mirror(index: number): number {
  return 63 - index;
}

// Helper to find king square (works with any chess.js version)
function getKingSquare(board: Chess, color: 'w' | 'b'): Square | null {
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const square = `${String.fromCharCode(97 + col)}${8 - row}` as Square;
      const piece = board.get(square);
      if (piece && piece.type === 'k' && piece.color === color) {
        return square;
      }
    }
  }
  return null;
}

// ------------------------------------------------------------
// Evaluation functions
// ------------------------------------------------------------

interface EvalBreakdown {
  total: number;
  material: number;
  pst: number;
  mobility: number;
  kingSafety: number;
  whiteMaterial: number;
  blackMaterial: number;
  whitePST: number;
  blackPST: number;
  whiteMobility: number;
  blackMobility: number;
  whiteKingSafety: number;
  blackKingSafety: number;
}

function evaluatePosition(fen: string): EvalBreakdown {
  const board = new Chess(fen);
  const pieces = board.board();

  let whiteMaterial = 0, blackMaterial = 0;
  let whitePST = 0, blackPST = 0;
  let whiteMobility = 0, blackMobility = 0;
  let whiteKingSafety = 0, blackKingSafety = 0;

  const pieceValues: { [key: string]: number } = { p: P, n: N, b: B, r: R, q: Q, k: K };

  // Material and PST
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = pieces[row][col];
      if (!piece) continue;
      const squareIndex = row * 8 + col;
      const isWhite = piece.color === 'w';
      const type = piece.type;
      const value = pieceValues[type] || 0;
      if (isWhite) {
        whiteMaterial += value;
        const pstVal = PST[type] ? PST[type][squareIndex] : 0;
        whitePST += pstVal;
      } else {
        blackMaterial += value;
        const mirrored = mirror(squareIndex);
        const pstVal = PST[type] ? PST[type][mirrored] : 0;
        blackPST += pstVal;
      }
    }
  }

  // Mobility: number of legal moves for each side
  const allMoves = board.moves({ verbose: true });
  whiteMobility = allMoves.filter(m => m.color === 'w').length;
  blackMobility = allMoves.filter(m => m.color === 'b').length;

  // King safety: simple metric - count pawns near the king
  const whiteKing = getKingSquare(board, 'w');
  const blackKing = getKingSquare(board, 'b');

  function kingSafetyScore(king: Square | null, color: 'w' | 'b'): number {
    if (!king) return 0;
    const kingIdx = (king.charCodeAt(0) - 97) + (8 - parseInt(king[1])) * 8;
    const row = Math.floor(kingIdx / 8);
    const col = kingIdx % 8;
    let score = 0;
    const offsets = [-9, -8, -7, -1, 1, 7, 8, 9];
    for (const off of offsets) {
      const idx = kingIdx + off;
      if (idx < 0 || idx >= 64) continue;
      const r = Math.floor(idx / 8);
      const c = idx % 8;
      if (Math.abs(c - col) > 2) continue;
      const piece = board.get(`${String.fromCharCode(97 + c)}${8 - r}` as Square);
      if (piece && piece.color === color && piece.type === 'p') {
        score += 10;
      }
    }
    if (color === 'w') {
      if (king === 'g1' || king === 'c1') score += 20;
      if (board.get('f1') && board.get('f1')?.type === 'r' && board.get('f1')?.color === 'w') score += 10;
      if (board.get('h1') && board.get('h1')?.type === 'r' && board.get('h1')?.color === 'w') score += 10;
    } else {
      if (king === 'g8' || king === 'c8') score += 20;
      if (board.get('f8') && board.get('f8')?.type === 'r' && board.get('f8')?.color === 'b') score += 10;
      if (board.get('h8') && board.get('h8')?.type === 'r' && board.get('h8')?.color === 'b') score += 10;
    }
    return score;
  }

  whiteKingSafety = kingSafetyScore(whiteKing, 'w');
  blackKingSafety = kingSafetyScore(blackKing, 'b');

  const materialDiff = whiteMaterial - blackMaterial;
  const pstDiff = whitePST - blackPST;
  const mobilityDiff = (whiteMobility - blackMobility) * 5;
  const kingSafetyDiff = whiteKingSafety - blackKingSafety;

  const total = materialDiff + pstDiff + mobilityDiff + kingSafetyDiff;

  return {
    total,
    material: materialDiff,
    pst: pstDiff,
    mobility: mobilityDiff,
    kingSafety: kingSafetyDiff,
    whiteMaterial,
    blackMaterial,
    whitePST,
    blackPST,
    whiteMobility,
    blackMobility,
    whiteKingSafety,
    blackKingSafety,
  };
}

// Preset positions
const PRESETS: { [key: string]: { fen: string; description: string } } = {
  start: {
    fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
    description: 'Starting position',
  },
  material: {
    fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/R1BQKBNR w KQkq - 0 1',
    description: 'White missing a rook (material disadvantage)',
  },
  pst: {
    fen: 'rnbqkbnr/pppppppp/8/8/4N3/8/PPPPPPPP/R1BQKBNR w KQkq - 0 1',
    description: 'Central knight gives PST advantage',
  },
  mobility: {
    fen: 'r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 0 1',
    description: 'Open position with more mobility for White',
  },
  kingsafety: {
    fen: 'r3k2r/pppp1ppp/2n2n2/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 0 1',
    description: 'White castled (good king safety) vs Black uncastled',
  },
};

export default function EvaluationPage() {
  const [game, setGame] = useState(() => new Chess(PRESETS.start.fen));
  const [fen, setFen] = useState(PRESETS.start.fen);
  const [evalBreakdown, setEvalBreakdown] = useState<EvalBreakdown | null>(null);

  useEffect(() => {
    const evalResult = evaluatePosition(fen);
    setEvalBreakdown(evalResult);
  }, [fen]);

  const loadPreset = useCallback((key: string) => {
    const preset = PRESETS[key];
    if (!preset) return;
    const newGame = new Chess(preset.fen);
    setGame(newGame);
    setFen(newGame.fen());
  }, []);

  const onDrop = useCallback(
    (source: Square, target: Square, piece: string) => {
      const move = game.move({ from: source, to: target, promotion: 'q' });
      if (!move) return false;
      setFen(game.fen());
      return true;
    },
    [game]
  );

  const undoMove = useCallback(() => {
    if (game.history().length === 0) return;
    game.undo();
    setFen(game.fen());
  }, [game]);

  const resetPosition = useCallback(() => {
    const newGame = new Chess(PRESETS.start.fen);
    setGame(newGame);
    setFen(newGame.fen());
  }, []);

  const setPosition = useCallback((newFen: string) => {
    try {
      const newGame = new Chess(newFen);
      setGame(newGame);
      setFen(newGame.fen());
    } catch (e) {
      alert('Invalid FEN');
    }
  }, []);

  const formatEval = (val: number) => {
    if (val === 0) return '0';
    const sign = val > 0 ? '+' : '';
    return `${sign}${(val / 100).toFixed(2)}`;
  };

  return (
    <div className="min-h-screen bg-background pt-20 px-4 sm:px-6 lg:px-8 pb-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
            Evaluation Explorer
          </h1>
          <p className="text-muted mt-1 text-sm md:text-base">
            Understand how material, piece-square tables, mobility, and king safety contribute to position evaluation
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Left: Board and controls */}
          <div className="lg:col-span-1 space-y-4">
            <div className="glass rounded-2xl p-4 border border-border bg-white/5 backdrop-blur-sm">
              <div className="max-w-[300px] mx-auto">
                <Chessboard
                  position={fen}
                  onPieceDrop={onDrop}
                  boardOrientation="white"
                  boardWidth={300}
                  customBoardStyle={{
                    borderRadius: '8px',
                  }}
                />
              </div>

              <div className="mt-4 flex flex-wrap gap-2 justify-center">
                <button
                  onClick={undoMove}
                  disabled={game.history().length === 0}
                  className="text-xs font-medium bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-full transition border border-border text-muted hover:text-white disabled:opacity-40"
                >
                  Undo
                </button>
                <button
                  onClick={resetPosition}
                  className="text-xs font-medium bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-full transition border border-border text-muted hover:text-white"
                >
                  Reset
                </button>
              </div>

              <div className="mt-3">
                <label className="text-xs text-muted block mb-1">FEN</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={fen}
                    onChange={(e) => setFen(e.target.value)}
                    className="flex-1 bg-white/10 border border-border rounded-lg px-3 py-1.5 text-sm text-white placeholder-muted focus:outline-none focus:ring-2 focus:ring-accent/40"
                  />
                  <button
                    onClick={() => setPosition(fen)}
                    className="text-sm font-medium bg-accent/20 hover:bg-accent/30 px-3 py-1.5 rounded-lg transition border border-accent/30 text-accent"
                  >
                    Apply
                  </button>
                </div>
              </div>
            </div>

            <div className="glass rounded-2xl p-4 border border-border bg-white/5 backdrop-blur-sm">
              <h3 className="text-sm font-semibold text-muted uppercase tracking-wider mb-2">Presets</h3>
              <div className="flex flex-wrap gap-2">
                {Object.entries(PRESETS).map(([key, preset]) => (
                  <button
                    key={key}
                    onClick={() => loadPreset(key)}
                    className="text-xs font-medium bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-full transition border border-border text-muted hover:text-white"
                  >
                    {key.charAt(0).toUpperCase() + key.slice(1)}
                  </button>
                ))}
              </div>
              <div className="mt-2 text-xs text-muted/60 italic">
                {Object.entries(PRESETS).find(([k]) => k === Object.keys(PRESETS).find(key => game.fen() === PRESETS[key].fen))?.[1]?.description || 'Custom position'}
              </div>
            </div>
          </div>

          {/* Right: Evaluation breakdown */}
          <div className="lg:col-span-2">
            <div className="glass rounded-2xl p-4 border border-border bg-white/5 backdrop-blur-sm">
              <h2 className="text-sm font-semibold text-muted uppercase tracking-wider mb-4">Evaluation Breakdown</h2>
              {evalBreakdown && (
                <div className="space-y-4">
                  {/* Total */}
                  <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl border border-border/50">
                    <span className="text-sm font-medium text-white">Total Evaluation</span>
                    <span className={`text-xl font-mono font-bold ${evalBreakdown.total > 0 ? 'text-green-400' : evalBreakdown.total < 0 ? 'text-red-400' : 'text-white/60'}`}>
                      {formatEval(evalBreakdown.total)}
                    </span>
                  </div>

                  {/* Components */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-white/5 rounded-xl border border-border/50">
                      <div className="text-xs text-muted">Material</div>
                      <div className="flex justify-between mt-1">
                        <span className="text-xs text-white/60">White: {evalBreakdown.whiteMaterial}</span>
                        <span className="text-xs text-white/60">Black: {evalBreakdown.blackMaterial}</span>
                      </div>
                      <div className="flex justify-between items-center mt-1">
                        <span className="text-sm font-mono font-bold">
                          {formatEval(evalBreakdown.material)}
                        </span>
                        <span className="text-xs text-muted">difference</span>
                      </div>
                    </div>

                    <div className="p-3 bg-white/5 rounded-xl border border-border/50">
                      <div className="text-xs text-muted">Piece-Square Tables</div>
                      <div className="flex justify-between mt-1">
                        <span className="text-xs text-white/60">White: {evalBreakdown.whitePST}</span>
                        <span className="text-xs text-white/60">Black: {evalBreakdown.blackPST}</span>
                      </div>
                      <div className="flex justify-between items-center mt-1">
                        <span className="text-sm font-mono font-bold">
                          {formatEval(evalBreakdown.pst)}
                        </span>
                        <span className="text-xs text-muted">difference</span>
                      </div>
                    </div>

                    <div className="p-3 bg-white/5 rounded-xl border border-border/50">
                      <div className="text-xs text-muted">Mobility (weighted)</div>
                      <div className="flex justify-between mt-1">
                        <span className="text-xs text-white/60">White: {evalBreakdown.whiteMobility}</span>
                        <span className="text-xs text-white/60">Black: {evalBreakdown.blackMobility}</span>
                      </div>
                      <div className="flex justify-between items-center mt-1">
                        <span className="text-sm font-mono font-bold">
                          {formatEval(evalBreakdown.mobility)}
                        </span>
                        <span className="text-xs text-muted">× 5 cp/move</span>
                      </div>
                    </div>

                    <div className="p-3 bg-white/5 rounded-xl border border-border/50">
                      <div className="text-xs text-muted">King Safety</div>
                      <div className="flex justify-between mt-1">
                        <span className="text-xs text-white/60">White: {evalBreakdown.whiteKingSafety}</span>
                        <span className="text-xs text-white/60">Black: {evalBreakdown.blackKingSafety}</span>
                      </div>
                      <div className="flex justify-between items-center mt-1">
                        <span className="text-sm font-mono font-bold">
                          {formatEval(evalBreakdown.kingSafety)}
                        </span>
                        <span className="text-xs text-muted">pawn shield + castling</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-2 p-3 bg-white/5 rounded-xl border border-border/50 text-xs text-muted">
                    <p><strong>How to interpret:</strong> The total evaluation (positive = White advantage) is the sum of:</p>
                    <ul className="list-disc list-inside mt-1 space-y-0.5">
                      <li><strong>Material</strong>: piece values (P=1, N=3.2, B=3.3, R=5, Q=9)</li>
                      <li><strong>Piece-Square Tables</strong>: positional bonuses for pieces on good squares (centers, advanced, etc.)</li>
                      <li><strong>Mobility</strong>: number of legal moves (weighted 5 cp per move difference)</li>
                      <li><strong>King Safety</strong>: pawn shield around king and castling status</li>
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}