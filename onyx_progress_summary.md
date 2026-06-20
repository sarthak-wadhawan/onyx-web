# Onyx Chess Web App - Project Status Summary (Snapshot)

**1. Architecture & Tech Stack:**
*   **Frontend/API Layer:** TypeScript / React (Context inferred from hooks).
*   **Backend Core Logic:** C++ compiled to WebAssembly (`engine-wasm`).
*   **Interaction Pattern:** Standard FEN string passed client $\to$ WASM binding layer.

**2. Completed Features (JS/TS Layer):**
*   ✅ **FEN Parser Utility:** The core parsing logic is complete and stored in `src/utils/fen-parser.ts`. It reliably splits the 6 FEN components into structured data.
*   ✅ **Engine Wrapper Update:** `./lib/engine-wasm.ts` has been updated to call `parseFen()`, effectively implementing a robust, validated, and canonicalizing wrapper layer for all WASM calls using the FEN string.

**3. Current Blocker / Active Task (C++ Backend):**
*   The effort is focused on fully rewriting the native C++ engine backend (`board.cpp`) to consume the structured FEN data provided by the new JS wrapper.
*   Due to persistent tooling errors, direct file modification of `board.h`, `uci.cpp`, and `board.cpp` has been halted. The solution is now codified in `FEN_PATCH.md`.

**4. Immediate Next Step:**
Manually copy the full C++ code from the **`FEN_PATCH.md`** blueprint into your local `board.cpp` file to complete Phase 2 and validate the structured state initialization in the core engine logic.