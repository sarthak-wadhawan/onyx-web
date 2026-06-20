// app/play/page.tsx
'use client';

import { useState, useCallback, useEffect } from 'react';
import Head from 'next/head';
import { Chess } from 'chess.js';
import { Chessboard } from 'react-chessboard';
import { EngineStats } from '@/components/chess/EngineStats';
import { EvaluationBar } from '@/components/chess/EvaluationBar';
import { MoveHistory } from '@/components/chess/MoveHistory';
import { Controls } from '@/components/chess/Controls';
import { initEngine, getMove, evaluatePosition, getInitError } from '@/lib/engine-wasm';

export default function PlayPage() {
  const [game] = useState(() => new Chess());
  const [fen, setFen] = useState(() => game.fen());
  const [orientation, setOrientation] = useState<'white' | 'black'>('white');
  const [moveHistory, setMoveHistory] = useState<string[]>(() => game.history());

  const [engineReady, setEngineReady] = useState(false);
  const [thinking, setThinking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [stats, setStats] = useState({
    depth: 4,
    nodes: 0,
    nps: 0,
    score: 0,
    bestMove: '',
    time: 0,
  });

  useEffect(() => {
    let mounted = true;
    const init = async () => {
      try {
        const ok = await initEngine();
        if (mounted) {
          setEngineReady(ok);
          if (!ok) {
            const errMsg = getInitError() || 'Engine init returned false';
            setError(`Engine init failed: ${errMsg}`);
          }
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Engine init error');
        }
      }
    };
    init();
    return () => { mounted = false; };
  }, []);

  const updateUI = useCallback(() => {
    setFen(game.fen());
    setMoveHistory(game.history());
  }, [game]);

  const isGameOver = useCallback(() => {
    if (typeof game.isGameOver === 'function') return game.isGameOver();
    if (typeof game.game_over === 'function') return game.game_over();
    return (
      game.isCheckmate() ||
      game.isStalemate() ||
      game.isDraw() ||
      game.isThreefoldRepetition()
    );
  }, [game]);

  const turn = game.turn();
  const isPlayerTurn = turn === 'w';
  const isEngineTurn = turn === 'b';
  const gameOver = isGameOver();

  const makeEngineMove = useCallback(async () => {
    if (!engineReady || thinking || gameOver || !isEngineTurn) return;

    setThinking(true);
    setError(null);

    try {
      const currentFen = game.fen();
      const result = await getMove(currentFen, 4);
      const moveStr = result.move;
      if (!moveStr) throw new Error('Empty move');

      const from = moveStr.substring(0, 2);
      const to = moveStr.substring(2, 4);
      const promotion = moveStr.length === 5 ? moveStr[4] : undefined;

      const move = game.move({ from, to, promotion });
      if (!move) throw new Error(`Illegal engine move: ${moveStr}`);

      updateUI();

      try {
        const score = await evaluatePosition(game.fen());
        setStats({
          depth: 4,
          nodes: result.nodes || 0,
          nps: Math.round((result.nodes || 0) / ((result.time || 1) / 1000)) || 0,
          score: score || 0,
          bestMove: moveStr,
          time: result.time || 0,
        });
      } catch {
        setStats({
          depth: 4,
          nodes: result.nodes || 0,
          nps: Math.round((result.nodes || 0) / ((result.time || 1) / 1000)) || 0,
          score: result.score || 0,
          bestMove: moveStr,
          time: result.time || 0,
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Engine move error');
    } finally {
      setThinking(false);
    }
  }, [engineReady, thinking, gameOver, isEngineTurn, game, updateUI]);

  const handleMove = useCallback(async (source: string, target: string, piece: string | undefined) => {
    if (!engineReady || thinking || gameOver) return false;

    let promotion = undefined;
    if (piece && piece[1]?.toLowerCase() === 'p') {
      const rank = target[1];
      if ((piece[0] === 'w' && rank === '8') || (piece[0] === 'b' && rank === '1')) {
        promotion = 'q';
      }
    }

    const move = game.move({ from: source, to: target, promotion });
    if (move === null) return false;

    updateUI();

    if (!isGameOver() && !thinking && !gameOver && game.turn() === 'b') {
      await makeEngineMove();
    }
    return true;
  }, [engineReady, thinking, gameOver, isGameOver, updateUI, makeEngineMove]);

  useEffect(() => {
    if (engineReady && !thinking && !gameOver && isEngineTurn) {
      const timer = setTimeout(makeEngineMove, 200);
      return () => clearTimeout(timer);
    }
  }, [engineReady, thinking, gameOver, isEngineTurn, makeEngineMove]);

  const onDrop = useCallback(
    (source: string, target: string, piece: string) => {
      if (!engineReady || thinking || gameOver || !isPlayerTurn) return false;
      return handleMove(source, target, piece);
    },
    [engineReady, thinking, gameOver, isPlayerTurn, handleMove]
  );

  const handleNewGame = useCallback(() => {
    game.reset();
    updateUI();
    setStats({ depth: 4, nodes: 0, nps: 0, score: 0, bestMove: '', time: 0 });
    setError(null);
  }, [game, updateUI]);

  const handleUndo = useCallback(() => {
    if (thinking || !engineReady) return;
    let undone = 0;
    while (game.history().length > 0 && undone < 2) {
      game.undo();
      undone++;
    }
    if (undone > 0) updateUI();
  }, [game, thinking, engineReady, updateUI]);

  const handleFlip = useCallback(() => {
    setOrientation((prev) => (prev === 'white' ? 'black' : 'white'));
  }, []);

  const handleForceEngine = useCallback(() => {
    if (!engineReady || thinking || gameOver || !isEngineTurn) return;
    makeEngineMove();
  }, [engineReady, thinking, gameOver, isEngineTurn, makeEngineMove]);

  const disabled = thinking || !engineReady || gameOver || !isPlayerTurn;

  // Display score with sign adjusted for UI perspective
  const displayScore = stats.score;

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
          {/* Header */}
          <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
                Play the Engine
              </h1>
              <p className="text-muted mt-1 text-sm md:text-base">
                You are <span className="text-white font-medium">White</span> · Engine is{' '}
                <span className="text-white font-medium">Black</span>
                {!engineReady && !error && (
                  <span className="ml-2 inline-flex items-center gap-1">
                    <span className="animate-pulse">●</span> loading engine...
                  </span>
                )}
                {error && (
                  <span className="ml-2 text-red-400">⚠️ {error}</span>
                )}
              </p>
            </div>
            <div className="flex items-center gap-3 text-sm text-muted">
              {thinking && (
                <span className="inline-flex items-center gap-2 bg-accent/10 px-3 py-1 rounded-full border border-accent/20">
                  <span className="w-2 h-2 bg-accent rounded-full animate-pulse" />
                  Thinking...
                </span>
              )}
              {gameOver && (
                <span className="inline-flex items-center gap-2 bg-white/5 px-3 py-1 rounded-full border border-border">
                  {game.isCheckmate() ? '♚ Checkmate' : '½–½ Draw'}
                </span>
              )}
            </div>
          </div>

          {/* Main grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            {/* Left: Board + Controls */}
            <div className="lg:col-span-2 space-y-4">
              <div className="glass rounded-2xl p-4 sm:p-6 border border-border bg-white/5 backdrop-blur-sm">
                <div className="max-w-[550px] mx-auto aspect-square w-full">
                  <Chessboard
                    position={fen}
                    onPieceDrop={onDrop}
                    boardOrientation={orientation}
                    arePiecesDraggable={!disabled}
                    boardWidth={550}
                    customBoardStyle={{
                      borderRadius: '12px',
                      boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                    }}
                    customDarkSquareStyle={{ backgroundColor: '#779952' }}
                    customLightSquareStyle={{ backgroundColor: '#edeed1' }}
                  />
                </div>
                <Controls
                  onNewGame={handleNewGame}
                  onUndo={handleUndo}
                  onFlip={handleFlip}
                  onEngineMove={handleForceEngine}
                  disabled={disabled}
                  thinking={thinking}
                />
              </div>

              {/* Game status (mobile friendly) */}
              {error && (
                <div className="text-center text-sm text-red-400 bg-red-400/10 rounded-xl py-2 px-4 border border-red-400/20">
                  ⚠️ {error}
                </div>
              )}
            </div>

            {/* Right: Stats, Evaluation, History */}
            <div className="space-y-4 lg:space-y-5">
              <EngineStats
                depth={stats.depth}
                nodes={stats.nodes}
                nps={stats.nps}
                score={displayScore}
                bestMove={stats.bestMove}
                time={stats.time}
                thinking={thinking}
              />
              <EvaluationBar score={displayScore} sideToMove={turn} />
              <MoveHistory moves={moveHistory} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}