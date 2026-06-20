# FEN Parsing Implementation Plan - Onyx Chess Engine

**Goal:** To modify the core C++ engine (`~/Desktop/chess-engine`) to accept and process a standard Forsyth–Edwards Notation (FEN) string as input, initializing the `Board` object with all necessary game state information. This is a prerequisite for supporting arbitrary starting positions.

**Status:** Plan Approved by User. Ready for implementation.

## Dependencies & Assumptions
*   The core logic for Negamax search and move validation remains untouched.
*   Modification will focus entirely on the board initialization layer: `board.h` and `board.cpp`.
*   A helper function or private method to parse a row of pieces from FEN string is required.

## Execution Steps (Code Implementation Sequence)

**Phase 1: Signature Update & Setup**
1.  **Modify Declaration:** Update the signature in `board.h` and `uci.cpp`'s usage sites to pass `const std::string& fen`.
2.  **Modify Definition:** Update the function definition in `board.cpp`: `void initialize_board(Board& b, const std::string& fen);`

**Phase 2: FEN String Deconstruction (The Parser)**
1.  Implement robust tokenization logic to split the full FEN string into its 6 mandatory components using delimiters (`/`, space). These tokens are indexed and processed sequentially.
    *   Components expected: `[Ranks]`, `[Active Color]`, `[Castling Rights]`, `[En Passant Target]`, `[Halfmove Clock]`, `[Fullmove Number]`.

**Phase 3: Board State Population (The Engine Logic)**
This phase populates the entire internal state of the `Board` object using the tokens acquired in Phase 2.

1.  **Piece Placement:** Iterate through the rank component to sequentially populate `b.squares[64]`, handling piece characters and empty square counts.
2.  **Game State Flags (Critical):** Process the remaining components:
    *   **Active Color:** Set `b.side_to_move` based on 'w' or 'b'.
    *   **Castling Rights:** Parse the algebraic characters (K, Q, k, q) and apply bitwise OR operations to set `b.castling_rights`.
    *   **En Passant Target:** Check for `!` and use specialized logic (including helper functions like `algebaraic_to_sq`) to correctly map the target square into `b.ep_square_number`.
    *   **Move Counters:** Set `b.full_move_number` and initialize `b.half_move_clock` (usually to 0 upon initialization).

This plan provides a clean, contained sequence of modifications for the C++ files within `~/Desktop/chess-engine`.