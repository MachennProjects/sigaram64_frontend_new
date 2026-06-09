/**
 * useStockfish.ts — React hook for Stockfish engine interaction
 * Provides findBestMove() and getEvaluation() as clean async APIs.
 */

import { useEffect, useRef, useCallback } from 'react';
import StockfishEngine from './StockfishEngine';

export interface StockfishConfig {
  skillLevel?: number;
}

export function useStockfish(config?: StockfishConfig) {
  const engineRef = useRef<StockfishEngine | null>(null);

  useEffect(() => {
    const engine = new StockfishEngine();
    engineRef.current = engine;

    if (config?.skillLevel !== undefined) {
      // Wait briefly for engine readiness, then set skill level
      const timer = setTimeout(() => {
        engine.setSkillLevel(config.skillLevel!);
      }, 200);
      return () => {
        clearTimeout(timer);
        engine.terminate();
        engineRef.current = null;
      };
    }

    return () => {
      engine.terminate();
      engineRef.current = null;
    };
  }, [config?.skillLevel]);

  /** Find the best move for a given FEN position at a given depth */
  const findBestMove = useCallback(
    (fen: string, depth = 12): Promise<string> => {
      return new Promise((resolve, reject) => {
        const engine = engineRef.current;
        if (!engine) {
          reject(new Error('Stockfish engine not initialized'));
          return;
        }

        const timeout = setTimeout(() => {
          engine.offMessage(handler);
          reject(new Error('Stockfish timeout'));
        }, 10000);

        const handler = ({ bestMove }: { bestMove?: string }) => {
          if (bestMove) {
            clearTimeout(timeout);
            engine.offMessage(handler);
            resolve(bestMove);
          }
        };

        engine.onMessage(handler);
        engine.evaluatePosition(fen, depth);
      });
    },
    []
  );

  /** Get the centipawn evaluation for a position */
  const getEvaluation = useCallback(
    (fen: string, depth = 12): Promise<number> => {
      return new Promise((resolve, reject) => {
        const engine = engineRef.current;
        if (!engine) {
          reject(new Error('Stockfish engine not initialized'));
          return;
        }

        let lastEval: number | undefined;

        const timeout = setTimeout(() => {
          engine.offMessage(handler);
          if (lastEval !== undefined) {
            resolve(lastEval);
          } else {
            reject(new Error('Stockfish evaluation timeout'));
          }
        }, 8000);

        const handler = ({
          positionEvaluation,
          possibleMate,
          bestMove,
        }: {
          positionEvaluation?: number;
          possibleMate?: number;
          bestMove?: string;
        }) => {
          if (positionEvaluation !== undefined) {
            lastEval = positionEvaluation;
          }
          if (possibleMate !== undefined) {
            // Convert mate score to a large centipawn value
            lastEval = possibleMate > 0 ? 10000 : -10000;
          }
          if (bestMove) {
            clearTimeout(timeout);
            engine.offMessage(handler);
            resolve(lastEval ?? 0);
          }
        };

        engine.onMessage(handler);
        engine.evaluatePosition(fen, depth);
      });
    },
    []
  );

  /** Stop the current engine search */
  const stop = useCallback(() => {
    engineRef.current?.stop();
  }, []);

  return { findBestMove, getEvaluation, stop };
}
