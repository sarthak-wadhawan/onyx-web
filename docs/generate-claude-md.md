You are acting as a senior software architect and Claude Code project maintainer.

Your task is to create and maintain a production-quality CLAUDE.md file for this repository.

Before writing:

* Inspect all source files that are relevant to the project architecture.
* Prefer implementation details over comments.
* Do not infer features that are not present in code.
* If information cannot be verified from code, explicitly mark it as "Unknown" or "Not Yet Implemented".

GOAL

Produce a concise but comprehensive project memory document that allows Claude Code, DeepSeek, Gemma, Qwen, and other coding agents to understand the repository without repeatedly scanning the entire codebase.

Optimize for:

* small context windows
* low token usage
* fast onboarding
* future maintenance

General Rules:

* Prefer bullet points over paragraphs.
* Remove repetition aggressively.
* Preserve architectural decisions.
* Focus on implementation reality.
* Keep the document concise.
* Prioritize facts that affect future code changes.
* Update existing sections instead of creating duplicates.

OUTPUT FORMAT

# Project Overview

* What the project is
* Current implementation state
* Primary goals

# Tech Stack

List all technologies actually used.

# Repository Structure

Provide a concise tree of important folders and files.

For each entry include:

* purpose
* ownership
* dependencies (if important)

# System Architecture

Document:

* frontend architecture
* backend architecture
* communication flow
* build process
* deployment assumptions

Use concise diagrams where useful.

# Chess Engine Architecture

Document:

## Board Representation

* board state structure
* piece encoding
* side-to-move handling
* castling rights
* en passant state

## Move Generation

* pseudo-legal generation flow
* legal move filtering
* attack detection

## Evaluation

* material evaluation
* positional evaluation
* heuristics

## Search

* search algorithm
* alpha-beta pruning
* iterative deepening
* move ordering

## Performance

* optimizations
* memory considerations

## Integration

* UCI support
* WebAssembly support
* API interfaces

Only document features verified in code.

# Frontend Architecture

Document:

* Next.js structure
* React components
* state management
* board rendering
* engine communication
* API routes

If frontend is incomplete, document intended architecture separately.

# Data Flow

Describe:

User Move
→ Frontend
→ Engine
→ Response
→ UI Update

Use short flow diagrams.

# Build & Run

Document exact commands required.

Include:

* install
* development
* build
* test
* wasm compilation

# Development Rules

Create concise rules for future agents.

Examples:

* Keep move generation allocation-free.
* Preserve WASM API compatibility.
* Avoid duplicate state sources.
* Follow existing engine conventions.
* Maintain deterministic search behavior.

Only include rules supported by the current codebase.

# Known Constraints

Document:

* performance requirements
* architecture limitations
* unfinished features
* technical debt

# Current Status

Separate into:

Implemented
In Progress
Planned

# Quick Context For Future Agents

Create 20–40 high-value bullets.

Each bullet should contain a fact that reduces future repository scanning.

Examples:

* Main search entry point is ...
* Legal move generation occurs in ...
* Evaluation entry point is ...
* WASM wrapper located in ...
* Frontend board component located in ...

REQUIREMENTS

1. Inspect code before writing.
2. Prefer code over comments.
3. Minimize token usage.
4. Avoid repetition.
5. Keep output useful as long-term memory.
6. Update existing CLAUDE.md if present.
7. Output only the final CLAUDE.md contents.
8. Do not explain reasoning.
9. Optimize specifically for Claude Code and local coding agents.
