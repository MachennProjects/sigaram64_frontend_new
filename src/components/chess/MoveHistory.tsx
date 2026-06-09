import React, { useRef, useEffect, useMemo } from 'react';

/* ── Props ─────────────────────────────────────────────────────────── */
interface MoveHistoryProps {
  moves: string[];
  currentMoveIndex?: number;
}

/* ── Pair moves into rows: [moveNum, whiteMove, blackMove?] ────────── */
interface MoveRow {
  number: number;
  white: string;
  black: string | null;
  whiteIdx: number;
  blackIdx: number | null;
}

function pairMoves(moves: string[]): MoveRow[] {
  const rows: MoveRow[] = [];
  for (let i = 0; i < moves.length; i += 2) {
    rows.push({
      number: Math.floor(i / 2) + 1,
      white: moves[i],
      black: i + 1 < moves.length ? moves[i + 1] : null,
      whiteIdx: i,
      blackIdx: i + 1 < moves.length ? i + 1 : null,
    });
  }
  return rows;
}

/* ── Component ─────────────────────────────────────────────────────── */
const MoveHistory: React.FC<MoveHistoryProps> = ({ moves, currentMoveIndex }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef<HTMLSpanElement>(null);

  const rows = useMemo(() => pairMoves(moves), [moves]);

  /* Auto-scroll to latest or current move */
  useEffect(() => {
    if (activeRef.current) {
      activeRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    } else if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [moves, currentMoveIndex]);

  /* Determine the highlighted index */
  const highlightIdx = currentMoveIndex !== undefined ? currentMoveIndex : moves.length - 1;

  return (
    <div
      className="bg-[#12234A] rounded-2xl border border-[#1E2E52] overflow-hidden"
      style={{ maxWidth: 'min(calc(100vw - 40px), 400px)', width: '100%' }}
    >
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-[#1E2E52]">
        <svg className="w-4 h-4 text-[#C9A84C]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
        </svg>
        <span className="text-xs font-semibold text-gray-300 uppercase tracking-wider">Moves</span>
        {moves.length > 0 && (
          <span className="ml-auto text-[10px] font-medium text-gray-500">
            {moves.length} move{moves.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* Move list */}
      <div
        ref={scrollRef}
        className="overflow-y-auto px-2 py-1.5"
        style={{ maxHeight: '180px' }}
      >
        {moves.length === 0 ? (
          <div className="flex items-center justify-center py-8 px-4">
            <p className="text-gray-500 text-sm italic text-center">
              Game moves will appear here…
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-0.5">
            {rows.map((row) => (
              <div
                key={row.number}
                className="flex items-center gap-0 rounded-lg text-sm hover:bg-[#0D1B3E]/50 transition-colors"
              >
                {/* Move number */}
                <span className="w-8 text-right pr-1.5 text-[#C9A84C] font-semibold text-xs tabular-nums flex-shrink-0">
                  {row.number}.
                </span>

                {/* White move */}
                <span
                  ref={highlightIdx === row.whiteIdx ? activeRef : undefined}
                  className={`
                    py-1 px-2 rounded-md font-medium cursor-default transition-all duration-200 min-w-[60px] text-center
                    ${highlightIdx === row.whiteIdx
                      ? 'bg-[#C9A84C]/20 text-[#E7CB75] shadow-sm shadow-[#C9A84C]/10'
                      : 'text-gray-200 hover:bg-[#1E2E52]/60'
                    }
                  `}
                >
                  {row.white}
                </span>

                {/* Black move */}
                {row.black !== null ? (
                  <span
                    ref={highlightIdx === row.blackIdx ? activeRef : undefined}
                    className={`
                      py-1 px-2 rounded-md font-medium cursor-default transition-all duration-200 min-w-[60px] text-center
                      ${highlightIdx === row.blackIdx
                        ? 'bg-[#C9A84C]/20 text-[#E7CB75] shadow-sm shadow-[#C9A84C]/10'
                        : 'text-gray-200 hover:bg-[#1E2E52]/60'
                      }
                    `}
                  >
                    {row.black}
                  </span>
                ) : (
                  <span className="py-1 px-2 min-w-[60px]" />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MoveHistory;
