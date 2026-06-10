// PlayWithAI.tsx — Chess.com-style layout: Board + Side Panel (Moves/Info tabs)
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Chess, Square } from 'chess.js';
import ChessBoard from '../../chess/ChessBoard';
import EvalBar from '../../chess/EvalBar';
import { useStockfish } from '../../../engine/useStockfish';
import { analyzeGame, GameAnalysisResult } from '../../../engine/gameAnalyzer';
import { useAuth } from '../../../context/AuthContext';
import { saveUserGame, updateUser } from '../../../firebase/firestoreService';

import ChessGameLayout, { PlayerInfo } from '../../chess/ChessGameLayout';

/* ── Difficulty → engine mapping ────────────────────────────────────── */
type Difficulty = 'beginner' | 'intermediate' | 'advanced' | 'master';

interface DifficultyConfig {
  depth: number;
  skillLevel: number;
  label: string;
  elo: string;
}

const DIFFICULTY_MAP: Record<Difficulty, DifficultyConfig> = {
  beginner: { depth: 2, skillLevel: 1, label: 'Beginner', elo: '400–800' },
  intermediate: { depth: 5, skillLevel: 7, label: 'Intermediate', elo: '800–1200' },
  advanced: { depth: 9, skillLevel: 13, label: 'Advanced', elo: '1200–1800' },
  master: { depth: 15, skillLevel: 19, label: 'Master', elo: '1800–2400' },
};

/* ── Time control parsing ───────────────────────────────────────────── */
type TimeControl = '1+0' | '3+2' | '5+0' | '10+0' | '15+10';

function parseTimeControl(tc: TimeControl): { baseTime: number; increment: number } {
  const parts = tc.split('+').map(Number);
  return { baseTime: parts[0] * 60, increment: parts[1] || 0 };
}

/* ══════════════════════════════════════════════════════════════════════
 *  ROUTE GUARD — redirects to /play if no game config is passed via state
 * ══════════════════════════════════════════════════════════════════════ */
export default function PlayWithAI() {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!location.state) {
      navigate('/play', { replace: true });
    }
  }, [location.state, navigate]);

  if (!location.state) return null;

  return <PlayWithAIGame state={location.state as Record<string, unknown>} />;
}

/* ══════════════════════════════════════════════════════════════════════
 *  MAIN COMPONENT — all hooks live here, called unconditionally
 * ══════════════════════════════════════════════════════════════════════ */
function PlayWithAIGame({ state }: { state: Record<string, unknown> }) {
  const navigate = useNavigate();
  const { user, refreshUser, refreshGames } = useAuth();

  const {
    difficulty = 'intermediate' as Difficulty,
    timeControl = '10+0' as TimeControl,
    color: colorChoice = 'white' as 'white' | 'black' | 'random',
  } = state;

  const playerColor = useMemo(() => {
    if (colorChoice === 'random') return Math.random() < 0.5 ? 'white' : 'black';
    return colorChoice as 'white' | 'black';
  }, []);

  const playerTurn = playerColor === 'white' ? 'w' : 'b';
  const aiTurn = playerColor === 'white' ? 'b' : 'w';
  const orientation = playerColor;
  const config = DIFFICULTY_MAP[difficulty as Difficulty] || DIFFICULTY_MAP.intermediate;
  const { findBestMove, getEvaluation, stop } = useStockfish({ skillLevel: config.skillLevel });

  // ── Game state ────────────────────────────────────────────────────
  const gameRef = useRef(new Chess());
  const [position, setPosition] = useState(gameRef.current.fen());

  const capturedData = useMemo(() => {
    const boardFen = position.split(' ')[0];
    const counts: Record<string, number> = {
      p: 0, n: 0, b: 0, r: 0, q: 0,
      P: 0, N: 0, B: 0, R: 0, Q: 0
    };
    for (const char of boardFen) {
      if (counts.hasOwnProperty(char)) {
        counts[char]++;
      }
    }
    const capturedByWhite = {
      p: 8 - counts.p,
      n: 2 - counts.n,
      b: 2 - counts.b,
      r: 2 - counts.r,
      q: 1 - counts.q,
    };
    const capturedByBlack = {
      p: 8 - counts.P,
      n: 2 - counts.N,
      b: 2 - counts.B,
      r: 2 - counts.R,
      q: 1 - counts.Q,
    };

    const whiteMaterial = counts.P * 1 + counts.N * 3 + counts.B * 3 + counts.R * 5 + counts.Q * 9;
    const blackMaterial = counts.p * 1 + counts.n * 3 + counts.b * 3 + counts.r * 5 + counts.q * 9;

    const diff = whiteMaterial - blackMaterial;

    return {
      capturedByWhite, // black pieces captured by white
      capturedByBlack, // white pieces captured by black
      whiteAdvantage: diff > 0 ? diff : 0,
      blackAdvantage: diff < 0 ? -diff : 0
    };
  }, [position]);

  const [moveHistory, setMoveHistory] = useState<string[]>([]);
  const [verboseMoves, setVerboseMoves] = useState<{ san: string; color: 'w' | 'b' }[]>([]);
  const [lastMove, setLastMove] = useState<{ from: string; to: string } | null>(null);
  const [kingInCheck, setKingInCheck] = useState<string | null>(null);
  const [hintSquares, setHintSquares] = useState<{ from: string; to: string } | null>(null);
  const [evaluation, setEvaluation] = useState(0);
  const [mateIn, setMateIn] = useState<number | null>(null);
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [gameResult, setGameResult] = useState('');
  const [showResultDialog, setShowResultDialog] = useState(false);
  const [showResignConfirm, setShowResignConfirm] = useState(false);
  const [sideTab, setSideTab] = useState<'moves' | 'info'>('moves');
  const [viewMoveIndex, setViewMoveIndex] = useState<number>(-1); // -1 = latest
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<GameAnalysisResult | null>(null);

  // ── Timer state ───────────────────────────────────────────────────
  const { baseTime, increment } = parseTimeControl(timeControl as TimeControl);
  const [timeWhite, setTimeWhite] = useState(baseTime);
  const [timeBlack, setTimeBlack] = useState(baseTime);
  const [activeTimer, setActiveTimer] = useState<'w' | 'b' | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const gameStartTime = useRef(new Date());
  const cachedHintRef = useRef<{ fen: string, move: string } | null>(null);

  useEffect(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (activeTimer && !gameOver) {
      timerRef.current = setInterval(() => {
        if (activeTimer === 'w') {
          setTimeWhite((prev) => {
            if (prev <= 1) { handleGameEnd('Time out — Black wins! ⏱️'); return 0; }
            return prev - 1;
          });
        } else {
          setTimeBlack((prev) => {
            if (prev <= 1) { handleGameEnd('Time out — White wins! ⏱️'); return 0; }
            return prev - 1;
          });
        }
      }, 1000);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [activeTimer, gameOver]);

  // ── Helpers ───────────────────────────────────────────────────────
  const updateCheckStatus = useCallback(() => {
    const game = gameRef.current;
    if (game.isCheck()) {
      const board = game.board();
      const turn = game.turn();
      for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
          const piece = board[r][c];
          if (piece && piece.type === 'k' && piece.color === turn) {
            setKingInCheck(`${'abcdefgh'[c]}${8 - r}`);
            return;
          }
        }
      }
    }
    setKingInCheck(null);
  }, []);

  const updateMoveData = useCallback(() => {
    const history = gameRef.current.history({ verbose: true });
    setMoveHistory(gameRef.current.history());
    setVerboseMoves(history.map(m => ({ san: m.san, color: m.color })));
    setViewMoveIndex(-1);
  }, []);

  const checkGameEnd = useCallback(() => {
    const game = gameRef.current;
    if (game.isCheckmate()) {
      const winner = game.turn() === 'w' ? 'Black' : 'White';
      const isPlayerWin = (winner === 'White' && playerColor === 'white') || (winner === 'Black' && playerColor === 'black');
      handleGameEnd(isPlayerWin ? 'Checkmate! You win! 🎉' : 'Checkmate! Stockfish wins! 🤖');
      return true;
    }
    if (game.isDraw()) {
      let reason = 'Stalemate';
      if (game.isThreefoldRepetition()) reason = 'Threefold repetition';
      else if (game.isInsufficientMaterial()) reason = 'Insufficient material';
      handleGameEnd(`Draw — ${reason} 🤝`);
      return true;
    }
    if (game.isStalemate()) {
      handleGameEnd('Draw — Stalemate 🤝');
      return true;
    }
    return false;
  }, [playerColor]);

  const handleGameEnd = useCallback(async (result: string) => {
    if (gameOver) return;
    setGameOver(true);
    setGameResult(result);
    setActiveTimer(null);
    stop();

    setAnalysisResult(null);

    // Trigger Analysis
    setIsAnalyzing(true);

    // Delay showing the result dialog so the checkmate badges are visible
    setTimeout(() => {
      setShowResultDialog(true);
    }, 2500);

    const history = gameRef.current.history({ verbose: true });
    const tempChess = new Chess();
    const moveDetails = history.map(m => {
      tempChess.move(m.san);
      return {
        from: m.from, to: m.to, san: m.san, color: m.color, piece: m.piece, fen: tempChess.fen()
      };
    });

    try {
      const analysis = await analyzeGame(moveDetails, playerColor, config.label, result, (prog) => {
        // Optional progress callback
      });
      setAnalysisResult(analysis);

      // Save to local file system via Vite proxy
      try {
        await fetch('/api/save-game', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(analysis)
        });
      } catch (e) {
        console.error('Failed to save game to local file', e);
      }

      // Save to Firestore and update user stats
      if (user?.id && user.id !== 'GUEST') {
        try {
          const savedGameId = await saveUserGame(user.id, analysis);
          analysis.id = savedGameId;
          setAnalysisResult({ ...analysis });

          // Determine game result status for the user
          const resultLower = result.toLowerCase();
          const isWin = resultLower.includes('you win') || 
                        (resultLower.includes('white wins') && playerColor === 'white') ||
                        (resultLower.includes('black wins') && playerColor === 'black');
          const isDraw = resultLower.includes('draw') || resultLower.includes('stalemate');

          const ratingChange = isWin ? 15 : isDraw ? 0 : -10;
          const currentRating = user.rating ?? user.elo ?? 1000;
          const newRating = Math.max(100, currentRating + ratingChange);

          const currentPlayed = user.games_played ?? user.TotalMatch ?? 0;
          const currentWon = user.games_won ?? user.WinMatch ?? 0;
          const currentDrawn = user.games_drawn ?? 0;

          const updatedFields = {
            games_played: currentPlayed + 1,
            TotalMatch: currentPlayed + 1,
            games_won: currentWon + (isWin ? 1 : 0),
            WinMatch: currentWon + (isWin ? 1 : 0),
            games_drawn: currentDrawn + (isDraw ? 1 : 0),
            rating: newRating,
            elo: newRating,
          };

          await updateUser(user.id, updatedFields);
          await refreshUser();
          await refreshGames();
          console.log('Successfully saved game to Firestore and updated user stats');
        } catch (dbError) {
          console.error('Failed to save game or update user stats in Firestore', dbError);
        }
      }
    } catch (error) {
      console.error('Game analysis failed:', error);
    } finally {
      setIsAnalyzing(false);
    }
  }, [gameOver, stop, playerColor, config.label, user, refreshUser, refreshGames]);

  // ── AI move ───────────────────────────────────────────────────────
  const makeAIMove = useCallback(async () => {
    if (gameOver || gameRef.current.turn() !== aiTurn) return;
    setIsAiThinking(true);
    setHintSquares(null);
    try {
      const bestMoveUci = await findBestMove(gameRef.current.fen(), config.depth);
      if (!bestMoveUci || gameOver) { setIsAiThinking(false); return; }
      const from = bestMoveUci.substring(0, 2);
      const to = bestMoveUci.substring(2, 4);
      const promotion = bestMoveUci.length > 4 ? bestMoveUci[4] : undefined;
      const moveResult = gameRef.current.move({ from, to, promotion } as any);
      if (moveResult) {
        setPosition(gameRef.current.fen());
        updateMoveData();
        setLastMove({ from, to });
        updateCheckStatus();
        if (increment > 0) {
          if (aiTurn === 'w') setTimeWhite(p => p + increment);
          else setTimeBlack(p => p + increment);
        }
        setActiveTimer(playerTurn);
        if (!checkGameEnd()) {
          try {
            const evalScore = await getEvaluation(gameRef.current.fen(), Math.min(config.depth, 10));
            setEvaluation(playerColor === 'white' ? evalScore : -evalScore);
            setMateIn(null);
          } catch { }
        }
      }
    } catch (error) {
      console.error('AI move error:', error);
    } finally {
      setIsAiThinking(false);
    }
  }, [gameOver, aiTurn, playerTurn, config.depth, increment, playerColor, findBestMove, getEvaluation, updateCheckStatus, checkGameEnd, updateMoveData, stop]);

  useEffect(() => {
    if (!gameOver && gameRef.current.turn() === aiTurn) {
      const delay = setTimeout(makeAIMove, 2000);
      return () => clearTimeout(delay);
    }
  }, [position, gameOver, aiTurn, makeAIMove]);

  useEffect(() => {
    if (playerColor === 'black') {
      const delay = setTimeout(makeAIMove, 2000);
      return () => clearTimeout(delay);
    }
  }, []);

  // ── Player move ───────────────────────────────────────────────────
  const handlePlayerMove = useCallback(
    (from: string, to: string, promotion?: string): boolean => {
      if (gameOver || gameRef.current.turn() !== playerTurn) return false;
      try {
        const moveResult = gameRef.current.move({ from: from as Square, to: to as Square, promotion: promotion || 'q' });
        if (!moveResult) return false;
        setPosition(gameRef.current.fen());
        updateMoveData();
        setLastMove({ from, to });
        setHintSquares(null);
        updateCheckStatus();
        if (increment > 0) {
          if (playerTurn === 'w') setTimeWhite(p => p + increment);
          else setTimeBlack(p => p + increment);
        }
        setActiveTimer(aiTurn);
        if (!checkGameEnd()) {
          getEvaluation(gameRef.current.fen(), Math.min(config.depth, 10))
            .then(evalScore => { setEvaluation(playerColor === 'white' ? evalScore : -evalScore); setMateIn(null); })
            .catch(() => { });
        }
        return true;
      } catch { return false; }
    },
    [gameOver, playerTurn, aiTurn, increment, playerColor, config.depth, updateCheckStatus, checkGameEnd, getEvaluation, updateMoveData]
  );

  const handleHint = useCallback(async () => {
    if (gameOver || gameRef.current.turn() !== playerTurn) return;
    const currentFen = gameRef.current.fen();

    try {
      let hintMove = '';
      if (cachedHintRef.current?.fen === currentFen) {
        hintMove = cachedHintRef.current.move;
      } else {
        const found = await findBestMove(currentFen, config.depth + 4);
        if (found) {
          hintMove = found;
          cachedHintRef.current = { fen: currentFen, move: found };
        }
      }

      if (hintMove) {
        setHintSquares({ from: hintMove.substring(0, 2), to: hintMove.substring(2, 4) });
        setTimeout(() => setHintSquares(null), 3000);
      }
    } catch { }
  }, [gameOver, playerTurn, config.depth, findBestMove]);

  const handleResign = useCallback(() => {
    setShowResignConfirm(false);
    handleGameEnd('You resigned 🏳️');
  }, [handleGameEnd]);

  const handleNewGame = useCallback(() => {
    gameRef.current = new Chess();
    setPosition(gameRef.current.fen());
    setMoveHistory([]); setVerboseMoves([]);
    setLastMove(null); setKingInCheck(null); setHintSquares(null);
    setEvaluation(0); setMateIn(null);
    setIsAiThinking(false); setGameOver(false); setGameResult('');
    setShowResultDialog(false); setViewMoveIndex(-1);
    setTimeWhite(baseTime); setTimeBlack(baseTime); setActiveTimer(null);
    setAnalysisResult(null);
    gameStartTime.current = new Date();
  }, [baseTime]);

  const handleUndo = useCallback(() => {
    if (gameOver || moveHistory.length < 2) return;
    gameRef.current.undo();
    gameRef.current.undo();
    setPosition(gameRef.current.fen());
    updateMoveData();
    const history = gameRef.current.history({ verbose: true });
    if (history.length > 0) {
      const last = history[history.length - 1];
      setLastMove({ from: last.from, to: last.to });
    } else setLastMove(null);
    updateCheckStatus();
  }, [gameOver, moveHistory.length, updateCheckStatus, updateMoveData]);

  // ── Move navigation ───────────────────────────────────────────────
  const handleMoveNav = useCallback((dir: 'first' | 'prev' | 'next' | 'last') => {
    const totalMoves = moveHistory.length;
    if (totalMoves === 0) return;
    const current = viewMoveIndex === -1 ? totalMoves - 1 : viewMoveIndex;
    let next: number;
    switch (dir) {
      case 'first': next = 0; break;
      case 'prev': next = Math.max(0, current - 1); break;
      case 'next': next = Math.min(totalMoves - 1, current + 1); break;
      case 'last': next = -1; break;
      default: return;
    }
    setViewMoveIndex(next);
  }, [moveHistory.length, viewMoveIndex]);

  const isPlayerTurn = gameRef.current.turn() === playerTurn;
  const resultEmoji = gameResult.includes('win') && gameResult.includes('You') ? '🏆'
    : gameResult.includes('Draw') ? '🤝'
      : gameResult.includes('resign') ? '🏳️' : '🤖';

  // ── Build paired move rows for the chess.com-style list ────────────
  const moveRows = useMemo(() => {
    const rows: { num: number; white: { san: string; color: 'w' } | null; black: { san: string; color: 'b' } | null; whiteIdx: number; blackIdx: number | null }[] = [];
    for (let i = 0; i < verboseMoves.length; i += 2) {
      rows.push({
        num: Math.floor(i / 2) + 1,
        white: verboseMoves[i] ? { san: verboseMoves[i].san, color: 'w' } : null,
        black: verboseMoves[i + 1] ? { san: verboseMoves[i + 1].san, color: 'b' } : null,
        whiteIdx: i,
        blackIdx: i + 1 < verboseMoves.length ? i + 1 : null,
      });
    }
    return rows;
  }, [verboseMoves]);

  const highlightIdx = viewMoveIndex === -1 ? moveHistory.length - 1 : viewMoveIndex;
  const moveListRef = useRef<HTMLDivElement>(null);
  const activeRowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (moveListRef.current) {
      if (viewMoveIndex === -1 || viewMoveIndex === moveHistory.length - 1) {
        moveListRef.current.scrollTop = moveListRef.current.scrollHeight;
      } else if (activeRowRef.current) {
        const container = moveListRef.current;
        const row = activeRowRef.current;
        const topPos = row.offsetTop - container.offsetTop;
        container.scrollTop = topPos - container.clientHeight / 2 + row.clientHeight / 2;
      }
    }
  }, [moveHistory.length, viewMoveIndex]);

  const currentViewFen = useMemo(() => {
    if (viewMoveIndex === -1) return position;
    const tempGame = new Chess();
    const history = gameRef.current.history();
    for (let i = 0; i <= viewMoveIndex; i++) {
      if (history[i]) tempGame.move(history[i]);
    }
    return tempGame.fen();
  }, [position, viewMoveIndex]);

  const currentKingInCheck = useMemo(() => {
    const tempGame = new Chess(currentViewFen);
    if (tempGame.isCheck()) {
      const board = tempGame.board();
      const turn = tempGame.turn();
      for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
          const piece = board[r][c];
          if (piece && piece.type === 'k' && piece.color === turn) {
            return `${'abcdefgh'[c]}${8 - r}`;
          }
        }
      }
    }
    return null;
  }, [currentViewFen]);

  const currentLastMove = useMemo(() => {
    if (viewMoveIndex === -1) return lastMove;
    const history = gameRef.current.history({ verbose: true });
    if (viewMoveIndex >= 0 && viewMoveIndex < history.length) {
      const move = history[viewMoveIndex];
      return { from: move.from, to: move.to };
    }
    return null;
  }, [viewMoveIndex, lastMove]);

  // ── Time control label ────────────────────────────────────────────
  const tcLabel = useMemo(() => {
    const tc = timeControl as string;
    const base = parseInt(tc.split('+')[0]);
    if (base <= 2) return `${tc} · Bullet`;
    if (base <= 5) return `${tc} · Blitz`;
    return `${tc} · Rapid`;
  }, [timeControl]);

  /* ═══════════════════════════════════════════════════════════════════
   *  RENDER
   * ═══════════════════════════════════════════════════════════════════ */
  const topPlayer: PlayerInfo = {
    name: `Stockfish AI (${config.elo})`,
    avatarLetter: '🤖',
    avatarBg: '#D8B384',
    time: playerColor === 'white' ? timeBlack : timeWhite,
    isActive: activeTimer === aiTurn,
    capturedPieces: playerColor === 'white' ? capturedData.capturedByBlack : capturedData.capturedByWhite,
    capturedPieceColor: playerColor === 'white' ? 'w' : 'b',
    scoreAdvantage: playerColor === 'white' ? capturedData.blackAdvantage : capturedData.whiteAdvantage,
    isThinking: isAiThinking
  };

  const bottomPlayer: PlayerInfo = {
    name: 'You',
    avatarLetter: '👤',
    avatarBg: '#C9A84C',
    time: playerColor === 'white' ? timeWhite : timeBlack,
    isActive: activeTimer === playerTurn,
    capturedPieces: playerColor === 'white' ? capturedData.capturedByWhite : capturedData.capturedByBlack,
    capturedPieceColor: playerColor === 'white' ? 'b' : 'w',
    scoreAdvantage: playerColor === 'white' ? capturedData.whiteAdvantage : capturedData.blackAdvantage,
  };

  const boardComponent = (
    <ChessBoard
      position={currentViewFen}
      onMove={handlePlayerMove}
      orientation={orientation}
      disabled={!isPlayerTurn || gameOver || isAiThinking || viewMoveIndex !== -1}
      lastMove={currentLastMove}
      kingInCheck={currentKingInCheck}
      hintSquares={hintSquares}
    />
  );

  const evalBarComponent = (
    <EvalBar
      evaluation={evaluation}
      mateIn={mateIn}
      orientation={orientation}
    />
  );

  const bottomControls = gameOver ? (
    <div className="flex gap-2 p-3 border-b lg:border-t lg:border-b-0 border-[#1E2E52] order-2 lg:order-3 bg-[#1D1C1A]">
      <button onClick={handleNewGame} className="flex-1 py-3 bg-[#32312F] hover:bg-[#403F3C] text-gray-200 font-semibold rounded-md shadow flex items-center justify-center gap-2 transition-colors">
        <span className="text-xl leading-none font-light">+</span> New {parseInt(timeControl as string)} min
      </button>
      <button onClick={handleNewGame} className="flex-1 py-3 bg-[#32312F] hover:bg-[#403F3C] text-gray-200 font-semibold rounded-md shadow flex items-center justify-center gap-2 transition-colors">
        <span className="text-xl leading-none mt-[-2px]">↺</span> Rematch
      </button>
    </div>
  ) : (
    <div className="flex items-center border-b lg:border-t lg:border-b-0 border-[#1E2E52] order-2 lg:order-3">
      <button
        onClick={handleHint}
        disabled={!isPlayerTurn || isAiThinking}
        className="flex-1 flex items-center justify-center gap-1.5 py-3 text-sm text-gray-400 hover:text-[#C9A84C] hover:bg-[#0D1B3E] border-r border-[#1E2E52] transition-all disabled:opacity-30 disabled:cursor-not-allowed"
      >
        <span>💡</span> <span>Hint</span>
      </button>
      <button
        onClick={handleUndo}
        disabled={moveHistory.length < 2 || isAiThinking}
        className="flex-1 flex items-center justify-center gap-1.5 py-3 text-sm text-gray-400 hover:text-white hover:bg-[#0D1B3E] border-r border-[#1E2E52] transition-all disabled:opacity-30 disabled:cursor-not-allowed"
      >
        <span>↩</span> <span>Undo</span>
      </button>
      <button
        onClick={() => setShowResignConfirm(true)}
        disabled={moveHistory.length === 0}
        className="flex-1 flex items-center justify-center gap-1.5 py-3 text-sm text-gray-400 hover:text-red-400 hover:bg-[#0D1B3E] transition-all disabled:opacity-30 disabled:cursor-not-allowed"
      >
        <span>🏳️</span> <span>Resign</span>
      </button>
    </div>
  );

  const infoTabContent = (
    <div className="space-y-3 text-sm">
      <div className="flex items-center gap-2 text-gray-400">
        <span className="text-base">🕐</span>
        <span>Started: {gameStartTime.current.toLocaleString('en-US', {
          year: 'numeric', month: 'short', day: 'numeric',
          hour: 'numeric', minute: '2-digit', second: '2-digit',
          timeZoneName: 'short',
        })}</span>
      </div>
      <div className="flex items-center gap-2 text-gray-400">
        <span className="text-base">⏱</span>
        <span>Time: {tcLabel}</span>
      </div>
      <div className="flex items-center gap-2 text-gray-400">
        <span className="text-base">🤖</span>
        <span>Opponent: Stockfish AI</span>
      </div>
      <div className="flex items-center gap-2 text-gray-400">
        <span className="text-base">⚡</span>
        <span>Difficulty: {config.label} ({config.elo} Elo)</span>
      </div>
      <div className="flex items-center gap-2 text-gray-400">
        <span className="text-base">♟</span>
        <span>You play as: {playerColor === 'white' ? 'White' : 'Black'}</span>
      </div>
      <div className="flex items-center gap-2 text-gray-400">
        <span className="text-base">🔧</span>
        <span>Engine depth: {config.depth}, Skill Level: {config.skillLevel}</span>
      </div>

      {/* Divider */}
      <div className="w-full h-px bg-[#1E2E52] my-2" />

      {/* Status */}
      <div className="flex items-center gap-2">
        <span className="text-base">{gameOver ? '🏁' : '🎮'}</span>
        <span className={gameOver ? 'text-[#C9A84C] font-semibold' : 'text-green-400'}>
          {gameOver ? gameResult : 'Game in progress'}
        </span>
      </div>

      <div className="flex items-center gap-2 text-gray-400">
        <span className="text-base">📊</span>
        <span>Total moves: {moveHistory.length}</span>
      </div>
    </div>
  );

  return (
    <div className="h-auto lg:h-[calc(100vh-88px)] overflow-y-auto lg:overflow-hidden bg-dark-bg flex flex-col pt-3 lg:pt-4 pb-2 lg:pb-3">
      <ChessGameLayout
        boardComponent={boardComponent}
        evalBarComponent={null}
        topPlayer={topPlayer}
        bottomPlayer={bottomPlayer}
        sideTab={sideTab}
        onSideTabChange={setSideTab}
        moveRows={moveRows as any}
        highlightIdx={highlightIdx}
        onMoveClick={(idx) => {
          if (idx === moveHistory.length - 1) setViewMoveIndex(-1);
          else setViewMoveIndex(idx);
        }}
        viewMoveIndex={viewMoveIndex}
        totalMoves={moveHistory.length}
        onMoveNav={handleMoveNav}
        infoTabContent={infoTabContent}
        bottomControls={bottomControls}
        dialogs={(
          <>

            {/* ═══ Game Result Dialog ══════════════════════════════════════ */}
            {showResultDialog && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm animate-fadeIn">
                <div className="card-glow relative p-6 sm:p-8 mx-4 max-w-sm w-full text-center animate-slideUp border border-[#C9A84C]/50 bg-[#10193E]">
                  {/* Close Button */}
                  <button
                    onClick={() => setShowResultDialog(false)}
                    className="absolute top-3 right-3 text-gray-400 hover:text-white bg-[#1A2D52]/50 hover:bg-[#1A2D52] rounded-full p-1.5 transition-all"
                    aria-label="Close dialog"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>

                  <div className="text-5xl mb-3">{resultEmoji}</div>
                  <h2 className="text-white text-2xl font-black mb-1">{gameResult.split('—')[0]?.replace(/[🎉🤝🤖🏳️]/g, '') || gameResult}</h2>
                  <div className="text-gray-400 text-sm mb-4">
                    {gameResult.includes('—') ? gameResult.split('—')[1] : (gameResult.includes('Resign') ? 'Match Resigned' : 'Game Over')}
                  </div>

                  {/* Coach Speech */}
                  {isAnalyzing ? (
                    <div className="bg-[#1A2D52] rounded-lg p-4 mb-4 flex items-center gap-3">
                      <span className="text-2xl">👤</span>
                      <div className="text-left w-full">
                        <div className="text-sm text-gray-300">Coach is analyzing your game...</div>
                        <div className="w-full bg-[#0D1B3E] h-1.5 rounded-full mt-2 overflow-hidden">
                          <div className="h-full bg-[#C9A84C] w-1/2 animate-shimmer rounded-full"></div>
                        </div>
                      </div>
                    </div>
                  ) : analysisResult ? (
                    <div className="bg-[#1A2D52] rounded-lg p-4 mb-4 flex gap-3 text-left">
                      <span className="text-2xl mt-1">👤</span>
                      <p className="text-sm text-gray-200 italic leading-relaxed">
                        "{analysisResult.coachSummary}"
                      </p>
                    </div>
                  ) : null}

                  {/* Stats */}
                  {analysisResult && (
                    <div className="flex flex-wrap justify-center gap-x-3 gap-y-2 mb-5 text-sm font-semibold">
                      {(() => {
                        const stats = analysisResult.summary[playerColor];
                        const items = [
                          { label: 'Brilliant', value: stats.brilliant, icon: '!!', color: 'text-cyan-400' },
                          { label: 'Great', value: stats.great, icon: '!', color: 'text-blue-400' },
                          { label: 'Best', value: stats.best, icon: '★', color: 'text-[#96BC4B]' },
                          { label: 'Excellent', value: stats.excellent, icon: '👍', color: 'text-[#96BC4B]' },
                          { label: 'Good', value: stats.good, icon: '✓', color: 'text-green-500' },
                          { label: 'Book', value: stats.book, icon: '📖', color: 'text-[#C9A84C]' },
                          { label: 'Inaccuracy', value: stats.inaccuracy, icon: '?!', color: 'text-yellow-400' },
                          { label: 'Mistake', value: stats.mistake, icon: '?', color: 'text-orange-400' },
                          { label: 'Miss', value: stats.miss, icon: '✗', color: 'text-red-400' },
                          { label: 'Blunder', value: stats.blunder, icon: '??', color: 'text-red-600' },
                        ].filter(i => i.value > 0);

                        if (items.length === 0) return <span className="text-gray-400">No stats available</span>;

                        return items.map(item => (
                          <span key={item.label} className={`${item.color} flex items-center gap-1`}>
                            <span>{item.icon}</span> <span>{item.value} {item.label}</span>
                          </span>
                        ));
                      })()}
                    </div>
                  )}

                  <div className="space-y-2.5">
                    <button
                      disabled={isAnalyzing}
                      onClick={() => navigate('/analysis/' + (analysisResult?.id || ''), { state: { analysisResult } })}
                      className="w-full py-3.5 font-bold text-[15px] rounded-lg text-white disabled:opacity-50 transition-all shadow-lg flex items-center justify-center gap-2 hover:brightness-110"
                      style={{ background: 'linear-gradient(180deg, #81b64c 0%, #61893a 100%)' }}
                    >
                      <span>⭐</span> Game Review
                    </button>
                    <div className="flex gap-2">
                      <button onClick={handleNewGame} className="flex-1 btn-gold py-2.5 font-bold text-sm rounded-lg hover:brightness-110">
                        Rematch
                      </button>
                      <button onClick={() => navigate('/play')} className="flex-1 bg-[#1A2D52] text-gray-300 hover:text-white py-2.5 font-bold text-sm rounded-lg transition-colors border border-[#1E2E52]">
                        New Game
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ═══ Resign Confirmation ════════════════════════════════════ */}
            {showResignConfirm && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fadeIn">
                <div className="card p-6 mx-4 max-w-xs w-full text-center animate-slideUp">
                  <div className="text-4xl mb-3">🏳️</div>
                  <h3 className="text-white text-lg font-bold mb-2">Resign this game?</h3>
                  <p className="text-gray-400 text-sm mb-5">This action cannot be undone.</p>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowResignConfirm(false)}
                      className="flex-1 py-2.5 rounded-xl border border-divider text-gray-300 text-sm font-semibold hover:bg-navy-mid transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleResign}
                      className="flex-1 py-2.5 rounded-xl bg-red-900/40 border border-red-700/40 text-red-400 text-sm font-semibold hover:bg-red-800/50 transition-all"
                    >
                      Resign
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      />
    </div>
  );
}
