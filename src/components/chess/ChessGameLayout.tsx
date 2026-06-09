import React, { useRef, useEffect } from 'react';

/* ── Helpers ───────────────────────────────────────────────────────── */

export function formatTime(s: number) {
  const sec = Math.max(0, Math.floor(s));
  return `${Math.floor(sec / 60)}:${(sec % 60).toString().padStart(2, '0')}`;
}

const PIECE_ICON: Record<string, string> = {
  K: '♔', Q: '♕', R: '♖', B: '♗', N: '♘', P: '',
  k: '♚', q: '♛', r: '♜', b: '♝', n: '♞', p: '',
};

export function getPieceIcon(san: string, color: 'w' | 'b'): string {
  const firstChar = san[0];
  if (firstChar === 'O') return color === 'w' ? '♔' : '♚'; // castling
  if (firstChar >= 'A' && firstChar <= 'Z' && firstChar !== 'O') {
    return color === 'w' ? PIECE_ICON[firstChar] || '' : PIECE_ICON[firstChar.toLowerCase()] || '';
  }
  return color === 'w' ? '♙' : '♟'; // pawn move
}

/* ── Player Panel ──────────────────────────────────────────────────── */

export interface PlayerInfo {
  name: string;
  avatarLetter: string;
  avatarBg: string;
  time?: number;
  isActive: boolean;
  capturedPieces: Record<string, number>;
  capturedPieceColor: 'w' | 'b';
  scoreAdvantage: number;
  isThinking?: boolean;
}

export function PlayerPanel({ player }: { player: PlayerInfo }) {
  const { name, avatarLetter, avatarBg, time, isActive, capturedPieces, capturedPieceColor, scoreAdvantage, isThinking } = player;
  const isCritical = time !== undefined && time < 10;

  const pieceSymbols: Record<string, string> = {
    p: '♟', n: '♞', b: '♝', r: '♜', q: '♛'
  };

  const renderCaptures = () => {
    const elements: React.ReactNode[] = [];
    const order = ['p', 'n', 'b', 'r', 'q'];
    let totalCount = 0;

    order.forEach(type => {
      const count = Math.max(0, capturedPieces[type] || 0);
      for (let i = 0; i < count; i++) {
        elements.push(
          <span
            key={`${type}-${i}`}
            className="text-[17px] leading-none select-none relative"
            style={{
              marginLeft: totalCount === 0 ? '0' : '-3px',
              zIndex: totalCount,
            }}
          >
            {pieceSymbols[type]}
          </span>
        );
        totalCount++;
      }
    });

    return (
      <div
        className="flex items-center select-none min-h-[16px] mt-0.5"
        style={{
          color: capturedPieceColor === 'w' ? '#FFFFFF' : '#222222',
          WebkitTextStroke: capturedPieceColor === 'b' ? '1px rgba(255,255,255,0.6)' : 'none',
          textShadow: capturedPieceColor === 'w' ? '0 1px 1px rgba(0,0,0,0.8)' : 'none'
        }}
      >
        {elements}
        {scoreAdvantage > 0 && (
          <span className="text-[12px] font-bold text-[#8B8987] ml-2 select-none tracking-tight">
            +{scoreAdvantage}
          </span>
        )}
      </div>
    );
  };

  return (
    <div className="flex items-center justify-between py-1.5 w-full select-none">
      <div className="flex items-center gap-3 min-w-0">
        <div
          className="w-10 h-10 rounded flex items-center justify-center font-bold text-[#101c3e] shadow-md flex-shrink-0 select-none text-xl"
          style={{ backgroundColor: avatarBg }}
        >
          {avatarLetter}
        </div>
        <div className="flex flex-col min-w-0 justify-center">
          <div className="flex items-center gap-1.5 leading-none">
            <span className="text-sm font-bold text-gray-100 truncate">{name}</span>
            {isThinking && (
              <span className="inline-block w-3 h-3 border-2 border-[#C9A84C] border-t-transparent rounded-full animate-spin flex-shrink-0" />
            )}
          </div>
          {renderCaptures()}
        </div>
      </div>

      {time !== undefined && (
        <div
          className={`px-3 py-1.5 rounded font-mono text-xl font-bold tabular-nums flex items-center shadow transition-all duration-200 select-none ${isActive
            ? isCritical
              ? 'bg-red-900/60 text-red-200 border border-red-500/50 shadow-lg'
              : 'bg-[#191815] text-[#FFFFFF] border border-[#2B2927] shadow-lg'
            : 'bg-[#191815] text-[#8B8987] border border-[#2B2927]/40 opacity-70'
            }`}
        >
          {formatTime(time)}
        </div>
      )}
    </div>
  );
}

/* ── Main Layout Component ─────────────────────────────────────────── */

export interface MoveRowData {
  num: number;
  white: { san: string; color: 'w'; icon?: React.ReactNode } | null;
  black: { san: string; color: 'b'; icon?: React.ReactNode } | null;
  whiteIdx: number;
  blackIdx: number | null;
}

interface ChessGameLayoutProps {
  boardComponent: React.ReactNode;
  evalBarComponent: React.ReactNode;

  topPlayer: PlayerInfo;
  bottomPlayer: PlayerInfo;

  sideTab: 'moves' | 'info';
  onSideTabChange: (tab: 'moves' | 'info') => void;

  moveRows: MoveRowData[];
  highlightIdx: number;
  onMoveClick: (idx: number) => void;

  viewMoveIndex: number;
  totalMoves: number;
  onMoveNav: (dir: 'first' | 'prev' | 'next' | 'last') => void;

  infoTabContent: React.ReactNode;
  bottomControls: React.ReactNode;

  topSidePanelContent?: React.ReactNode;
  bottomSidePanelContent?: React.ReactNode;
  dialogs?: React.ReactNode;
  autoScroll?: boolean;
  mobilePanelHeight?: string;
}

export default function ChessGameLayout({
  boardComponent,
  evalBarComponent,
  topPlayer,
  bottomPlayer,
  sideTab,
  onSideTabChange,
  moveRows,
  highlightIdx,
  onMoveClick,
  viewMoveIndex,
  totalMoves,
  onMoveNav,
  infoTabContent,
  bottomControls,
  topSidePanelContent,
  bottomSidePanelContent,
  dialogs,
  autoScroll = true,
  mobilePanelHeight = '380px',
}: ChessGameLayoutProps) {
  const moveListRef = useRef<HTMLDivElement>(null);
  const activeRowRef = useRef<HTMLDivElement>(null);
  const isUserClickRef = useRef(false);

  useEffect(() => {
    const wasUserClick = isUserClickRef.current;
    isUserClickRef.current = false;

    if (wasUserClick && !autoScroll) return;

    if (moveListRef.current) {
      if (viewMoveIndex === -1) {
        moveListRef.current.scrollTop = 0;
      } else if (viewMoveIndex === totalMoves - 1) {
        moveListRef.current.scrollTop = moveListRef.current.scrollHeight;
      } else if (activeRowRef.current) {
        const container = moveListRef.current;
        const row = activeRowRef.current;
        const topPos = row.offsetTop - container.offsetTop;
        container.scrollTop = topPos - container.clientHeight / 2 + row.clientHeight / 2;
      }
    }
  }, [totalMoves, viewMoveIndex, autoScroll]);

  return (
    <div className="flex-1 flex flex-col lg:flex-row items-center lg:items-center justify-center gap-2 lg:gap-6 px-4 lg:px-6 py-3 lg:py-2 min-h-0 overflow-y-auto lg:overflow-hidden w-full max-w-7xl mx-auto">
      <style>{`
        .chess-board-area {
          max-width: calc(100vw - 32px);
        }
        .chess-side-panel {
          height: ${mobilePanelHeight}; /* Fixed height on mobile so bottom controls are static and moves scroll */
        }
        @media (min-width: 1024px) {
          .chess-board-area {
            max-width: min(calc(100vw - 720px), calc(100vh - 210px)) !important;
          }
          .chess-side-panel {
            height: calc(min(calc(100vw - 720px), calc(100vh - 210px)) + 80px) !important;
          }
        }
      `}</style>

      {/* ── Left Area: Board + Players ──────────────────────────────── */}
      <div className="chess-board-area flex flex-col items-center justify-center flex-shrink-0 w-full">

        {/* Board Container */}
        <div className="flex-1 flex flex-col min-w-0 pb-1 lg:pb-0 w-full">
          <PlayerPanel player={topPlayer} />

          <div className="relative w-full flex items-stretch">
            {/* Eval Bar Container */}
            {evalBarComponent && (
              <div className="w-3 lg:w-5 flex-shrink-0 mr-2 lg:mr-4">
                {evalBarComponent}
              </div>
            )}

            <div className="relative flex-1 aspect-square shadow-2xl rounded-sm w-full">
              {boardComponent}
            </div>
          </div>

          <PlayerPanel player={bottomPlayer} />
        </div>
      </div>

      {/* ── Right Area: Side Panel ──────────────────────────────────── */}
      <div className="chess-side-panel flex flex-col w-full lg:w-[400px] mt-1.5 lg:mt-0 flex-shrink-0 rounded-xl shadow-2xl overflow-hidden border border-[#1E2E52]" style={{ backgroundColor: '#12234A' }}>

        {/* Tab Bar */}
        <div className="flex border-b border-[#1E2E52]">
          <button
            onClick={() => onSideTabChange('moves')}
            className={`flex-1 py-3 text-sm font-semibold transition-all relative ${sideTab === 'moves' ? 'text-[#C9A84C]' : 'text-gray-500 hover:text-gray-300'}`}
          >
            Moves
            {sideTab === 'moves' && <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#C9A84C]" />}
          </button>
          <button
            onClick={() => onSideTabChange('info')}
            className={`flex-1 py-3 text-sm font-semibold transition-all relative ${sideTab === 'info' ? 'text-[#C9A84C]' : 'text-gray-500 hover:text-gray-300'}`}
          >
            Info
            {sideTab === 'info' && <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#C9A84C]" />}
          </button>
        </div>

        {/* Mobile Navigation Buttons (Visible only on mobile screens, directly below tab bar) */}
        <div className="flex items-center border-b border-[#1E2E52] lg:hidden flex-shrink-0">
          {[
            { icon: '⏮', dir: 'first' as const, label: 'First move', disabled: viewMoveIndex === -1 || totalMoves === 0 },
            { icon: '◀', dir: 'prev' as const, label: 'Previous move', disabled: viewMoveIndex === -1 || totalMoves === 0 },
            { icon: '▶', dir: 'next' as const, label: 'Next move', disabled: viewMoveIndex === totalMoves - 1 || totalMoves === 0 },
            { icon: '⏭', dir: 'last' as const, label: 'Last move', disabled: viewMoveIndex === totalMoves - 1 || totalMoves === 0 },
          ].map(({ icon, dir, label, disabled }) => (
            <button
              key={dir}
              onClick={() => onMoveNav(dir)}
              title={label}
              disabled={disabled}
              className="flex-1 py-3 text-lg text-gray-400 hover:text-white hover:bg-[#0D1B3E] transition-all disabled:opacity-20 disabled:cursor-not-allowed active:scale-90"
            >
              {icon}
            </button>
          ))}
        </div>

        {/* Moves Tab */}
        {sideTab === 'moves' && (
          <div className="flex flex-col flex-1 min-h-0">
            {topSidePanelContent}
            <div ref={moveListRef} className="flex-1 overflow-y-auto min-h-0 order-3 lg:order-1">
              {moveRows.length === 0 ? (
                <div className="flex items-center justify-center py-12 text-gray-600 text-sm italic">
                  Game moves will appear here…
                </div>
              ) : (
                <div className="divide-y divide-[#1a2d52]">
                  {moveRows.map((row) => (
                    <div
                      key={row.num}
                      ref={(highlightIdx === row.whiteIdx || highlightIdx === row.blackIdx) ? activeRowRef : undefined}
                      className="flex items-stretch text-[13px] hover:bg-[#0D1B3E]/60 transition-colors"
                    >
                      <div className="w-10 flex-shrink-0 flex items-center justify-center text-gray-600 font-medium py-2 border-r border-[#1a2d52]">
                        {row.num}.
                      </div>

                      <div
                        className={`flex-1 flex items-center gap-1.5 px-3 py-2 cursor-pointer transition-colors ${highlightIdx === row.whiteIdx ? 'bg-[#C9A84C]/15 text-[#E7CB75]' : 'text-gray-200'}`}
                        onClick={() => {
                          isUserClickRef.current = true;
                          onMoveClick(row.whiteIdx);
                        }}
                      >
                        {row.white && (
                          <>
                            {row.white.icon && <span className="flex-shrink-0">{row.white.icon}</span>}
                            <span className="text-base leading-none opacity-60">{getPieceIcon(row.white.san, 'w')}</span>
                            <span className="font-medium">{row.white.san}</span>
                          </>
                        )}
                      </div>

                      <div
                        className={`flex-1 flex items-center gap-1.5 px-3 py-2 cursor-pointer border-l border-[#1a2d52] transition-colors ${(row.blackIdx !== null && highlightIdx === row.blackIdx) ? 'bg-[#C9A84C]/15 text-[#E7CB75]' : 'text-gray-200'}`}
                        onClick={() => {
                          if (row.blackIdx !== null) {
                            isUserClickRef.current = true;
                            onMoveClick(row.blackIdx);
                          }
                        }}
                      >
                        {row.black && (
                          <>
                            {row.black.icon && <span className="flex-shrink-0">{row.black.icon}</span>}
                            <span className="text-base leading-none opacity-60">{getPieceIcon(row.black.san, 'b')}</span>
                            <span className="font-medium">{row.black.san}</span>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Desktop Navigation Buttons (Visible only on desktop screens) */}
            <div className="hidden lg:flex items-center border-t border-[#1E2E52] order-2">
              {[
                { icon: '⏮', dir: 'first' as const, label: 'First move', disabled: viewMoveIndex === -1 || totalMoves === 0 },
                { icon: '◀', dir: 'prev' as const, label: 'Previous move', disabled: viewMoveIndex === -1 || totalMoves === 0 },
                { icon: '▶', dir: 'next' as const, label: 'Next move', disabled: viewMoveIndex === totalMoves - 1 || totalMoves === 0 },
                { icon: '⏭', dir: 'last' as const, label: 'Last move', disabled: viewMoveIndex === totalMoves - 1 || totalMoves === 0 },
              ].map(({ icon, dir, label, disabled }) => (
                <button
                  key={dir}
                  onClick={() => onMoveNav(dir)}
                  title={label}
                  disabled={disabled}
                  className="flex-1 py-3 text-lg text-gray-400 hover:text-white hover:bg-[#0D1B3E] transition-all disabled:opacity-20 disabled:cursor-not-allowed active:scale-90"
                >
                  {icon}
                </button>
              ))}
            </div>

            {bottomControls}
            {bottomSidePanelContent}
          </div>
        )}

        {/* Info Tab */}
        {sideTab === 'info' && (
          <div className="flex-1 flex flex-col min-h-0 bg-[#1D1C1A]">
            <div className="p-5 flex-1 overflow-y-auto">
              {infoTabContent}
            </div>
            {bottomControls}
          </div>
        )}
      </div>

      {dialogs}
    </div>
  );
}
