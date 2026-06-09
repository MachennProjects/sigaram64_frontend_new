import { Chess } from 'chess.js';
import StockfishEngine, { EngineMessage } from './StockfishEngine';

export type MoveClass = 'brilliant' | 'great' | 'book' | 'best' | 'excellent' | 'good' | 'inaccuracy' | 'mistake' | 'miss' | 'blunder';

export interface AnalyzedMove {
  moveIndex: number;
  san: string;
  color: 'w' | 'b';
  fen: string;
  fenBefore: string;
  from: string;
  to: string;
  evaluation: number;          // centipawns after this move (from White's perspective)
  evalBefore: number;          // centipawns before this move (from White's perspective)
  bestMove: string;            // engine's best move (SAN)
  bestMoveUci: string;         // engine's best move (UCI)
  bestMoveFrom?: string;
  bestMoveTo?: string;
  classification: MoveClass;
  winPercentBefore: number;
  winPercentAfter: number;
  cpLoss: number;
  comment: string;
  pieceMoved: string;
}

export interface PlayerStats {
  brilliant: number;
  great: number;
  book: number;
  best: number;
  excellent: number;
  good: number;
  inaccuracy: number;
  mistake: number;
  miss: number;
  blunder: number;
  accuracy: number;
  acpl: number;
}

export interface GameAnalysisResult {
  moves: AnalyzedMove[];
  summary: {
    white: PlayerStats;
    black: PlayerStats;
  };
  evalHistory: number[];
  result: string;
  totalMoves: number;
  date: string;
  coachSummary: string;
  playerColor: 'white' | 'black';
  difficulty: string;
}

export interface MoveDetail {
  from: string;
  to: string;
  san: string;
  fen: string;
  piece: string;
  color: 'w' | 'b';
}

function cpToWinPercent(cp: number): number {
  return 50 + 50 * (2 / (1 + Math.exp(-0.00368208 * cp)) - 1);
}

function getPieceIcon(piece: string, color: string): string {
  const icons: Record<string, Record<string, string>> = {
    'w': { p: '♙', n: '♘', b: '♗', r: '♖', q: '♕', k: '♔' },
    'b': { p: '♟', n: '♞', b: '♝', r: '♜', q: '♛', k: '♚' }
  };
  return icons[color]?.[piece.toLowerCase()] || '';
}

export async function analyzeGame(
  moves: MoveDetail[],
  playerColor: 'white' | 'black',
  difficulty: string,
  gameResult: string,
  onProgress?: (progress: number) => void
): Promise<GameAnalysisResult> {
  const engine = new StockfishEngine();
  
  // Wait for engine to be ready
  await new Promise<void>((resolve) => {
    const checkReady = setInterval(() => {
      if (engine.isReady) {
        clearInterval(checkReady);
        resolve();
      }
    }, 50);
  });

  engine.postMessage('setoption name MultiPV value 1');
  engine.setSkillLevel(20);

  const analyzedMoves: AnalyzedMove[] = [];
  const chess = new Chess();
  
  // Book moves approximation (first 4 full moves)
  const isBookMove = (moveIndex: number) => moveIndex < 8;

  for (let i = 0; i < moves.length; i++) {
    const move = moves[i];
    const fenBefore = chess.fen();
    chess.move(move.san);
    
    // Evaluate position before move
    let evalBefore = await evaluateFen(engine, fenBefore, 16);
    
    // Evaluate position after move to see what actually happened
    let evalAfter = await evaluateFen(engine, chess.fen(), 16);
    // evalAfter is from opponent's perspective in evaluateFen, so we need to handle this carefully.
    // Actually evaluateFen returns score from side-to-move's perspective.
    // Let's normalize everything to White's perspective.
    const sideToMoveBefore = chess.turn() === 'w' ? 'b' : 'w'; // Before the move, it was move.color's turn
    const isWhiteTurnBefore = move.color === 'w';
    
    // We will just evaluate from White's perspective to make things consistent.
    // Let's adjust evaluateFen to return White's perspective.
    
    let wEvalBefore = isWhiteTurnBefore ? evalBefore.score : -evalBefore.score;
    let wEvalAfter = isWhiteTurnBefore ? -evalAfter.score : evalAfter.score;

    let wpBefore = cpToWinPercent(wEvalBefore);
    let wpAfter = cpToWinPercent(wEvalAfter);
    
    // Win percent for the player who just moved
    let playerWpBefore = move.color === 'w' ? wpBefore : 100 - wpBefore;
    let playerWpAfter = move.color === 'w' ? wpAfter : 100 - wpAfter;
    
    let wpLoss = Math.max(0, playerWpBefore - playerWpAfter);
    let cpLoss = Math.max(0, (move.color === 'w' ? wEvalBefore - wEvalAfter : wEvalAfter - wEvalBefore));

    let classification: MoveClass = 'good';
    
    if (isBookMove(i)) {
      classification = 'book';
    } else if (evalBefore.bestMove === `${move.from}${move.to}`) {
      classification = 'best';
      wpLoss = 0; // force 0 loss for best move
    } else if (wpLoss < 2) {
      classification = 'excellent';
    } else if (wpLoss < 5) {
      classification = 'good';
    } else if (wpLoss < 10) {
      classification = 'inaccuracy';
    } else if (wpLoss < 20) {
      classification = 'mistake';
    } else if (wpLoss >= 20) {
      // Differentiate Miss and Blunder: Miss is often missing a winning tactic
      if (playerWpBefore > 80 && playerWpAfter < 50) {
         classification = 'miss';
      } else {
         classification = 'blunder';
      }
    }

    // Generate Comment
    const pieceIcon = getPieceIcon(move.piece, move.color);
    let comment = '';
    if (classification === 'best') comment = "Best move found!";
    else if (classification === 'excellent') comment = `${pieceIcon} ${move.san} is excellent`;
    else if (classification === 'good') comment = `${pieceIcon} ${move.san} is a good move`;
    else if (classification === 'inaccuracy') comment = `${pieceIcon} ${move.san} is an inaccuracy`;
    else if (classification === 'mistake') comment = `${pieceIcon} ${move.san} is a mistake`;
    else if (classification === 'blunder') comment = `${pieceIcon} ${move.san} is a blunder`;
    else if (classification === 'miss') comment = `${pieceIcon} ${move.san} is a miss`;
    else if (classification === 'book') comment = "Opening book move";

    analyzedMoves.push({
      moveIndex: i,
      san: move.san,
      color: move.color,
      fen: move.fen,
      fenBefore,
      from: move.from,
      to: move.to,
      evaluation: wEvalAfter,
      evalBefore: wEvalBefore,
      bestMove: evalBefore.bestMoveSan || '',
      bestMoveUci: evalBefore.bestMove || '',
      bestMoveFrom: evalBefore.bestMove?.substring(0,2),
      bestMoveTo: evalBefore.bestMove?.substring(2,4),
      classification,
      winPercentBefore: playerWpBefore,
      winPercentAfter: playerWpAfter,
      cpLoss,
      comment,
      pieceMoved: pieceIcon
    });

    if (onProgress) {
      onProgress(Math.round(((i + 1) / moves.length) * 100));
    }
  }

  engine.terminate();

  const whiteStats = calculateStats(analyzedMoves.filter(m => m.color === 'w'));
  const blackStats = calculateStats(analyzedMoves.filter(m => m.color === 'b'));

  return {
    moves: analyzedMoves,
    summary: { white: whiteStats, black: blackStats },
    evalHistory: analyzedMoves.map(m => m.evaluation),
    result: gameResult,
    totalMoves: moves.length,
    date: new Date().toISOString(),
    coachSummary: generateCoachSummary(whiteStats, blackStats, playerColor, gameResult),
    playerColor,
    difficulty
  };
}

interface EvalResult {
  score: number; // side to move centipawns (mate is +/- 10000)
  bestMove?: string;
  bestMoveSan?: string; // We'd need to calculate SAN from UCI but let's stick to UCI or basic SAN for now
}

async function evaluateFen(engine: StockfishEngine, fen: string, depth: number): Promise<EvalResult> {
  return new Promise((resolve) => {
    let bestMove: string | undefined;
    let score = 0;
    
    const handler = (msg: EngineMessage) => {
      if (msg.positionEvaluation !== undefined) {
        score = msg.positionEvaluation;
      }
      if (msg.possibleMate !== undefined) {
        score = msg.possibleMate > 0 ? 10000 - msg.possibleMate : -10000 - msg.possibleMate;
      }
      if (msg.bestMove) {
        bestMove = msg.bestMove;
        engine.offMessage(handler);
        resolve({ score, bestMove });
      }
    };
    
    engine.onMessage(handler);
    engine.evaluatePosition(fen, depth);
    
    // Safety timeout
    setTimeout(() => {
      engine.offMessage(handler);
      resolve({ score, bestMove });
    }, 5000);
  });
}

function calculateStats(moves: AnalyzedMove[]): PlayerStats {
  const stats = {
    brilliant: 0, great: 0, book: 0, best: 0, excellent: 0,
    good: 0, inaccuracy: 0, mistake: 0, miss: 0, blunder: 0,
    accuracy: 0, acpl: 0
  };

  let totalLoss = 0;
  moves.forEach(m => {
    stats[m.classification]++;
    totalLoss += m.cpLoss;
  });

  stats.acpl = moves.length > 0 ? totalLoss / moves.length : 0;
  
  // Basic accuracy formula based on win% loss average
  const avgWpLoss = moves.length > 0 ? moves.reduce((sum, m) => sum + Math.max(0, m.winPercentBefore - m.winPercentAfter), 0) / moves.length : 0;
  stats.accuracy = Math.max(0, 100 - avgWpLoss * 2);
  stats.accuracy = parseFloat(stats.accuracy.toFixed(1));

  return stats;
}

function generateCoachSummary(white: PlayerStats, black: PlayerStats, playerColor: string, result: string): string {
  const playerStats = playerColor === 'white' ? white : black;
  if (result.includes('Won')) {
    if (playerStats.accuracy > 85) return "A brilliant masterpiece! You played with incredible accuracy and gave your opponent no chances.";
    if (playerStats.blunder === 0) return "A very solid game. You made no major blunders and capitalized on your opponent's mistakes.";
    return "A wild game! You made some mistakes, but you fought hard and delivered the winning blow.";
  } else if (result.includes('Lost')) {
    return "A tough loss. Review your mistakes carefully to improve for the next game.";
  }
  return "A hard-fought draw. Both sides had chances, but neither could break through.";
}

export function getGameOutcome(result: string, playerColor?: 'white' | 'black' | string): 'win' | 'loss' | 'draw' {
  if (!result) return 'draw';
  const resLower = result.toLowerCase();
  const color = (playerColor || 'white').toLowerCase();

  if (resLower.includes('draw') || resLower.includes('stalemate')) {
    return 'draw';
  }
  if (resLower.includes('you win') || resLower.includes('you won')) {
    return 'win';
  }
  if (resLower.includes('stockfish wins') || resLower.includes('resigned') || resLower.includes('resign')) {
    return 'loss';
  }
  if (resLower.includes('black_win') || resLower.includes('black wins')) {
    return color === 'black' ? 'win' : 'loss';
  }
  if (resLower.includes('white_win') || resLower.includes('white wins')) {
    return color === 'white' ? 'win' : 'loss';
  }
  if (resLower.includes('win')) {
    if (resLower.includes('stockfish') || resLower.includes('cpu') || resLower.includes('opponent')) {
      return 'loss';
    }
    return 'win';
  }
  if (resLower.includes('loss') || resLower.includes('lose') || resLower.includes('lost')) {
    return 'loss';
  }
  return 'draw';
}
