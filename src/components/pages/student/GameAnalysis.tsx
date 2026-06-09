import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { GameAnalysisResult, AnalyzedMove, MoveClass } from '../../../engine/gameAnalyzer';
import ChessBoard from '../../chess/ChessBoard';
import EvalBar from '../../chess/EvalBar';
import ChessGameLayout, { PlayerInfo } from '../../chess/ChessGameLayout';

const MOVE_COLORS: Record<MoveClass, string> = {
  brilliant: '#1BACA6',
  great: '#5C8BB0',
  book: '#A88B65',
  best: '#96BC4B',
  excellent: '#96BC4B',
  good: '#6BAA64',
  inaccuracy: '#E6A42B',
  mistake: '#E68A2B',
  miss: '#CA3431',
  blunder: '#CA3431',
};

const MOVE_ICONS: Record<MoveClass, string> = {
  brilliant: '‼',
  great: '!',
  book: '📖',
  best: '★',
  excellent: '👍',
  good: '✓',
  inaccuracy: '?!',
  mistake: '?',
  miss: '✗',
  blunder: '??',
};

function CoachBubble({ move }: { move: AnalyzedMove }) {
  return (
    <div className="bg-white text-[#111] rounded-xl p-4 shadow-lg flex-1 relative max-w-sm border-2" style={{ borderColor: MOVE_COLORS[move.classification] }}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2 font-medium">
          <div
            className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs flex-shrink-0"
            style={{ backgroundColor: MOVE_COLORS[move.classification] }}
          >
            {MOVE_ICONS[move.classification]}
          </div>
          <span className="text-sm">{move.comment}</span>
        </div>
        <div className="bg-[#EBEBEB] px-2 py-0.5 rounded text-sm font-bold shadow-sm whitespace-nowrap">
          {(move.evaluation / 100).toFixed(2)}
        </div>
      </div>
    </div>
  );
}

function EvalSparkline({
  moves,
  currentIdx,
  onJump
}: {
  moves: AnalyzedMove[];
  currentIdx: number;
  onJump: (idx: number) => void;
}) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const width = 1000;
  const height = 100;
  const margin = 12; // vertical margin to prevent clipping

  const step = width / Math.max(1, moves.length);

  // Get coordinates for all moves (plus start position)
  const coords = useMemo(() => {
    if (moves.length === 0) return [];

    // Start at x = 0, y = center (equal evaluation)
    const points = [{ x: 0, y: height / 2 }];

    moves.forEach((m, i) => {
      const clamped = Math.max(-1000, Math.min(1000, m.evaluation));
      const y = height / 2 - (clamped / 1000) * (height / 2 - margin);
      points.push({ x: (i + 1) * step, y });
    });

    return points;
  }, [moves, step]);

  // Generate smooth Catmull-Rom spline as SVG Path
  const linePath = useMemo(() => {
    if (coords.length === 0) return '';
    if (coords.length === 1) return `M ${coords[0].x} ${coords[0].y}`;

    let d = `M ${coords[0].x} ${coords[0].y}`;
    const smoothing = 0.15; // smooth factor

    for (let i = 0; i < coords.length - 1; i++) {
      const p0 = coords[Math.max(0, i - 1)];
      const p1 = coords[i];
      const p2 = coords[i + 1];
      const p3 = coords[Math.min(coords.length - 1, i + 2)];

      const cp1x = p1.x + (p2.x - p0.x) * smoothing;
      const cp1y = p1.y + (p2.y - p0.y) * smoothing;

      const cp2x = p2.x - (p3.x - p1.x) * smoothing;
      const cp2y = p2.y - (p3.y - p1.y) * smoothing;

      d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
    }
    return d;
  }, [coords]);

  // Generate the closed path for filling the area between the curve and center line
  const fillPath = useMemo(() => {
    if (coords.length === 0) return '';
    return `${linePath} L ${width} ${height / 2} L 0 ${height / 2} Z`;
  }, [coords, linePath]);

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (moves.length === 0) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const pct = x / rect.width;
    const idx = Math.floor(pct * moves.length);
    setHoveredIdx(Math.max(0, Math.min(moves.length - 1, idx)));
  };

  const handleMouseLeave = () => {
    setHoveredIdx(null);
  };

  const handleClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (moves.length === 0) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const pct = x / rect.width;
    const idx = Math.floor(pct * moves.length);
    onJump(Math.max(0, Math.min(moves.length - 1, idx)));
  };

  // Get coordinates for active or hovered index
  const getIndexCoords = (idx: number) => {
    if (idx < 0 || idx >= moves.length) return { x: 0, y: height / 2 };
    const x = (idx + 1) * step;
    const clamped = Math.max(-1000, Math.min(1000, moves[idx].evaluation));
    const y = height / 2 - (clamped / 1000) * (height / 2 - margin);
    return { x, y };
  };

  const currentCoords = currentIdx >= 0 ? getIndexCoords(currentIdx) : { x: 0, y: height / 2 };
  const hoveredCoords = hoveredIdx !== null ? getIndexCoords(hoveredIdx) : null;

  return (
    <div className="w-full h-[70px] bg-[#191815] border-t border-[#2B2927] relative overflow-hidden group flex-shrink-0 select-none">
      {/* Gradients definition */}
      <svg className="absolute w-0 h-0">
        <defs>
          <linearGradient id="sparklineFillGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#96BC4B" stopOpacity="0.25" />
            <stop offset="45%" stopColor="#96BC4B" stopOpacity="0.01" />
            <stop offset="50%" stopColor="#000000" stopOpacity="0" />
            <stop offset="55%" stopColor="#CA3431" stopOpacity="0.01" />
            <stop offset="100%" stopColor="#CA3431" stopOpacity="0.25" />
          </linearGradient>
          <linearGradient id="sparklineStrokeGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#96BC4B" />
            <stop offset="50%" stopColor="#E2E8F0" />
            <stop offset="100%" stopColor="#CA3431" />
          </linearGradient>
        </defs>
      </svg>

      {/* Main Sparkline Graph */}
      <svg
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="none"
        className="w-full h-full cursor-pointer"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
      >
        {/* Baseline (0.0 evaluation) */}
        <line
          x1="0"
          y1={height / 2}
          x2={width}
          y2={height / 2}
          stroke="rgba(255,255,255,0.12)"
          strokeWidth="1.5"
          strokeDasharray="4 4"
        />

        {/* Area Fill */}
        {fillPath && (
          <path
            d={fillPath}
            fill="url(#sparklineFillGradient)"
          />
        )}

        {/* Smooth Trendline */}
        {linePath && (
          <path
            d={linePath}
            fill="none"
            stroke="url(#sparklineStrokeGradient)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}

        {/* Blunder/Mistake/Miss Markers */}
        {moves.map((m, i) => {
          // Do not clutter the sparkline with standard moves; only mark significant swings
          if (m.classification === 'best' || m.classification === 'good' || m.classification === 'book' || m.classification === 'excellent') {
            return null;
          }
          const { x, y } = getIndexCoords(i);
          const isMajor = m.classification === 'blunder' || m.classification === 'miss';
          return (
            <circle
              key={i}
              cx={x}
              cy={y}
              r={isMajor ? 4.5 : 3.5}
              fill={MOVE_COLORS[m.classification]}
              stroke="#191815"
              strokeWidth="1.5"
              className="transition-all duration-150 hover:scale-150"
              onClick={(e) => {
                e.stopPropagation();
                onJump(i);
              }}
            />
          );
        })}

        {/* Hover vertical line and dot */}
        {hoveredCoords && (
          <g>
            <line
              x1={hoveredCoords.x}
              y1={0}
              x2={hoveredCoords.x}
              y2={height}
              stroke="rgba(255, 255, 255, 0.2)"
              strokeWidth="1"
              strokeDasharray="3 3"
            />
            <circle
              cx={hoveredCoords.x}
              cy={hoveredCoords.y}
              r="4.5"
              fill="#fff"
              stroke="rgba(255, 255, 255, 0.5)"
              strokeWidth="1.5"
            />
          </g>
        )}

        {/* Current Move vertical line and glowing dot */}
        {currentCoords && (
          <g>
            <line
              x1={currentCoords.x}
              y1={0}
              x2={currentCoords.x}
              y2={height}
              stroke="rgba(150, 188, 75, 0.45)"
              strokeWidth="1.5"
              strokeDasharray="2 2"
            />
            {/* Glow ring */}
            <circle
              cx={currentCoords.x}
              cy={currentCoords.y}
              r="7"
              fill="#96BC4B"
              opacity="0.35"
              className="animate-pulse"
            />
            {/* Core dot */}
            <circle
              cx={currentCoords.x}
              cy={currentCoords.y}
              r="3.5"
              fill="#fff"
              stroke="#96BC4B"
              strokeWidth="2"
            />
          </g>
        )}
      </svg>

      {/* Floating Tooltip Info */}
      {hoveredIdx !== null && hoveredIdx < moves.length && (() => {
        const move = moves[hoveredIdx];
        const moveNum = Math.floor(hoveredIdx / 2) + 1;
        const isWhite = hoveredIdx % 2 === 0;
        const moveStr = isWhite ? `${moveNum}.` : `${moveNum}...`;
        const evalVal = move.evaluation / 100;
        const evalStr = evalVal > 0 ? `+${evalVal.toFixed(2)}` : evalVal.toFixed(2);

        return (
          <div className="absolute top-2 left-3 bg-[#191815]/95 backdrop-blur-sm border border-[#2B2927] px-2.5 py-1 rounded text-[11px] font-semibold text-gray-200 pointer-events-none flex items-center gap-1.5 shadow-lg select-none">
            <span
              className="w-2.5 h-2.5 rounded-full flex items-center justify-center text-[8px] text-white font-bold leading-none"
              style={{ backgroundColor: MOVE_COLORS[move.classification] }}
            >
              {MOVE_ICONS[move.classification].replace(/[📖★👍✓]/g, '')}
            </span>
            <span>
              Move {moveStr} {move.san}
            </span>
            <span className="text-gray-400">|</span>
            <span className={evalVal > 0 ? 'text-[#96BC4B]' : evalVal < 0 ? 'text-[#CA3431]' : 'text-gray-300'}>
              {evalStr}
            </span>
            <span className="text-gray-400">|</span>
            <span className="capitalize" style={{ color: MOVE_COLORS[move.classification] }}>
              {move.classification}
            </span>
          </div>
        );
      })()}
    </div>
  );
}

// Map square (e.g., 'e2') to SVG coordinates (0-100%)
function getSquareCenter(sq: string, orientation: 'white' | 'black') {
  const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
  const ranks = ['1', '2', '3', '4', '5', '6', '7', '8'];

  let fIdx = files.indexOf(sq[0]);
  let rIdx = ranks.indexOf(sq[1]);

  if (orientation === 'black') {
    fIdx = 7 - fIdx;
    rIdx = 7 - rIdx;
  }

  return {
    x: (fIdx + 0.5) * 12.5,
    y: (7 - rIdx + 0.5) * 12.5
  };
}

export default function GameAnalysis() {
  const location = useLocation();
  const navigate = useNavigate();
  const { uid } = useParams();
  const analysisResult = location.state?.analysisResult as GameAnalysisResult | undefined;

  const [sideTab, setSideTab] = useState<'moves' | 'info'>('moves');
  const [moveIndex, setMoveIndex] = useState(-1); // -1 = start pos, 0 = first move
  const [showBestMove, setShowBestMove] = useState(false);
  const [orientation, setOrientation] = useState<'white' | 'black'>('white');
  const [isPlaying, setIsPlaying] = useState(false);
  const [playSpeed, setPlaySpeed] = useState(2000); // milliseconds

  useEffect(() => {
    if (!analysisResult) {
      if (uid) {
        navigate(`/students/${uid}`);
      } else {
        navigate('/play');
      }
    } else {
      setMoveIndex(-1);
      setOrientation(analysisResult.playerColor);
      setIsPlaying(false);
    }
  }, [analysisResult, navigate, uid]);

  // Keyboard Navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        setIsPlaying(false);
        setMoveIndex(m => Math.max(-1, m - 1));
      } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        setIsPlaying(false);
        if (analysisResult) {
          setMoveIndex(m => Math.min(analysisResult.moves.length - 1, m + 1));
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [analysisResult]);

  // Auto-play timer
  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;
    if (isPlaying) {
      timer = setInterval(() => {
        setMoveIndex(prev => {
          if (!analysisResult) return prev;
          if (prev < analysisResult.moves.length - 1) {
            return prev + 1;
          } else {
            setIsPlaying(false);
            return prev;
          }
        });
      }, playSpeed);
    }
    return () => clearInterval(timer);
  }, [isPlaying, playSpeed, analysisResult]);

  if (!analysisResult) return <div className="p-8 text-white">Loading...</div>;

  const currentMove = moveIndex >= 0 ? analysisResult.moves[moveIndex] : null;
  const currentFen = currentMove ? currentMove.fen : (analysisResult.moves[0]?.fenBefore || 'start');

  const handleMoveNav = (dir: 'first' | 'prev' | 'next' | 'last') => {
    setIsPlaying(false);
    const total = analysisResult.moves.length;
    if (total === 0) return;
    const current = moveIndex;
    let next: number;
    switch (dir) {
      case 'first': next = -1; break;
      case 'prev': next = Math.max(-1, current - 1); break;
      case 'next': next = Math.min(total - 1, current + 1); break;
      case 'last': next = total - 1; break;
      default: return;
    }
    setMoveIndex(next);
  };

  const handleNextSignificant = () => {
    if (!analysisResult) return;
    const nextIdx = analysisResult.moves.findIndex((m, i) =>
      i > moveIndex &&
      (m.classification === 'blunder' || m.classification === 'miss' || m.classification === 'mistake' || m.classification === 'brilliant' || m.classification === 'great')
    );
    if (nextIdx !== -1) setMoveIndex(nextIdx);
    else setMoveIndex(analysisResult.moves.length - 1);
  };

  // ── Build paired move rows ────────────
  const moveRows = useMemo(() => {
    const rows = [];
    const moves = analysisResult.moves;
    for (let i = 0; i < moves.length; i += 2) {
      rows.push({
        num: Math.floor(i / 2) + 1,
        white: moves[i] ? {
          san: moves[i].san,
          color: 'w' as const,
          icon: <div className="w-4 h-4 rounded-full flex items-center justify-center text-[10px] text-white" style={{ backgroundColor: MOVE_COLORS[moves[i].classification] }}>{MOVE_ICONS[moves[i].classification]}</div>
        } : null,
        black: moves[i + 1] ? {
          san: moves[i + 1].san,
          color: 'b' as const,
          icon: <div className="w-4 h-4 rounded-full flex items-center justify-center text-[10px] text-white" style={{ backgroundColor: MOVE_COLORS[moves[i + 1].classification] }}>{MOVE_ICONS[moves[i + 1].classification]}</div>
        } : null,
        whiteIdx: i,
        blackIdx: i + 1 < moves.length ? i + 1 : null,
      });
    }
    return rows;
  }, [analysisResult.moves]);

  const capturedData = useMemo(() => {
    let fenToParse = currentFen;
    if (!fenToParse || fenToParse === 'start') {
      fenToParse = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
    }
    const boardFen = fenToParse.split(' ')[0];
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
  }, [currentFen]);

  const playerWhite: PlayerInfo = {
    name: analysisResult.playerColor === 'white' ? 'You' : 'Opponent',
    avatarLetter: '♙',
    avatarBg: analysisResult.playerColor === 'white' ? '#C9A84C' : '#2a2825',
    time: 0,
    isActive: moveIndex === -1 || (moveIndex >= 0 && analysisResult.moves[moveIndex].color === 'b'),
    capturedPieces: capturedData.capturedByWhite,
    capturedPieceColor: 'b',
    scoreAdvantage: capturedData.whiteAdvantage,
  };

  const playerBlack: PlayerInfo = {
    name: analysisResult.playerColor === 'black' ? 'You' : 'Opponent',
    avatarLetter: '♟',
    avatarBg: analysisResult.playerColor === 'black' ? '#C9A84C' : '#2a2825',
    time: 0,
    isActive: moveIndex >= 0 && analysisResult.moves[moveIndex].color === 'w',
    capturedPieces: capturedData.capturedByBlack,
    capturedPieceColor: 'w',
    scoreAdvantage: capturedData.blackAdvantage,
  };

  const topPlayer: PlayerInfo = orientation === 'white' ? playerBlack : playerWhite;
  const bottomPlayer: PlayerInfo = orientation === 'white' ? playerWhite : playerBlack;

  const boardComponent = (
    <div className="relative w-full aspect-square shadow-2xl rounded-sm">
      <ChessBoard
        position={currentFen}
        orientation={orientation}
        disabled={true}
        lastMove={currentMove ? { from: currentMove.from, to: currentMove.to } : null}
        onMove={() => false}
      />
      {(showBestMove || (currentMove && (currentMove.classification === 'blunder' || currentMove.classification === 'miss' || currentMove.classification === 'mistake'))) && currentMove?.bestMoveFrom && currentMove?.bestMoveTo && (
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-10" style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))' }}>
          <defs>
            <marker id="arrowhead" markerWidth="3" markerHeight="3" refX="2.5" refY="1.5" orient="auto">
              <polygon points="0 0, 3 1.5, 0 3" fill="#96BC4B" opacity="0.9" />
            </marker>
          </defs>
          <line
            x1={`${getSquareCenter(currentMove.bestMoveFrom, orientation).x}%`}
            y1={`${getSquareCenter(currentMove.bestMoveFrom, orientation).y}%`}
            x2={`${getSquareCenter(currentMove.bestMoveTo, orientation).x}%`}
            y2={`${getSquareCenter(currentMove.bestMoveTo, orientation).y}%`}
            stroke="#96BC4B"
            strokeWidth="1.8%"
            strokeLinecap="round"
            opacity="0.9"
            markerEnd="url(#arrowhead)"
          />
        </svg>
      )}
    </div>
  );

  const bottomControls = (
    <div className="flex gap-2 p-3 border-b lg:border-t lg:border-b-0 border-[#1E2E52] order-2 lg:order-3 bg-[#1D1C1A] flex-shrink-0">
      <button
        onClick={() => {
          setIsPlaying(false);
          if (uid) {
            navigate(`/students/${uid}`);
          } else {
            navigate('/play');
          }
        }}
        className="flex-1 py-2.5 bg-[#32312F] hover:bg-[#403F3C] text-gray-200 font-semibold rounded-md shadow flex items-center justify-center gap-1.5 transition-colors text-xs"
      >
        <span>{uid ? '🔙' : '+'}</span> {uid ? 'Back to Profile' : 'New Game'}
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

  const topSidePanelContent = (
    <div className="flex flex-col">
      {/* Coach Feedback Area */}
      <div className="p-4 min-h-[120px] flex border-b border-[#2B2927] bg-[#191815]">
        {/* <div className="w-16 flex-shrink-0 pt-2">
          <span className="text-5xl">🧔🏽‍♂️</span>
        </div> */}
        {currentMove ? (
          <CoachBubble move={currentMove} />
        ) : (
          <div className="bg-white text-[#111] rounded-xl p-4 shadow-lg flex-1 relative border-2 border-gray-300 flex items-center">
            <span className="font-medium">Let's review your game!</span>
          </div>
        )}
      </div>


    </div>
  );

  const renderStatRow = (label: string, icon: string, key: MoveClass, color: string) => {
    if (!analysisResult) return null;
    const w = analysisResult.summary.white[key] || 0;
    const b = analysisResult.summary.black[key] || 0;
    if (w === 0 && b === 0 && key !== 'best' && key !== 'good' && key !== 'inaccuracy' && key !== 'mistake' && key !== 'blunder') return null;

    return (
      <div className="flex items-center py-2 px-1 hover:bg-[#2A2825] transition-colors text-[13px]">
        <div className="w-24 text-left text-gray-300 font-semibold">{label}</div>
        <div className="w-12 text-center text-[#E7CB75] font-bold">{w > 0 ? w : ''}</div>
        <div className="flex-1 flex justify-center">
          <div className="w-5 h-5 rounded flex items-center justify-center text-white text-[10px] font-bold" style={{ backgroundColor: color }}>
            {icon}
          </div>
        </div>
        <div className="w-12 text-center text-[#E7CB75] font-bold">{b > 0 ? b : ''}</div>
      </div>
    );
  };

  const infoTabContent = (
    <div className="space-y-6 text-sm text-gray-300">

      {/* Accuracy Section matching reference */}
      <div className="mb-4 bg-[#191815] rounded-lg border border-[#2B2927] p-4">
        <table className="w-full table-fixed text-center border-b border-[#2B2927] pb-4 block">
          <thead className="block w-full">
            <tr className="flex w-full mb-3">
              <th className="w-[30%]"></th>
              <th className="w-[35%] text-[13px] font-bold text-white truncate px-1 text-center">{orientation === 'white' ? bottomPlayer.name : topPlayer.name}</th>
              <th className="w-[35%] text-[13px] font-bold text-white truncate px-1 text-center">{orientation === 'white' ? topPlayer.name : bottomPlayer.name}</th>
            </tr>
          </thead>
          <tbody className="block w-full">
            <tr className="flex w-full items-center mb-4">
              <td className="w-[30%] text-left text-[14px] font-bold text-gray-200 pl-2">Players</td>
              <td className="w-[35%] flex justify-center">
                <div className="w-[52px] h-[52px] bg-[#E1E1E1] rounded-md overflow-hidden flex items-center justify-center shadow">
                  <span className="text-[40px] text-[#8C8C8C] leading-none mt-1">♙</span>
                </div>
              </td>
              <td className="w-[35%] flex justify-center">
                <div className="w-[52px] h-[52px] bg-[#E1E1E1] rounded-md overflow-hidden flex items-center justify-center shadow border-[3px] border-[#82A84E]">
                  <span className="text-[40px] text-[#8C8C8C] leading-none mt-1">♙</span>
                </div>
              </td>
            </tr>
            <tr className="flex w-full items-center mb-2">
              <td className="w-[30%] text-left text-[14px] font-bold text-gray-200 pl-2">Accuracy</td>
              <td className="w-[35%] flex justify-center">
                <div className="bg-white text-black font-extrabold text-[16px] rounded px-3 py-1 shadow min-w-[3.5rem]">
                  {analysisResult.summary.white.accuracy}
                </div>
              </td>
              <td className="w-[35%] flex justify-center">
                <div className="bg-[#2D2A26] text-white font-extrabold text-[16px] rounded px-3 py-1 shadow min-w-[3.5rem]">
                  {analysisResult.summary.black.accuracy}
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Categories Breakdown */}
      <div className="bg-[#191815] rounded-lg border border-[#2B2927] overflow-hidden p-2">
        {renderStatRow('Brilliant', MOVE_ICONS.brilliant, 'brilliant', MOVE_COLORS.brilliant)}
        {renderStatRow('Great', MOVE_ICONS.great, 'great', MOVE_COLORS.great)}
        {renderStatRow('Book', MOVE_ICONS.book, 'book', MOVE_COLORS.book)}
        {renderStatRow('Best', MOVE_ICONS.best, 'best', MOVE_COLORS.best)}
        {renderStatRow('Excellent', MOVE_ICONS.excellent, 'excellent', MOVE_COLORS.excellent)}
        {renderStatRow('Good', MOVE_ICONS.good, 'good', MOVE_COLORS.good)}
        {renderStatRow('Inaccuracy', MOVE_ICONS.inaccuracy, 'inaccuracy', MOVE_COLORS.inaccuracy)}
        {renderStatRow('Mistake', MOVE_ICONS.mistake, 'mistake', MOVE_COLORS.mistake)}
        {renderStatRow('Miss', MOVE_ICONS.miss, 'miss', MOVE_COLORS.miss)}
        {renderStatRow('Blunder', MOVE_ICONS.blunder, 'blunder', MOVE_COLORS.blunder)}
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
        highlightIdx={moveIndex}
        onMoveClick={(idx) => {
          setIsPlaying(false);
          setMoveIndex(idx);
        }}
        viewMoveIndex={moveIndex}
        totalMoves={analysisResult.moves.length}
        onMoveNav={handleMoveNav}
        infoTabContent={infoTabContent}
        topSidePanelContent={topSidePanelContent}
        // bottomSidePanelContent={
        //   <EvalSparkline
        //     moves={analysisResult.moves}
        //     currentIdx={moveIndex}
        //     onJump={(idx) => {
        //       setIsPlaying(false);
        //       setMoveIndex(idx);
        //     }}
        //   />
        // }
        autoScroll={true}
        mobilePanelHeight="520px"
        bottomControls={bottomControls}
      />
    </div>
  );
}
