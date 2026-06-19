'use client';

import { useEffect, useRef } from 'react';
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

  // Load chessboard.js and initialize
  useEffect(() => {
    // Ensure the script is loaded
    const script = document.getElementById('chessboard-js');
    if (!script) {
      // Script not loaded yet, we'll rely on the Script component to load it
      return;
    }

    // Wait for the script to be ready
    const initBoard = () => {
      if (boardRef.current && typeof window !== 'undefined' && (window as any).Chessboard) {
        const Chessboard = (window as any).Chessboard;
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
            // Check if move is legal (we'll let the parent handle it)
            // We'll call onMove and the parent will update the position.
            // If the move is invalid, we need to revert.
            // We'll have the parent check legality and then update board.
            onMove(source, target);
            // The board will be updated via position prop change
            return 'snapback'; // We'll manually update position later
          },
          onSnapEnd: () => {
            // Board animation complete
          },
        });
      }
    };

    // If Chessboard is already loaded, initialize immediately
    if ((window as any).Chessboard) {
      initBoard();
    } else {
      // Wait for the script to load
      const onLoad = () => {
        initBoard();
      };
      window.addEventListener('load', onLoad);
      return () => window.removeEventListener('load', onLoad);
    }

    return () => {
      if (boardInstance.current) {
        boardInstance.current.destroy();
        boardInstance.current = null;
      }
    };
  }, []); // Run once

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
      />
      {/* We also need the CSS; we'll include it in the page head */}
      <div ref={boardRef} className="w-full max-w-[500px] mx-auto" />
    </>
  );
}