/**
 * StockfishEngine.ts — Stockfish WASM Web Worker wrapper
 * Communicates via UCI protocol to evaluate chess positions.
 *
 * Reference: old app's src/Middleware/Engine/StockfishEngine.ts
 */

const STOCKFISH_PATH = '/stockfish/stockfish.js';

export interface EngineMessage {
  /** Raw UCI message string */
  uciMessage: string;
  /** Best move in UCI format, e.g. "e2e4" */
  bestMove?: string;
  /** Ponder move (opponent's expected response) */
  ponder?: string;
  /** Position evaluation in centipawns (from side-to-move perspective) */
  positionEvaluation?: number;
  /** Moves until mate (positive = engine mates, negative = engine gets mated) */
  possibleMate?: number;
  /** Principal variation (best line) */
  pv?: string;
  /** Search depth reached */
  depth?: number;
}

type MessageCallback = (data: EngineMessage) => void;

export default class StockfishEngine {
  private worker: Worker;
  private listeners: MessageCallback[] = [];
  isReady = false;

  constructor() {
    this.worker = new Worker(STOCKFISH_PATH, { type: 'classic' });
    this.worker.addEventListener('message', (e: MessageEvent) => {
      const parsed = this.parseUCIMessage(e.data);
      for (const cb of this.listeners) {
        cb(parsed);
      }
    });
    this.init();
  }

  /** Send UCI init commands */
  private init() {
    this.postMessage('uci');
    this.postMessage('isready');
    this.onMessage(({ uciMessage }) => {
      if (uciMessage === 'readyok') {
        this.isReady = true;
      }
    });
  }

  /** Register a callback for parsed UCI messages */
  onMessage(callback: MessageCallback) {
    this.listeners.push(callback);
  }

  /** Remove a specific message listener */
  offMessage(callback: MessageCallback) {
    this.listeners = this.listeners.filter((cb) => cb !== callback);
  }

  /** Send a raw UCI command to the engine */
  postMessage(command: string) {
    this.worker.postMessage(command);
  }

  /** Set Stockfish Skill Level (0–20) */
  setSkillLevel(level: number) {
    const clamped = Math.max(0, Math.min(20, level));
    this.postMessage(`setoption name Skill Level value ${clamped}`);
  }

  /** Evaluate a position at the given depth */
  evaluatePosition(fen: string, depth = 12) {
    this.postMessage(`position fen ${fen}`);
    this.postMessage(`go depth ${depth}`);
  }

  /** Stop the current search — returns the best move found so far */
  stop() {
    this.postMessage('stop');
  }

  /** Terminate the engine worker */
  terminate() {
    this.isReady = false;
    this.listeners = [];
    this.postMessage('quit');
    this.worker.terminate();
  }

  /** Parse a raw UCI message string into structured data */
  private parseUCIMessage(raw: unknown): EngineMessage {
    const uciMessage = typeof raw === 'string' ? raw : String(raw);

    const bestMoveMatch = uciMessage.match(/bestmove\s+(\S+)/);
    const ponderMatch = uciMessage.match(/ponder\s+(\S+)/);
    const cpMatch = uciMessage.match(/score cp\s+(-?\d+)/);
    const mateMatch = uciMessage.match(/score mate\s+(-?\d+)/);
    const pvMatch = uciMessage.match(/ pv\s+(.*)/);
    const depthMatch = uciMessage.match(/ depth\s+(\d+)/);

    return {
      uciMessage,
      bestMove: bestMoveMatch?.[1],
      ponder: ponderMatch?.[1],
      positionEvaluation: cpMatch ? parseInt(cpMatch[1], 10) : undefined,
      possibleMate: mateMatch ? parseInt(mateMatch[1], 10) : undefined,
      pv: pvMatch?.[1],
      depth: depthMatch ? parseInt(depthMatch[1], 10) : undefined,
    };
  }
}
