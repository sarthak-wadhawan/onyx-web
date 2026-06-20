# Onyx Chess Web App - Project Context

**Architecture & Tech Stack:**
- **Frontend:** Next.js (App Router), React, TypeScript, Tailwind CSS.
- **Backend/Engine:** Custom C++ Chess Engine (Negamax/Alpha-Beta) compiled to raw WebAssembly (`public/engine.wasm`).
- **Bridge:** Native WebAssembly instantiation in `lib/engine-wasm.ts`. No Emscripten `engine.js` glue code is used.

**Completed Features:**
- C++ Engine: Board evaluation, move generation, and check detection.
- C++ Engine: Custom FEN parsing natively implemented (`initialize_board` with FEN string).
- Web: TypeScript FEN parser utility (`src/utils/fen-parser.ts`) wraps the input before sending it to WASM.

**Active Sprint: WASM Wrapper Verification**
We need to ensure `lib/engine-wasm.ts` successfully fetches `/engine.wasm`, initializes it, and exposes the `initEngine()`, `getMove()`, and `evaluatePosition()` functions before we build the UI.

*   **Primary C++ Engine Directory:** The complete, authoritative source code for the core chess engine logic (including search algorithms, move generation, and board state management) resides in an external directory at `~/Desktop/chess-engine`.
*   **Constraint on Modification:** Modifications **must not** change the internal mechanics of the existing powerful components. We are restricted to modifying only the **initialization layer**—the entry point function (likely within `uci.cpp`)—to perform FEN parsing.
*   **Goal:** The objective is to translate an incoming FEN string into the engine's existing internal state representation, thereby linking our high-level web API to the low-level C++ search capabilities without altering core functionality.

