/**
 * WASM engine wrapper with complete imports for Emscripten/WASI.
 */

interface EngineExports {
  memory: WebAssembly.Memory;
  _malloc: (size: number) => number;
  _free: (ptr: number) => void;
  _initEngine?: () => void;  // Optional - may not be exported by C++ engine
  _setBoardFromFen?: (fenPtr: number) => void;  // Optional
  _getMove: (fenPtr: number, depth: number) => number;
  _evaluatePosition: (fenPtr: number) => number;
  [key: string]: any;  // Allow other exported functions
}

let wasmExports: EngineExports | null = null;
let initError: string | null = null;

function writeString(ptr: number, str: string): void {
  const encoder = new TextEncoder();
  const data = encoder.encode(str + '\0');
  const mem = new Uint8Array(wasmExports!.memory.buffer);
  mem.set(data, ptr);
}

function readString(ptr: number): string {
  const mem = new Uint8Array(wasmExports!.memory.buffer);
  let end = ptr;
  while (end < mem.length && mem[end] !== 0) end++;
  return new TextDecoder().decode(mem.subarray(ptr, end));
}

function createImports() {
  const memory = new WebAssembly.Memory({ initial: 256, maximum: 512 });

  // Emscripten environment functions
  const env = {
    memory,
    __wasm_call_ctors: () => {},
    __stack_pointer: 0,
    emscripten_notify_memory_growth: (index: number) => {},
    getTempRet0: () => 0,
    setTempRet0: (value: number) => {},
    __growWasmMemory: (pages: number) => memory.grow(pages),
    abort: (message: number, fileName: number, lineNumber: number, columnNumber: number) => {
      console.error('WASM abort called');
    },
  };

  // Full WASI imports (all common functions)
  const wasi = {
    fd_write: (fd: number, iov: number, iovcnt: number, pnum: number) => 0,
    fd_read: (fd: number, iov: number, iovcnt: number, pnum: number) => 0,  // <-- added
    fd_close: (fd: number) => 0,
    fd_seek: (fd: number, offset: number, whence: number, newOffset: number) => 0,
    fd_fdstat_get: (fd: number, stat: number) => 0,
    fd_advise: (fd: number, offset: number, len: number, advice: number) => 0,
    fd_allocate: (fd: number, offset: number, len: number) => 0,
    fd_datasync: (fd: number) => 0,
    fd_sync: (fd: number) => 0,
    fd_pwrite: (fd: number, iov: number, iovcnt: number, offset: number, pnum: number) => 0,
    fd_pread: (fd: number, iov: number, iovcnt: number, offset: number, pnum: number) => 0,
    proc_exit: (code: number) => {},
    environ_get: (environ: number, environ_buf: number) => 0,
    environ_sizes_get: (penviron_count: number, penviron_buf_size: number) => 0,
    clock_time_get: (id: number, precision: number, time: number) => 0,
    clock_res_get: (id: number, resolution: number) => 0,
    path_open: (fd: number, dirflags: number, path: number, path_len: number, oflags: number, fs_rights_base: number, fs_rights_inheriting: number, fdflags: number, opened_fd: number) => 0,
    path_filestat_get: (fd: number, flags: number, path: number, path_len: number, buf: number) => 0,
    path_filestat_set_times: (fd: number, flags: number, path: number, path_len: number, atim: number, mtim: number, fst_flags: number) => 0,
    path_create_directory: (fd: number, path: number, path_len: number) => 0,
    path_remove_directory: (fd: number, path: number, path_len: number) => 0,
    path_unlink_file: (fd: number, path: number, path_len: number) => 0,
    path_symlink: (old_path: number, old_path_len: number, fd: number, new_path: number, new_path_len: number) => 0,
    path_readlink: (fd: number, path: number, path_len: number, buf: number, buf_len: number, buf_used: number) => 0,
    path_rename: (old_fd: number, old_path: number, old_path_len: number, new_fd: number, new_path: number, new_path_len: number) => 0,
    path_link: (old_fd: number, old_flags: number, old_path: number, old_path_len: number, new_fd: number, new_path: number, new_path_len: number) => 0,
  };

  return { env, wasi_snapshot_preview1: wasi };
}

async function loadWasm(): Promise<void> {
  if (wasmExports) return;

  const response = await fetch('/engine.wasm');
  if (!response.ok) {
    throw new Error(`HTTP ${response.status} fetching engine.wasm`);
  }

  const bytes = await response.arrayBuffer();
  const imports = createImports();

  try {
    const { instance } = await WebAssembly.instantiate(bytes, imports);
    wasmExports = instance.exports as unknown as EngineExports;

    // Log available exports for debugging
    const exportedFunctions = Object.keys(wasmExports).filter(key => typeof wasmExports![key] === 'function');
    console.log('[WASM] Exported functions:', exportedFunctions);

    // Helper to pick a function from multiple possible exported names
    const pickFn = (names: string[]) => {
      for (const n of names) {
        const v = (wasmExports as any)[n];
        if (typeof v === 'function') return v.bind(wasmExports);
      }
      return undefined;
    };

    const mallocFn = pickFn(['_malloc', 'malloc']);
    const freeFn = pickFn(['_free', 'free']);
    const getMoveFn = pickFn(['_getMove', 'getMove']);
    const evalFn = pickFn(['_evaluatePosition', 'evaluatePosition']);
    const initFn = pickFn(['_initEngine', 'initEngine']);
    const setBoardFn = pickFn(['_setBoardFromFen', 'setBoardFromFen']);

    if (!mallocFn) throw new Error('Missing malloc/_malloc');
    if (!freeFn) throw new Error('Missing free/_free');
    if (!getMoveFn) throw new Error('Missing getMove/_getMove');
    if (!evalFn) throw new Error('Missing evaluatePosition/_evaluatePosition');

    // Attach aliases so existing code using underscored names continues to work
   

    // _initEngine is optional - the engine might not export it
    if (typeof (wasmExports as any)._initEngine === 'function') {
      console.log('[WASM] Calling _initEngine');
      (wasmExports as any)._initEngine();
    } else {
      console.warn('[WASM] _initEngine not found in WASM exports, skipping initialization');
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    throw new Error(`WASM instantiation failed: ${msg}`);
  }
}

export async function initEngine(): Promise<boolean> {
  try {
    await loadWasm();
    // _initEngine call is now done inside loadWasm
    return true;
  } catch (err) {
    initError = err instanceof Error ? err.message : String(err);
    console.error('[WASM] Init error:', initError);
    return false;
  }
}

export async function getMove(fen: string, depth: number = 4): Promise<{
  move: string;
  score: number;
  nodes: number;
  time: number;
}> {
  if (!wasmExports) throw new Error('Engine not initialized');

  const fenPtr = wasmExports._malloc(fen.length + 1);
  writeString(fenPtr, fen);

  try {
    const movePtr = wasmExports._getMove(fenPtr, depth);
    if (movePtr === 0) throw new Error('getMove returned null');

    const raw = readString(movePtr);
    wasmExports._free(movePtr);

    const parts = raw.trim().split(' ');
    let move = '';
    let score = 0;
    let nodes = 0;
    let time = 0;
    for (let i = 0; i < parts.length; i++) {
      if (parts[i] === 'move' && i + 1 < parts.length) move = parts[i + 1];
      else if (parts[i] === 'score' && i + 1 < parts.length) score = parseInt(parts[i + 1], 10) || 0;
      else if (parts[i] === 'nodes' && i + 1 < parts.length) nodes = parseInt(parts[i + 1], 10) || 0;
      else if (parts[i] === 'time' && i + 1 < parts.length) time = parseInt(parts[i + 1], 10) || 0;
    }
    return { move, score, nodes, time };
  } finally {
    wasmExports._free(fenPtr);
  }
}

export async function evaluatePosition(fen: string): Promise<number> {
  if (!wasmExports) throw new Error('Engine not initialized');

  const fenPtr = wasmExports._malloc(fen.length + 1);
  writeString(fenPtr, fen);

  try {
    return wasmExports._evaluatePosition(fenPtr);
  } finally {
    wasmExports._free(fenPtr);
  }
}

export function getInitError(): string | null {
  return initError;
}