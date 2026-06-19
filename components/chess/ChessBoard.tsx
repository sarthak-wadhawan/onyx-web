'use client';

import { useEffect, useRef, useState } from 'react';
import { Chess } from 'chess.js';
import Script from 'next/script';

interface ChessBoardProps {
  position: string; // FEN string
  orientation: 'white' | 'black';
  onMove: (from: string, to: string, promotion?: string) => void;
  onFlip: () => void;
  disabled?: boolean;
}

export function ChessBoard({ position, orientation, onMove, onFlip, disabled }: ChessBoardProps) {
  const boardRef = useRef<HTMLDivElement>(null);
  const boardInstance = useRef<any>(null);
  const [scriptReady, setScriptReady] = useState(false);

  // Initialize board once script is ready
  useEffect(() => {
    if (!scriptReady || !boardRef.current) return;

    const Chessboard = (window as any).Chessboard;
    if (!Chessboard) return;

    try {
      boardInstance.current = Chessboard(boardRef.current, {
        position: position,
        orientation: orientation,
        draggable: !disabled,
        onDragStart: (source: string, piece: string, position: any, orientation: string) => {
          // Prevent drag if disabled
          if (disabled) return false;
          // Only allow drag of own pieces
          const color = piece.charAt(0);
          return (color === 'w' && orientation === 'white') || (color === 'b' && orientation === 'black');
        },
        onDrop: (source: string, target: string) => {
          onMove(source, target);
          return 'snapback';
        },
        onSnapEnd: () => {
          // Board animation complete
        },
      });
    } catch (err) {
      console.error('Failed to initialize chessboard:', err);
    }

    return () => {
      if (boardInstance.current) {
        boardInstance.current.destroy();
        boardInstance.current = null;
      }
    };
  }, [scriptReady, disabled]);

  // Update position when prop changes
  useEffect(() => {
    if (boardInstance.current) {
      boardInstance.current.position(position);
    }
  }, [position]);

  // Update orientation
  useEffect(() => {
    if (boardInstance.current) {
      boardInstance.current.orientation(orientation);
    }
  }, [orientation]);

  // Update disabled state (drag)
  useEffect(() => {
    if (boardInstance.current) {
      boardInstance.current.draggable(!disabled);
    }
  }, [disabled]);

  return (
    <>
      {/* Load chessboard.js from CDN */}
      <Script
        id="chessboard-js"
        src="https://cdnjs.cloudflare.com/ajax/libs/chessboard-js/1.0.0/chessboard-1.0.0.min.js"
        strategy="beforeInteractive"
        onLoad={() => setScriptReady(true)}
      />
      {/* Load chessboard.js CSS */}
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/chessboard-js/1.0.0/chessboard-1.0.0.min.css"
      />
      <div ref={boardRef} className="w-full max-w-[500px] mx-auto" />
    </>
  );
}