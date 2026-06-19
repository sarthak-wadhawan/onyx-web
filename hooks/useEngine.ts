'use client';

import { useState, useCallback } from 'react';

interface EngineResponse {
  move: string;
  nodes: number;
  score: number;
  time: number;
}

export function useEngine() {
  const [isThinking, setIsThinking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastMove, setLastMove] = useState<string | null>(null);

  const getMove = useCallback(
    async (fen: string, options: { depth?: number } = {}): Promise<EngineResponse> => {
      setIsThinking(true);
      setError(null);

      try {
        const response = await fetch('/api/engine/move', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ fen, depth: options.depth || 4 }),
        });

        if (!response.ok) {
          throw new Error(`Engine error: ${response.statusText}`);
        }

        const data: EngineResponse = await response.json();
        setLastMove(data.move);
        return data;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        setError(errorMessage);
        throw err;
      } finally {
        setIsThinking(false);
      }
    },
    []
  );

  return { getMove, isThinking, error, lastMove };
}
