'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import Head from 'next/head';
import { Chess } from 'chess.js';
import { ChessBoard } from '@/components/chess/ChessBoard';
import { EngineStats } from '@/components/chess/EngineStats';
import { EvaluationBar } from '@/components/chess/EvaluationBar';
import { MoveHistory } from '@/components/chess/MoveHistory';
import { Controls } from '@/components/chess/Controls';
import { useEngine } from '@/hooks/useEngine';

// Mock engine: returns a random legal move after a delay
function getMockEngineMove(game: Chess): Promise<string> {
  return new Promise((resolve) => {
    const moves = game.moves({ verbose: true });
    if (moves.length === 0) {
      resolve('');
      return;
    }
    // Simulate thinking time
    const delay = 200 + Math.random() * 300;
    setTimeout(() => {
      const randomIndex = Math.floor(Math.random() * moves.length);
      resolve(moves[randomIndex].from + moves[randomIndex].to + (moves[randomIndex].promotion ? moves[randomIndex].promotion : ''));
    }, delay);
  });
}

export default function PlayPage() {
  // Game state using chess.js
  const [game, setGame] = useState<Chess>(() => new Chess());
  const [position, setPosition] = useState<string>(() => game.fen());
  const [orientation, setOrientation] = useState<'white' | 'black'>('white');
  const [moveHistory, setMoveHistory] = useState<string[]>([]);
  const [isEngineThinking, setIsEngineThinking] = useState(false);
  const { getMove, isThinking, error, lastMove } = useEngine();

  // Stats (from engine)
  const [stats, setStats] = useState({
    depth: 4,
    nodes: 0,
    nps: 0,
    score: 0,
    bestMove: '',
    time: 0,
  });

  // Update position when game changes
  const updatePosition = useCallback(() => {
    setPosition(game.fen());
    setMoveHistory(game.history());
  }, [game]);

  // Handle move made by user
  const handleMove = useCallback((from: string, to: string) => {
    if (isThinking) return;
    const move = game.move({ from, to, promotion: 'q' });
    if (move) {
      updatePosition();
      // After user move, trigger engine move
      setTimeout(() => triggerEngineMove(), 100);
    }
  }, [game, isThinking, updatePosition]);

  // Trigger engine move via API
  const triggerEngineMove = useCallback(async () => {
    if (game.game_over() || isThinking) return;
    try {
      const fen = game.fen();
      const result = await getMove(fen, { depth: 4 });
      const moveStr = result.move;
      if (moveStr) {
        const from = moveStr.substring(0, 2);
        const to = moveStr.substring(2, 4);
        const promotion = moveStr.length === 5 ? moveStr[4] : undefined;
        const move = game.move({ from, to, promotion });
        if (move) {
          updatePosition();
          setStats({
            depth: 4,
            nodes: result.nodes,
            nps: Math.round(result.nodes / (result.time / 1000)) || 0,
            score: result.score,
            bestMove: moveStr,
            time: result.time,
          });
        }
      }
    } catch (err) {
      console.error('Engine error:', err);
      // Optionally fallback to mock? We'll just show error in UI
    }

  }, [game, isThinking, updatePosition]);

  // New game
  const handleNewGame = useCallback(() => {
    const newGame = new Chess();
    setGame(newGame);
    setPosition(newGame.fen());
    setMoveHistory([]);
    setStats({
      depth: 4,
      nodes: 0,
      nps: 0,
      score: 0,
      bestMove: '',
      time: 0,
    });
  }, []);

  // Undo last move
  const handleUndo = useCallback(() => {
    if (isEngineThinking) return;
    if (game.history().length > 0) {
      game.undo();
      // Also undo engine move if any? We'll just undo one move.
      // This might be two moves (user + engine). We'll allow undo multiple.
      // For simplicity, undo two moves if possible.
      if (game.history().length > 0 && !game.isCheckmate()) {
        game.undo();
      }
      updatePosition();
    }
  }, [game, isEngineThinking, updatePosition]);

  // Flip board
  const handleFlip = useCallback(() => {
    setOrientation(prev => prev === 'white' ? 'black' : 'white');
  }, []);

  // Check for game over
  const isGameOver = game.isGameOver();

  // Side to move
  const sideToMove = game.turn() === 'w' ? 'w' : 'b';

  // Computer thinking indicator
  const disabled = isEngineThinking || isGameOver;

  return (
    <>
      <Head>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/chessboard-js/1.0.0/chessboard-1.0.0.min.css"
        />
      </Head>
      <div className="min-h-screen bg-background pt-20 px-4 sm:px-6 lg:px-8 pb-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-white mb-6">Play the Engine</h1>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Board + Controls */}
            <div className="lg:col-span-2">
              <div className="glass rounded-2xl p-4 border border-border">
                <ChessBoard
                  position={position}
                  orientation={orientation}
                  onMove={handleMove}
                  onFlip={handleFlip}
                  disabled={disabled}
                />
                <Controls
                  onNewGame={handleNewGame}
                  onUndo={handleUndo}
                  onFlip={handleFlip}
                  onEngineMove={triggerEngineMove}
                  disabled={disabled}
                />
                {isGameOver && (
                  <div className="mt-4 text-center text-sm font-medium text-white bg-white/10 rounded-xl py-2 px-4 border border-border">
                    {game.isCheckmate() ? 'Checkmate! ' : 'Draw! '}
                    {game.turn() === 'w' ? 'Black' : 'White'} wins.
                  </div>
                )}
                {isEngineThinking && (
                  <div className="mt-4 text-center text-sm text-muted">
                    Engine is thinking...
                  </div>
                )}
              </div>
            </div>

            {/* Side panels */}
            <div className="space-y-4">
              <EngineStats
                depth={stats.depth}
                nodes={stats.nodes}
                nps={stats.nps}
                score={stats.score}
                bestMove={stats.bestMove}
                time={stats.time}
              />
              <EvaluationBar score={stats.score} sideToMove={sideToMove} />
              <MoveHistory moves={moveHistory} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}