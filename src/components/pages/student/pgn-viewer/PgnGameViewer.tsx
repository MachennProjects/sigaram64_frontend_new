import React, { useState, useEffect } from 'react';
import ChessBoard from "../../../chess/ChessBoard";
import ChessGameLayout, { PlayerInfo, MoveRowData } from "../../../chess/ChessGameLayout";
import { ParsedGame } from './types';

interface PgnGameViewerProps {
  game: ParsedGame;
  gamesCount: number;
  activeGameIdx: number;
  onGameSelect: (idx: number) => void;
  onBack: () => void;
  onLoadNew: () => void;
}

export default function PgnGameViewer({
  game,
  gamesCount,
  activeGameIdx,
  onGameSelect,
  onBack,
  onLoadNew
}: PgnGameViewerProps) {
  const [moveIndex, setMoveIndex] = useState(-1);
  const [sideTab, setSideTab] = useState<'moves' | 'info'>('moves');
  const [orientation, setOrientation] = useState<'white' | 'black'>('white');
  const [isAutoplay, setIsAutoplay] = useState(false);
  const [autoplaySpeed, setAutoplaySpeed] = useState(1500);

  useEffect(() => {
    setMoveIndex(-1);
    setIsAutoplay(false);
  }, [game]);

  const handleMoveNav = (dir: 'first' | 'prev' | 'next' | 'last') => {
    const total = game.moves.length;
    let nextIdx = moveIndex;
    switch (dir) {
      case 'first': nextIdx = -1; break;
      case 'prev': nextIdx = Math.max(-1, moveIndex - 1); break;
      case 'next': nextIdx = Math.min(total - 1, moveIndex + 1); break;
      case 'last': nextIdx = total - 1; break;
    }
    setMoveIndex(nextIdx);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handleMoveNav('prev');
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleMoveNav('next');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [moveIndex, game]);

  useEffect(() => {
    if (!isAutoplay) return;
    const interval = setInterval(() => {
      setMoveIndex((prev) => {
        if (prev >= game.moves.length - 1) {
          setIsAutoplay(false);
          return prev;
        }
        return prev + 1;
      });
    }, autoplaySpeed);
    return () => clearInterval(interval);
  }, [isAutoplay, autoplaySpeed, game]);

  const currentMove = moveIndex >= 0 ? game.moves[moveIndex] : null;
  const currentFen = currentMove ? currentFenFromMove(currentMove) : game.startFen;
  
  function currentFenFromMove(mv: any) {
    return mv.fen || game.startFen;
  }

  const currentMoveComment = currentMove ? currentMove.comment : game.startComment;

  const boardFen = currentFen.split(' ')[0];
  const counts: Record<string, number> = {
    p: 0, n: 0, b: 0, r: 0, q: 0,
    P: 0, N: 0, B: 0, R: 0, Q: 0
  };
  for (const char of boardFen) {
    if (counts.hasOwnProperty(char)) counts[char]++;
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

  const topPlayer: PlayerInfo = {
    name: orientation === 'white' ? (game.headers['Black'] || 'Black') : (game.headers['White'] || 'White'),
    avatarLetter: orientation === 'white' ? '♟' : '♙',
    avatarBg: '#2a2825',
    isActive: moveIndex >= 0 && game.moves[moveIndex].color === (orientation === 'white' ? 'b' : 'w'),
    capturedPieces: orientation === 'white' ? capturedByBlack : capturedByWhite,
    capturedPieceColor: orientation === 'white' ? 'w' : 'b',
    scoreAdvantage: orientation === 'white' ? (diff < 0 ? -diff : 0) : (diff > 0 ? diff : 0),
  };

  const bottomPlayer: PlayerInfo = {
    name: orientation === 'white' ? (game.headers['White'] || 'White') : (game.headers['Black'] || 'Black'),
    avatarLetter: orientation === 'white' ? '♙' : '♟',
    avatarBg: '#C9A84C',
    isActive: moveIndex === -1 || game.moves[moveIndex].color === (orientation === 'white' ? 'w' : 'b'),
    capturedPieces: orientation === 'white' ? capturedByWhite : capturedByBlack,
    capturedPieceColor: orientation === 'white' ? 'b' : 'w',
    scoreAdvantage: orientation === 'white' ? (diff > 0 ? diff : 0) : (diff < 0 ? -diff : 0),
  };

  const boardComponent = (
    <ChessBoard
      position={currentFen}
      orientation={orientation}
      disabled={true}
      lastMove={currentMove ? { from: currentMove.from, to: currentMove.to } : null}
      onMove={() => false}
    />
  );

  const moveRows: MoveRowData[] = [];
  for (let i = 0; i < game.moves.length; i += 2) {
    moveRows.push({
      num: Math.floor(i / 2) + 1,
      white: game.moves[i] ? { san: game.moves[i].san, color: 'w' as const } : null,
      black: game.moves[i + 1] ? { san: game.moves[i + 1].san, color: 'b' as const } : null,
      whiteIdx: i,
      blackIdx: i + 1 < game.moves.length ? i + 1 : null,
    });
  }

  const topSidePanelContent = (
    <div className="flex flex-col select-none">
      {gamesCount > 1 && (
        <div className="p-3 border-b border-[#1E2E52] bg-[#0D1B3E]">
          <label className="block text-[10px] font-bold text-[#C9A84C] uppercase tracking-wider mb-1">
            Select Game ({gamesCount} Loaded)
          </label>
          <select
            value={activeGameIdx}
            onChange={(e) => onGameSelect(Number(e.target.value))}
            className="w-full bg-[#12234A] border border-[#1E2E52] rounded-lg px-2.5 py-1.5 text-xs text-white font-medium focus:outline-none focus:border-gold"
          >
            {Array.from({ length: gamesCount }).map((_, idx) => (
              <option key={idx} value={idx}>Game {idx + 1}</option>
            ))}
          </select>
        </div>
      )}
      <div className="p-4 min-h-[110px] flex border-b border-[#2B2927] bg-[#191815] flex-shrink-0">
        <div className="bg-white text-[#111] rounded-xl p-4 shadow-lg flex-1 border-2 border-[#C9A84C]/80 flex gap-3 text-left">
          <span className="text-2xl mt-0.5 select-none">👤</span>
          <div className="overflow-hidden">
            <div className="text-[10px] text-[#C9A84C] font-black uppercase tracking-wider mb-0.5 select-none">Commentary</div>
            <p className="text-xs text-gray-800 leading-relaxed font-medium">
              {currentMoveComment ? currentMoveComment : "No notes for this move."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const infoTabContent = (
    <div className="space-y-4 text-sm text-gray-300">
      <div className="flex items-center gap-2 text-gray-400">
        <span className="text-base select-none">🏆</span>
        <span>Event: {game.headers['Event'] || '?'}</span>
      </div>
      <div className="flex items-center gap-2 text-gray-400">
        <span className="text-base select-none">📅</span>
        <span>Date: {game.headers['Date'] || '?'}</span>
      </div>
      <div className="flex items-center gap-2 text-gray-400">
        <span className="text-base select-none">🏁</span>
        <span>Result: {game.headers['Result'] || '*'}</span>
      </div>
      <div className="flex items-center gap-2 text-gray-400">
        <span className="text-base select-none">📊</span>
        <span>Total Moves: {game.moves.length} moves</span>
      </div>
      
      <div className="w-full h-px bg-[#1E2E52] my-2" />
      
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
              onClick={() => setAutoplaySpeed(speed.val)}
              className={`flex-1 py-2 rounded text-[11px] font-bold border transition-all ${
                autoplaySpeed === speed.val
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

  const bottomControls = (
    <div className="flex gap-2 p-3 border-b lg:border-t lg:border-b-0 border-[#1E2E52] order-2 lg:order-3 bg-[#1D1C1A] flex-shrink-0">
      <button
        onClick={onBack}
        className="flex-1 py-2.5 bg-[#32312F] hover:bg-[#403F3C] text-gray-200 font-semibold rounded-md shadow flex items-center justify-center gap-1.5 transition-colors text-xs"
      >
        <span>🔙</span> Back
      </button>
      <button
        onClick={() => setOrientation(o => o === 'white' ? 'black' : 'white')}
        className="flex-1 py-2.5 bg-[#32312F] hover:bg-[#403F3C] text-gray-200 font-semibold rounded-md shadow flex items-center justify-center gap-1.5 transition-colors text-xs"
      >
        <span>🔄</span> Flip Board
      </button>
      <button
        onClick={onLoadNew}
        className="flex-1 py-2.5 bg-[#32312F] hover:bg-[#403F3C] text-gray-200 font-semibold rounded-md shadow flex items-center justify-center gap-1.5 transition-colors text-xs"
      >
        <span>📂</span> Load New PGN
      </button>
      <button
        onClick={() => setIsAutoplay(p => !p)}
        className={`flex-1 py-2.5 font-bold rounded-md shadow flex items-center justify-center gap-1.5 transition-all text-xs ${
          isAutoplay 
            ? 'bg-amber-600 text-white hover:bg-amber-700' 
            : 'bg-[#C9A84C] text-[#101c3e] hover:brightness-110'
        }`}
      >
        <span>{isAutoplay ? '⏸️ Pause' : '▶️ Autoplay'}</span>
      </button>
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
        highlightIdx={moveIndex}
        onMoveClick={(idx) => setMoveIndex(idx)}
        viewMoveIndex={moveIndex}
        totalMoves={game.moves.length}
        onMoveNav={handleMoveNav}
        infoTabContent={infoTabContent}
        topSidePanelContent={topSidePanelContent}
        autoScroll={true}
        mobilePanelHeight="480px"
        bottomControls={bottomControls}
      />
    </div>
  );
}
