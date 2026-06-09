import React, { useMemo } from 'react';

/* ── Props ─────────────────────────────────────────────────────────── */
interface EvalBarProps {
  evaluation: number;
  mateIn?: number | null;
  orientation?: 'white' | 'black';
}

/* ── Sigmoid mapping: centipawns → white fill % ────────────────────── */
function evalToPercentage(cp: number): number {
  // 50 + 50 * (2 / (1 + e^(-cp/400)) - 1)
  return 50 + 50 * (2 / (1 + Math.exp(-cp / 400)) - 1);
}

/* ── Format display label ──────────────────────────────────────────── */
function formatEval(cp: number, mateIn: number | null | undefined): string {
  if (mateIn != null) {
    const sign = mateIn > 0 ? '' : '-';
    return `M${sign}${Math.abs(mateIn)}`;
  }
  const pawns = cp / 100;
  const sign = pawns > 0 ? '+' : '';
  return `${sign}${pawns.toFixed(1)}`;
}

/* ── Component ─────────────────────────────────────────────────────── */
const EvalBar: React.FC<EvalBarProps> = ({
  evaluation,
  mateIn = null,
  orientation = 'white',
}) => {
  /* Compute white fill percentage */
  const whitePct = useMemo(() => {
    if (mateIn != null) {
      return mateIn > 0 ? 100 : 0; // White mates → 100%, Black mates → 0%
    }
    return evalToPercentage(evaluation);
  }, [evaluation, mateIn]);

  /* Label to show */
  const label = useMemo(() => formatEval(evaluation, mateIn), [evaluation, mateIn]);

  /* Determine advantage side for label positioning */
  const isWhiteAdvantage = whitePct >= 50;

  /* Flip logic: in "white" orientation, white is at bottom.
     In "black" orientation, black is at bottom (white at top). */
  const isFlipped = orientation === 'black';

  /* Visual: the "white section" percentage from the bottom.
     If flipped, white is at the TOP, so we measure from top instead. */
  const whiteHeight = `${whitePct}%`;
  const blackHeight = `${100 - whitePct}%`;

  return (
    <div
      className="relative flex flex-col rounded-lg overflow-hidden border border-[#1E2E52] shadow-lg"
      style={{ width: '26px', height: '100%', minHeight: '200px' }}
    >
      {/* Top section */}
      <div
        className="w-full transition-all duration-500 ease-out relative"
        style={{
          height: isFlipped ? whiteHeight : blackHeight,
          backgroundColor: isFlipped ? '#e8e0d4' : '#1a1a2e',
        }}
      >
        {/* Label on the advantaged side - top */}
        {((isFlipped && isWhiteAdvantage) || (!isFlipped && !isWhiteAdvantage)) && (
          <div className="absolute inset-x-0 top-1 flex items-center justify-center">
            <span
              className="text-[9px] font-bold tabular-nums leading-none"
              style={{
                color: isFlipped
                  ? (isWhiteAdvantage ? '#333' : '#e8e0d4')
                  : (!isWhiteAdvantage ? '#e8e0d4' : '#333'),
              }}
            >
              {label}
            </span>
          </div>
        )}
      </div>

      {/* Bottom section */}
      <div
        className="w-full transition-all duration-500 ease-out relative"
        style={{
          height: isFlipped ? blackHeight : whiteHeight,
          backgroundColor: isFlipped ? '#1a1a2e' : '#e8e0d4',
        }}
      >
        {/* Label on the advantaged side - bottom */}
        {((isFlipped && !isWhiteAdvantage) || (!isFlipped && isWhiteAdvantage)) && (
          <div className="absolute inset-x-0 bottom-1 flex items-center justify-center">
            <span
              className="text-[9px] font-bold tabular-nums leading-none"
              style={{
                color: isFlipped
                  ? (!isWhiteAdvantage ? '#e8e0d4' : '#333')
                  : (isWhiteAdvantage ? '#333' : '#e8e0d4'),
              }}
            >
              {label}
            </span>
          </div>
        )}
      </div>

      {/* Center line marker (the 50/50 reference) */}
      <div
        className="absolute left-0 right-0 h-px pointer-events-none z-10"
        style={{
          top: '50%',
          backgroundColor: 'rgba(201,168,76,0.4)',
        }}
      />
    </div>
  );
};

export default EvalBar;
