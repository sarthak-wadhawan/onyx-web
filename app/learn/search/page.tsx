// app/learn/search/page.tsx
'use client';

import { useState, useCallback, useMemo } from 'react';
import { Chess } from 'chess.js';
import { Chessboard } from 'react-chessboard';
import { Square } from 'react-chessboard/dist/chessboard/types';

// Types for search tree
interface SearchNode {
  fen: string;
  move: string | null; // SAN move
  from: string | null;
  to: string | null;
  depth: number;
  eval: number; // evaluation from perspective of side to move at this node
  alpha: number;
  beta: number;
  children: SearchNode[];
  pruned: boolean; // whether this branch was pruned by alpha-beta
  principal: boolean; // whether this node lies on the principal variation
}

// Simple material evaluation (positive for white)
function evaluateMaterial(fen: string): number {
  const board = new Chess(fen);
  const pieces = board.board();
  let score = 0;
  const values: { [key: string]: number } = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 0 };
  for (let row of pieces) {
    for (let piece of row) {
      if (piece) {
        const val = values[piece.type] || 0;
        score += piece.color === 'w' ? val : -val;
      }
    }
  }
  return score;
}

// Search function that builds tree
function buildSearchTree(
  fen: string,
  depth: number,
  alphaBeta: boolean,
  currentDepth: number = 0,
  alpha: number = -Infinity,
  beta: number = Infinity,
  move: string | null = null,
  from: string | null = null,
  to: string | null = null
): SearchNode {
  const board = new Chess(fen);
  const node: SearchNode = {
    fen,
    move,
    from,
    to,
    depth: currentDepth,
    eval: 0,
    alpha,
    beta,
    children: [],
    pruned: false,
    principal: false,
  };

  // Terminal or max depth
  if (currentDepth >= depth || board.isGameOver()) {
    node.eval = evaluateMaterial(fen);
    return node;
  }

  // Generate moves
  const moves = board.moves({ verbose: true });
  if (moves.length === 0) {
    node.eval = evaluateMaterial(fen);
    return node;
  }

  // Sort moves by capture/promotion for better pruning
  const sortedMoves = moves.sort((a, b) => {
    const aScore = (a.flags.includes('c') ? 10 : 0) + (a.flags.includes('p') ? 5 : 0);
    const bScore = (b.flags.includes('c') ? 10 : 0) + (b.flags.includes('p') ? 5 : 0);
    return bScore - aScore;
  });

  let bestEval = -Infinity;
  let bestChild: SearchNode | null = null;

  for (const moveObj of sortedMoves) {
    // Make move
    board.move(moveObj);
    const childFen = board.fen();
    board.undo();

    // Recurse
    const child = buildSearchTree(
      childFen,
      depth,
      alphaBeta,
      currentDepth + 1,
      -beta,
      -alpha,
      moveObj.san,
      moveObj.from,
      moveObj.to
    );

    // Negamax: eval = -child.eval
    const childEval = -child.eval;

    if (childEval > bestEval) {
      bestEval = childEval;
      bestChild = child;
    }

    node.children.push(child);

    if (alphaBeta) {
      // Alpha-beta pruning
      if (childEval > alpha) {
        alpha = childEval;
      }
      if (alpha >= beta) {
        // Prune remaining children
        for (let i = node.children.length; i < sortedMoves.length; i++) {
          // We need to create dummy pruned nodes for visualization
          const dummy = {
            fen: '',
            move: sortedMoves[i].san,
            from: sortedMoves[i].from,
            to: sortedMoves[i].to,
            depth: currentDepth + 1,
            eval: 0,
            alpha: -beta,
            beta: -alpha,
            children: [],
            pruned: true,
            principal: false,
          } as SearchNode;
          node.children.push(dummy);
        }
        break;
      }
    }
  }

  // If no children (should not happen), eval = material
  if (node.children.length === 0) {
    node.eval = evaluateMaterial(fen);
  } else {
    node.eval = bestEval;
    // Mark principal variation
    if (bestChild) {
      bestChild.principal = true;
      // Also mark principal on the path?
      // We'll recursively mark
      const markPrincipal = (n: SearchNode) => {
        if (n.children.length > 0) {
          // Find child with eval = -n.eval? Actually we need to find the move that gave the best eval.
          // For simplicity, we'll assume the first child with eval == bestEval is on PV.
          // But we stored bestChild, so we know.
          // So we'll mark bestChild as principal and continue.
          n.principal = true;
          // Find the child that contributed to the eval.
          // In negamax, the eval of node is the best among children.
          // So we recursively mark the best child.
          const best = n.children.reduce((a, b) => (a.eval > b.eval ? a : b));
          if (best) markPrincipal(best);
        }
      };
      markPrincipal(node);
    }
  }

  return node;
}

// Component to visualize tree
function SearchTreeView({ node, depth }: { node: SearchNode; depth: number }) {
  if (!node) return null;

  const isLeaf = node.children.length === 0 || node.depth === depth;
  const isPruned = node.pruned;

  return (
    <ul className="tree">
      <li>
        <div
          className={`node ${isPruned ? 'pruned' : ''} ${node.principal ? 'principal' : ''}`}
          style={{
            display: 'inline-block',
            padding: '4px 8px',
            margin: '2px',
            borderRadius: '4px',
            border: node.principal ? '2px solid gold' : '1px solid #444',
            background: isPruned ? '#2a1a1a' : node.principal ? '#1a2a1a' : '#1a1a1a',
            color: '#ccc',
            fontSize: '12px',
            whiteSpace: 'nowrap',
          }}
        >
          <div>
            {node.move ? (
              <span style={{ fontWeight: 'bold' }}>{node.move}</span>
            ) : (
              <span>root</span>
            )}
          </div>
          <div style={{ fontSize: '10px' }}>
            <span>eval: {node.eval.toFixed(1)}</span>
            {node.alpha > -Infinity && (
              <span style={{ marginLeft: '8px' }}>α: {node.alpha.toFixed(1)}</span>
            )}
            {node.beta < Infinity && (
              <span style={{ marginLeft: '8px' }}>β: {node.beta.toFixed(1)}</span>
            )}
            {isPruned && <span style={{ color: '#f66' }}> ✂️</span>}
            {node.principal && <span style={{ color: 'gold' }}> ★</span>}
          </div>
        </div>
        {!isLeaf && node.children.length > 0 && (
          <ul>
            {node.children.map((child, idx) => (
              <SearchTreeView key={idx} node={child} depth={depth} />
            ))}
          </ul>
        )}
      </li>
    </ul>
  );
}

export default function SearchPage() {
  const [fen, setFen] = useState('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
  const [depth, setDepth] = useState(3);
  const [algorithm, setAlgorithm] = useState<'minimax' | 'alphabeta'>('alphabeta');
  const [searchResult, setSearchResult] = useState<SearchNode | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  const runSearch = useCallback(() => {
    setIsSearching(true);
    // Use setTimeout to avoid blocking UI
    setTimeout(() => {
      const root = buildSearchTree(fen, depth, algorithm === 'alphabeta');
      setSearchResult(root);
      setIsSearching(false);
    }, 50);
  }, [fen, depth, algorithm]);

  // Reset result when parameters change
  useMemo(() => {
    setSearchResult(null);
  }, [fen, depth, algorithm]);

  return (
    <div className="min-h-screen bg-background pt-20 px-4 sm:px-6 lg:px-8 pb-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
            Search Algorithm Visualizer
          </h1>
          <p className="text-muted mt-1 text-sm md:text-base">
            Explore minimax, alpha-beta pruning, iterative deepening, and principal variation
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Left: Board and controls */}
          <div className="lg:col-span-1">
            <div className="glass rounded-2xl p-4 border border-border bg-white/5 backdrop-blur-sm">
              <div className="max-w-[300px] mx-auto">
                <Chessboard
                  position={fen}
                  boardOrientation="white"
                  boardWidth={300}
                />
              </div>

              <div className="mt-4 space-y-3">
                <div>
                  <label className="text-xs text-muted block mb-1">FEN Position</label>
                  <input
                    type="text"
                    value={fen}
                    onChange={(e) => setFen(e.target.value)}
                    className="w-full bg-white/10 border border-border rounded-lg px-3 py-1.5 text-sm text-white placeholder-muted focus:outline-none focus:ring-2 focus:ring-accent/40"
                  />
                </div>

                <div>
                  <label className="text-xs text-muted block mb-1">Depth: {depth}</label>
                  <input
                    type="range"
                    min="1"
                    max="4"
                    value={depth}
                    onChange={(e) => setDepth(parseInt(e.target.value))}
                    className="w-full accent-accent"
                  />
                </div>

                <div>
                  <label className="text-xs text-muted block mb-1">Algorithm</label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setAlgorithm('minimax')}
                      className={`flex-1 text-xs font-medium px-3 py-1.5 rounded-lg transition border ${
                        algorithm === 'minimax'
                          ? 'bg-accent/20 border-accent/30 text-accent'
                          : 'bg-white/5 border-border text-muted hover:text-white hover:bg-white/10'
                      }`}
                    >
                      Minimax
                    </button>
                    <button
                      onClick={() => setAlgorithm('alphabeta')}
                      className={`flex-1 text-xs font-medium px-3 py-1.5 rounded-lg transition border ${
                        algorithm === 'alphabeta'
                          ? 'bg-accent/20 border-accent/30 text-accent'
                          : 'bg-white/5 border-border text-muted hover:text-white hover:bg-white/10'
                      }`}
                    >
                      Alpha-Beta
                    </button>
                  </div>
                </div>

                <button
                  onClick={runSearch}
                  disabled={isSearching}
                  className="w-full text-sm font-medium bg-accent/20 hover:bg-accent/30 px-4 py-2 rounded-lg transition border border-accent/30 text-accent disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSearching ? 'Searching...' : 'Run Search'}
                </button>
              </div>
            </div>

            {/* Legend */}
            <div className="glass rounded-2xl p-4 border border-border bg-white/5 backdrop-blur-sm mt-4">
              <h3 className="text-sm font-semibold text-muted uppercase tracking-wider mb-2">Legend</h3>
              <div className="space-y-1 text-xs text-muted">
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded" style={{ background: '#1a2a1a', border: '2px solid gold' }}></span>
                  <span>Principal Variation (best line)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded" style={{ background: '#2a1a1a', border: '1px solid #444' }}></span>
                  <span>Pruned branch (alpha-beta cut)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded" style={{ background: '#1a1a1a', border: '1px solid #444' }}></span>
                  <span>Explored node</span>
                </div>
                <div className="mt-1">
                  <span className="text-accent">✂️</span> Pruned by alpha-beta
                </div>
                <div>
                  <span className="text-gold">★</span> Principal variation node
                </div>
              </div>
            </div>
          </div>

          {/* Right: Search tree visualization */}
          <div className="lg:col-span-2">
            <div className="glass rounded-2xl p-4 border border-border bg-white/5 backdrop-blur-sm overflow-auto max-h-[80vh]">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-muted uppercase tracking-wider">
                  Search Tree
                </h2>
                {searchResult && (
                  <span className="text-xs text-muted">
                    Nodes: {countNodes(searchResult)} | Depth: {depth} | {algorithm}
                  </span>
                )}
              </div>
              <div className="overflow-x-auto">
                {searchResult ? (
                  <div className="tree-container" style={{ minWidth: 'max-content' }}>
                    <SearchTreeView node={searchResult} depth={depth} />
                  </div>
                ) : (
                  <div className="text-center text-muted py-12">
                    {isSearching ? 'Searching...' : 'Run a search to visualize the tree'}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .tree {
          list-style: none;
          padding-left: 20px;
          margin: 0;
        }
        .tree li {
          position: relative;
          padding-left: 20px;
          margin: 0;
        }
        .tree li::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          bottom: 0;
          width: 1px;
          background: #444;
        }
        .tree li::after {
          content: '';
          position: absolute;
          top: 50%;
          left: 0;
          width: 20px;
          height: 1px;
          background: #444;
        }
        .tree li:last-child::before {
          height: 50%;
        }
        .tree li:only-child::before {
          display: none;
        }
        .tree li:only-child::after {
          display: none;
        }
        .tree ul {
          padding-left: 20px;
          margin: 0;
        }
        .node {
          position: relative;
          margin: 4px 0;
        }
        .node.pruned {
          opacity: 0.6;
          text-decoration: line-through;
        }
        .node.principal {
          border-color: gold !important;
        }
        .tree-container {
          padding: 10px;
          background: #0a0a0a;
          border-radius: 8px;
        }
      `}</style>
    </div>
  );
}

// Helper to count nodes
function countNodes(node: SearchNode): number {
  let count = 1;
  for (const child of node.children) {
    count += countNodes(child);
  }
  return count;
}