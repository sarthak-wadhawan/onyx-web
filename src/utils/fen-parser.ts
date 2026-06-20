// src/utils/fen-parser.ts (New Utility File)
/**
 * @fileoverview A robust parser for converting Forsyth–Edwards Notation (FEN) strings
 * into structured, usable components for the chess engine core.
 */

interface FenComponents {
    ranks: string;         // e.g., "rnbqkbnr/pppppppp/8/8/8/PPPPPPPP/rnbqkbnr/RNBQKBNR"
    activeColor: 'w' | 'b'; // Current side to move
    castlingRights: string;  // e.g., "KQkq"
    enPassantTarget: ?string; // Target square, or null if inactive
    halfmoveClock: number;   // Number of halfmoves since last capture/pawn move
    fullmoveNumber: number;  // Full move counter
}

/**
 * Parses a standard 6-part FEN string into structured components.
 * @param fen The full 6-part FEN string.
 * @returns An object containing all parsed state components.
 */
export function parseFen(fen: string): FenComponents {
    const parts = fen.trim().split(/\s+/);

    if (parts.length !== 6) {
        throw new Error("Invalid FEN string: Must contain exactly 6 space-separated parts.");
    }

    // The core parsing logic for the components must be added here, utilizing deep chess knowledge.
    return {
        ranks: parts[0],
        activeColor: parts[1].startsWith('w') ? 'w' : (parts[1].startsWith('b') ? 'b' : ''),
        castlingRights: parts[2] || '',
        enPassantTarget: parts[3] === '-' ? null : parts[3],
        halfmoveClock: parseInt(parts[4]) || 0,
        fullmoveNumber: parseInt(parts[5]) || 1,
    };
}