// lib/engine-wasm.ts
let wasmExports: any = null;
let memory: WebAssembly.Memory | null = null;

async function loadWasm(): Promise<void> {
  if (wasmExports) return;
  const response = await fetch('/engine.wasm');
  const buffer = await response.arrayBuffer();
  const result = await WebAssembly.instantiate(buffer, {
    env: {
      // If the wasm uses any imports, provide them here.
    }
  });
  wasmExports = result.instance.exports;
  memory = wasmExports.memory as WebAssembly.Memory;
}

function allocString(str: string): number {
  if (!wasmExports || !memory) throw new Error('WASM not loaded');
  const encoder = new TextEncoder();
  const data = encoder.encode(str);
  const ptr = wasmExports._malloc(data.length + 1);
  const mem = new Uint8Array(memory.buffer);
  mem.set(data, ptr);
  mem[ptr + data.length] = 0;
  return ptr;
}

function freeString(ptr: number): void {
  if (wasmExports) wasmExports._free(ptr);
}

function readCString(ptr: number): string {
  if (!wasmExports || !memory) throw new Error('WASM not loaded');
  const mem = new Uint8Array(memory.buffer);
  let end = ptr;
  while (mem[end] !== 0) end++;
  const decoder = new TextDecoder();
  return decoder.decode(mem.slice(ptr, end));
}

export async function getEngineMove(fen: string, depth: number): Promise<{ move: string; score: number; nodes: number; time: number }> {
  await loadWasm();
  if (!wasmExports) throw new Error('WASM not loaded');

  // Set the board from FEN
  const fenPtr = allocString(fen);
  wasmExports._setFen(fenPtr);
  freeString(fenPtr);

  // Evaluate position (optional)
  const score = wasmExports._evaluate();

  // Get move
  const movePtr = wasmExports._getMove(depth);
  const move = readCString(movePtr);
  freeString(movePtr);

  // We don't have nodes/time from the current engine, but we can return dummy
  return {
    move,
    score,
    nodes: 0,
    time: 0,
  };
}