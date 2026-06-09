import React, { useState, useEffect, useMemo } from "react";
import { Chess } from "chess.js";
import ChessBoard from "../../../chess/ChessBoard";
import ChessGameLayout, { PlayerInfo, MoveRowData } from "../../../chess/ChessGameLayout";
import { FamousGame } from "../FamousGames";

/* ── Helpers for Parsing & Commentating ───────────────────────────────── */
function getMoveCommentary(move: string, index: number, color: 'w' | 'b') {
  const side = color === 'w' ? 'White' : 'Black';
  
  if (move === 'e4' || move === 'd4') {
    return `${side} opens with a central pawn advance, staking a claim in the center and opening lines for development.`;
  }
  if (move === 'e5' || move === 'd5') {
    return `${side} responds symmetrically, contesting control of the key central squares.`;
  }
  if (move.startsWith('Nf3') || move.startsWith('Nf6')) {
    return `${side} develops the knight to a natural square, controlling central squares and preparing king safety.`;
  }
  if (move.startsWith('Nc3') || move.startsWith('Nc6')) {
    return `${side} develops the knight towards the center, supporting central pawns and adding pressure.`;
  }
  if (move.startsWith('O-O')) {
    return `${side} castles, tucking the king away to safety and bringing the rook closer to the action.`;
  }
  if (move.includes('#')) {
    return `Checkmate! ${side} wins a brilliant historical game!`;
  }
  if (move.includes('+')) {
    return `${side} delivers a check, forcing the opponent's king to respond.`;
  }
  if (move.includes('x')) {
    return `${side} captures a piece, increasing the tactical tension on the board.`;
  }
  if (move.startsWith('B')) {
    return `${side} activates the bishop, placing it on an active diagonal to target key enemy weaknesses.`;
  }
  if (move.startsWith('Q')) {
    return `${side} brings out the queen, the most powerful piece on the board, to join the battle.`;
  }
  if (move.startsWith('R')) {
    return `${side} repositions the rook, aiming to control an open file or support the back rank.`;
  }
  
  return `${side} plays ${move}. Study how this move impacts the board control and coordinates with the other pieces.`;
}

/* ── GameViewer (Interactive Study Component) ─────────────────────────── */
interface GameViewerProps {
  game: FamousGame;
  onBack: () => void;
}

export default function GameViewer({ game, onBack }: GameViewerProps) {
  const [moveIdx, setMoveIdx] = useState(-1); // -1 is starting position
  const [orientation, setOrientation] = useState<'white' | 'black'>('white');
  const [sideTab, setSideTab] = useState<'moves' | 'info'>('moves');
  const [isPlaying, setIsPlaying] = useState(false);
  const [playSpeed, setPlaySpeed] = useState(2000); // milliseconds

  // Precompute FEN positions
  const fens = useMemo(() => {
    const list = [new Chess().fen()];
    const c = new Chess();
    for (const move of game.moves) {
      try {
        c.move(move);
        list.push(c.fen());
      } catch (e) {
        list.push(list[list.length - 1]);
      }
    }
    return list;
  }, [game]);

  // Precompute verbose moves (from, to squares) for highlighting
  const verboseMovesList = useMemo(() => {
    const c = new Chess();
    const list: { from: string; to: string; san: string; color: 'w' | 'b' }[] = [];
    for (const move of game.moves) {
      try {
        const result = c.move(move);
        list.push({
          from: result.from,
          to: result.to,
          san: result.san,
          color: result.color,
        });
      } catch (e) {
        list.push({ from: '', to: '', san: move, color: 'w' });
      }
    }
    return list;
  }, [game]);

  // Auto-play timer
  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;
    if (isPlaying) {
      timer = setInterval(() => {
        setMoveIdx(prev => {
          if (prev < game.moves.length - 1) {
            return prev + 1;
          } else {
            setIsPlaying(false);
            return prev;
          }
        });
      }, playSpeed);
    }
    return () => clearInterval(timer);
  }, [isPlaying, playSpeed, game]);

  // Bind Keyboard Navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft') {
        setMoveIdx(m => Math.max(-1, m - 1));
      } else if (event.key === 'ArrowRight') {
        setMoveIdx(m => Math.min(game.moves.length - 1, m + 1));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [game]);

  const currentFen = fens[moveIdx + 1];
  const lastMove = moveIdx >= 0 ? verboseMovesList[moveIdx] : null;

  // King check status
  const currentKingInCheck = useMemo(() => {
    const temp = new Chess(currentFen);
    if (temp.isCheck()) {
      const board = temp.board();
      const turn = temp.turn();
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
  }, [currentFen]);

  // Material captures
  const capturedData = useMemo(() => {
    const boardFen = currentFen.split(' ')[0];
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
      capturedByWhite,
      capturedByBlack,
      whiteAdvantage: diff > 0 ? diff : 0,
      blackAdvantage: diff < 0 ? -diff : 0
    };
  }, [currentFen]);

  // Dynamic layout players
  const playerWhite = {
    name: game.white,
    avatarLetter: 'W',
    avatarBg: '#D8B384',
    isActive: moveIdx === -1 || moveIdx % 2 !== 0,
    capturedPieces: capturedData.capturedByWhite,
    capturedPieceColor: 'b' as const,
    scoreAdvantage: capturedData.whiteAdvantage,
  };

  const playerBlack = {
    name: game.black,
    avatarLetter: 'B',
    avatarBg: '#32312F',
    isActive: moveIdx >= 0 && moveIdx % 2 === 0,
    capturedPieces: capturedData.capturedByBlack,
    capturedPieceColor: 'w' as const,
    scoreAdvantage: capturedData.blackAdvantage,
  };

  const topPlayer: PlayerInfo = orientation === 'white' ? playerBlack : playerWhite;
  const bottomPlayer: PlayerInfo = orientation === 'white' ? playerWhite : playerBlack;

  // Format move rows for Sidebar Moves List
  const moveRows = useMemo(() => {
    const rows: MoveRowData[] = [];
    const moves = game.moves;
    for (let i = 0; i < moves.length; i += 2) {
      rows.push({
        num: Math.floor(i / 2) + 1,
        white: moves[i] ? { san: moves[i], color: 'w' as const } : null,
        black: moves[i + 1] ? { san: moves[i + 1], color: 'b' as const } : null,
        whiteIdx: i,
        blackIdx: i + 1 < moves.length ? i + 1 : null,
      });
    }
    return rows;
  }, [game.moves]);

  // Commentary
  const currentMoveSan = moveIdx >= 0 ? game.moves[moveIdx] : '';
  const currentMoveColor = moveIdx >= 0 ? (moveIdx % 2 === 0 ? 'w' : 'b') : 'w';

  const moveCommentary = useMemo(() => {
    if (moveIdx === -1) {
      return "Study this legendary chess game. Use keyboard Left/Right arrows or the Autoplay button to step through moves!";
    }
    if (game.commentary && game.commentary[moveIdx]) {
      return game.commentary[moveIdx];
    }
    return getMoveCommentary(currentMoveSan, moveIdx, currentMoveColor);
  }, [moveIdx, game, currentMoveSan, currentMoveColor]);

  // Sidebar Commentary Box
  const topSidePanelContent = (
    <div className="p-4 min-h-[110px] flex border-b border-[#2B2927] bg-[#191815] flex-shrink-0">
      <div className="bg-white text-[#111] rounded-xl p-4 shadow-lg flex-1 border-2 border-[#C9A84C]/80 flex gap-3 text-left">
        <span className="text-2xl mt-0.5 select-none">👤</span>
        <div className="overflow-hidden">
          <div className="text-[10px] text-[#C9A84C] font-black uppercase tracking-wider mb-0.5 select-none">Coach Commentary</div>
          <p className="text-xs text-gray-800 leading-relaxed font-medium">
            {moveCommentary}
          </p>
        </div>
      </div>
    </div>
  );

  const boardComponent = (
    <ChessBoard
      position={currentFen}
      onMove={() => false} // study mode is read-only
      orientation={orientation}
      disabled={true}
      lastMove={lastMove}
      kingInCheck={currentKingInCheck}
    />
  );

  const bottomControls = (
    <div className="flex gap-2 p-3 border-b lg:border-t lg:border-b-0 border-[#1E2E52] order-2 lg:order-3 bg-[#1D1C1A] flex-shrink-0">
      <button
        onClick={onBack}
        className="flex-1 py-2.5 bg-[#32312F] hover:bg-[#403F3C] text-gray-200 font-semibold rounded-md shadow flex items-center justify-center gap-1.5 transition-colors text-xs"
      >
        <span>🔙</span> Back to List
      </button>
      <button
        onClick={() => setOrientation(o => o === 'white' ? 'black' : 'white')}
        className="flex-1 py-2.5 bg-[#32312F] hover:bg-[#403F3C] text-gray-200 font-semibold rounded-md shadow flex items-center justify-center gap-1.5 transition-colors text-xs"
      >
        <span>🔄</span> Flip Board
      </button>
      <button
        onClick={() => setIsPlaying(p => !p)}
        className={`flex-1 py-2.5 font-bold rounded-md shadow flex items-center justify-center gap-1.5 transition-all text-xs ${
          isPlaying 
            ? 'bg-amber-600 text-white hover:bg-amber-700' 
            : 'bg-[#C9A84C] text-[#101c3e] hover:brightness-110'
        }`}
      >
        <span>{isPlaying ? '⏸️ Pause' : '▶️ Autoplay'}</span>
      </button>
    </div>
  );

  const infoTabContent = (
    <div className="space-y-4 text-sm text-gray-300">
      <div className="flex items-center gap-2 text-gray-400">
        <span className="text-base select-none">🏆</span>
        <span>Event: {game.event}</span>
      </div>
      <div className="flex items-center gap-2 text-gray-400">
        <span className="text-base select-none">📅</span>
        <span>Year: {game.year}</span>
      </div>
      <div className="flex items-center gap-2 text-gray-400">
        <span className="text-base select-none">🏁</span>
        <span>Result: {game.result}</span>
      </div>
      <div className="flex items-center gap-2 text-gray-400">
        <span className="text-base select-none">📊</span>
        <span>Total Moves: {game.moves.length} moves</span>
      </div>
      
      <div className="w-full h-px bg-[#1E2E52] my-2" />
      
      {/* Autoplay Speed Control */}
      <div className="space-y-2">
        <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500 select-none">Autoplay Speed</label>
        <div className="flex gap-2">
          {([
            { label: 'Slow (3s)', val: 3000 },
            { label: 'Normal (2s)', val: 2000 },
            { label: 'Fast (1s)', val: 1000 }
          ]).map(speed => (
            <button
              key={speed.val}
              onClick={() => setPlaySpeed(speed.val)}
              className={`flex-1 py-2 rounded text-[11px] font-bold border transition-all ${
                playSpeed === speed.val
                  ? 'bg-[#C9A84C]/20 border-[#C9A84C] text-[#E7CB75]'
                  : 'bg-navy border-[#1E2E52] text-gray-400 hover:text-white'
              }`}
            >
              {speed.label}
            </button>
          ))}
        </div>
      </div>
      
      <div className="w-full h-px bg-[#1E2E52] my-2" />
      
      <div className="bg-[#191815] rounded-lg p-3 border border-white/5 space-y-1.5 text-xs text-gray-400 select-none">
        <p className="font-semibold text-gray-200">Study Tips:</p>
        <p>• Use your Keyboard Left/Right Arrow keys to step through moves quickly.</p>
        <p>• Click any move in the list to jump straight to that position.</p>
        <p>• Autoplay will automatically step through the entire game at your selected speed.</p>
      </div>
    </div>
  );

  return (
    <div className="h-auto lg:h-[calc(100vh-88px)] overflow-y-auto lg:overflow-hidden bg-dark-bg flex flex-col pt-3 lg:pt-4 pb-2 lg:pb-3 w-full">
      <ChessGameLayout
        boardComponent={boardComponent}
        evalBarComponent={null}
        topPlayer={topPlayer}
        bottomPlayer={bottomPlayer}
        sideTab={sideTab}
        onSideTabChange={setSideTab}
        moveRows={moveRows}
        highlightIdx={moveIdx}
        onMoveClick={setMoveIdx}
        viewMoveIndex={moveIdx}
        totalMoves={game.moves.length}
        onMoveNav={(dir) => {
          if (dir === 'first') setMoveIdx(-1);
          else if (dir === 'prev') setMoveIdx(m => Math.max(-1, m - 1));
          else if (dir === 'next') setMoveIdx(m => Math.min(game.moves.length - 1, m + 1));
          else if (dir === 'last') setMoveIdx(game.moves.length - 1);
        }}
        infoTabContent={infoTabContent}
        bottomControls={bottomControls}
        topSidePanelContent={topSidePanelContent}
        autoScroll={true}
        mobilePanelHeight="480px"
      />
    </div>
  );
}
