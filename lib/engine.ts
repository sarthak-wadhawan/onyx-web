import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

export interface EngineOptions {
  depth?: number;
  timeLimit?: number;
}

export interface EngineMoveResult {
  move: string;
  score: number;
  nodes: number;
  time: number;
}

export interface EngineInfo {
  name: string;
  version: string;
}

export interface ChessEngine {
  getMove(fen: string, options?: EngineOptions): Promise<EngineMoveResult>;
  getInfo(): Promise<EngineInfo>;
}

export class BinaryEngine implements ChessEngine {
  private binaryPath: string;
  private engineName: string;
  private engineVersion: string;

  constructor(binaryPath: string, engineName = 'Onyx', engineVersion = '1.0') {
    this.binaryPath = binaryPath;
    this.engineName = engineName;
    this.engineVersion = engineVersion;
  }

  async getInfo(): Promise<EngineInfo> {
    return { name: this.engineName, version: this.engineVersion };
  }

  async getMove(fen: string, options: EngineOptions = {}): Promise<EngineMoveResult> {
    const depth = options.depth || 4;
    const timeLimit = options.timeLimit || 1000;

    if (!fs.existsSync(this.binaryPath)) {
      throw new Error(`Engine binary not found at ${this.binaryPath}`);
    }

    // Our engine expects: <fen> <depth>
    const args = [fen, depth.toString()];

    return new Promise((resolve, reject) => {
      const engineProcess = spawn(this.binaryPath, args);
      let stdout = '';
      let stderr = '';

      engineProcess.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      engineProcess.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      engineProcess.on('close', (code) => {
        if (code !== 0) {
          reject(new Error(`Engine process exited with code ${code}: ${stderr}`));
          return;
        }

        // Parse output: expected "bestmove e2e4" and maybe "score 42"
        const lines = stdout.trim().split('\n');
        let move = '';
        let score = 0;
        let nodes = 0;
        let time = 0;

        for (const line of lines) {
          if (line.startsWith('bestmove')) {
            const parts = line.split(' ');
            if (parts.length >= 2) move = parts[1];
          } else if (line.startsWith('score')) {
            const parts = line.split(' ');
            if (parts.length >= 2) score = parseInt(parts[1], 10) || 0;
          } else if (line.startsWith('nodes')) {
            const parts = line.split(' ');
            if (parts.length >= 2) nodes = parseInt(parts[1], 10) || 0;
          } else if (line.startsWith('time')) {
            const parts = line.split(' ');
            if (parts.length >= 2) time = parseInt(parts[1], 10) || 0;
          }
        }

        if (!move) {
          // If no "bestmove" line, treat the entire stdout as the move
          move = stdout.trim();
        }

        resolve({ move, score, nodes, time });
      });

      engineProcess.on('error', (err) => reject(err));
    });
  }
}

export class MockEngine implements ChessEngine {
  async getInfo(): Promise<EngineInfo> {
    return { name: 'Mock', version: '0.0.1' };
  }

  async getMove(fen: string, options: EngineOptions = {}): Promise<EngineMoveResult> {
    await new Promise(resolve => setTimeout(resolve, 200 + Math.random() * 300));
    const moves = ['e2e4', 'd2d4', 'g1f3', 'c2c4', 'e2e3', 'd2d3', 'b1c3', 'g2g3'];
    const move = moves[Math.floor(Math.random() * moves.length)];
    const score = Math.floor(Math.random() * 200) - 50;
    const nodes = Math.floor(Math.random() * 10000) + 5000;
    const time = Math.floor(Math.random() * 150) + 50;
    return { move, score, nodes, time };
  }
}

export function createEngine(): ChessEngine {
  const engineType = process.env.ENGINE_TYPE || 'mock';
  if (engineType === 'mock') {
    console.log('Using mock engine');
    return new MockEngine();
  } else if (engineType === 'binary') {
    const binaryPath = process.env.ENGINE_PATH || './chess-uci';
    console.log(`Using binary engine at ${binaryPath}`);
    return new BinaryEngine(binaryPath);
  } else {
    throw new Error(`Unknown engine type: ${engineType}`);
  }
}