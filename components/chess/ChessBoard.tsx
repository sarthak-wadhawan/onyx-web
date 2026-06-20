'use client';

import { useEffect, useRef } from 'react';
import Script from 'next/script';

interface ChessBoardProps {
  position: string;
  orientation: 'white' | 'black';
  onMove: (from: string, to: string) => void;
  onFlip: () => void;
  disabled?: boolean;
}

export function ChessBoard({ position, orientation, onMove, disabled }: ChessBoardProps) {
  const boardRef = useRef<HTMLDivElement>(null);
  const boardInstance = useRef<any>(null);

  useEffect(() => {
    // Only initialize if Chessboard exists (loaded by script)
    const initBoard = () => {
      const Chessboard = (window as any).Chessboard;
      if (boardRef.current && Chessboard) {
        boardInstance.current = Chessboard(boardRef.current, {
          position: position,
          orientation: orientation,
          draggable: !disabled,
          pieceTheme: 'https://chessboardjs.com/img/chesspieces/wikipedia/{piece}.png',
          onDragStart: (source: string, piece: string, position: any, orientation: string) => {
            if (disabled) return false;
            const color = piece.charAt(0);
            return (color === 'w' && orientation === 'white') || (color === 'b' && orientation === 'black');
          },
          onDrop: (source: string, target: string) => {
            onMove(source, target);
            return 'snapback';
          },
        });
      }
    };

    // Check if jQuery and Chessboard are already available
    if ((window as any).jQuery && (window as any).Chessboard) {
      initBoard();
    }

    return () => {
      if (boardInstance.current) {
        boardInstance.current.destroy();
        boardInstance.current = null;
      }
    };
  }, [position, orientation, disabled, onMove]); 

  return (
    <>
      {/* 1. Load jQuery first (required dependency for chessboard.js) */}
      <Script
        src="https://code.jquery.com/jquery-3.6.0.min.js"
        strategy="beforeInteractive"
      />
      {/* 2. Load chessboard.js after jQuery */}
      <Script
        src="https://cdnjs.cloudflare.com/ajax/libs/chessboard-js/1.0.0/chessboard-1.0.0.min.js"
        strategy="afterInteractive"
        onLoad={() => {
            // Re-initialize once script loads
            const Chessboard = (window as any).Chessboard;
            if (boardRef.current && Chessboard && !boardInstance.current) {
                // We use a small timeout to ensure DOM is fully ready
                setTimeout(() => {
                    if (boardRef.current && !boardInstance.current) {
                         boardInstance.current = Chessboard(boardRef.current, {
                            position: position,
                            orientation: orientation,
                            draggable: !disabled,
                         });
                    }
                }, 100);
            }
        }}
      />
      
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/chessboard-js/1.0.0/chessboard-1.0.0.min.css"
      />
      
      <div ref={boardRef} className="w-full max-w-[500px] mx-auto aspect-square" />
    </>
  );
}