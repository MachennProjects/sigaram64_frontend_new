import React, { useMemo } from 'react';

/* ── Props ─────────────────────────────────────────────────────────── */
interface GameTimerProps {
  timeWhite: number;
  timeBlack: number;
  activeColor: 'w' | 'b' | null;
  orientation?: 'white' | 'black';
  whiteLabel?: string;
  blackLabel?: string;
}

/* ── Format seconds → MM:SS ────────────────────────────────────────── */
function formatTime(seconds: number): string {
  const s = Math.max(0, Math.floor(seconds));
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
}

/* ── Icons (inline SVG) ────────────────────────────────────────────── */
const UserIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const BotIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="10" rx="2" />
    <circle cx="12" cy="5" r="2" />
    <path d="M12 7v4" />
    <line x1="8" y1="16" x2="8" y2="16" />
    <line x1="16" y1="16" x2="16" y2="16" />
    <circle cx="8" cy="16" r="1" fill="currentColor" />
    <circle cx="16" cy="16" r="1" fill="currentColor" />
  </svg>
);

/* ── Single Timer Bar ──────────────────────────────────────────────── */
interface TimerBarProps {
  time: number;
  isActive: boolean;
  label: string;
  icon: 'user' | 'bot';
  colorSide: 'white' | 'black';
}

const TimerBar: React.FC<TimerBarProps> = ({ time, isActive, label, icon, colorSide }) => {
  const isLow = time < 30;
  const isCritical = time < 10;

  /* Dynamic classes */
  const bgClass = useMemo(() => {
    if (isCritical && isActive) return 'bg-red-900/60 border-red-500/60';
    if (isLow && isActive) return 'bg-red-900/30 border-red-500/40';
    if (isActive) return 'bg-[#1a2a50] border-[#C9A84C]/50';
    return 'bg-[#0D1B3E] border-[#1E2E52]';
  }, [isActive, isLow, isCritical]);

  const timeColor = useMemo(() => {
    if (isCritical) return 'text-red-400';
    if (isLow) return 'text-red-300';
    if (isActive) return 'text-white';
    return 'text-gray-400';
  }, [isActive, isLow, isCritical]);

  const pulseClass = isCritical && isActive
    ? 'animate-pulse'
    : isLow && isActive
      ? 'animate-[pulse_2s_ease-in-out_infinite]'
      : '';

  /* Piece dot indicator */
  const dotColor = colorSide === 'white' ? 'bg-white' : 'bg-gray-800 border border-gray-500';

  return (
    <div
      className={`
        flex items-center justify-between rounded-xl px-3 py-2.5
        border transition-all duration-300 ${bgClass} ${pulseClass}
      `}
      style={{ minWidth: 0 }}
    >
      {/* Left: icon + label */}
      <div className="flex items-center gap-2 min-w-0">
        {/* Color dot */}
        <div className={`w-3 h-3 rounded-full flex-shrink-0 ${dotColor}`} />

        {/* Icon */}
        {icon === 'user' ? (
          <UserIcon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-[#C9A84C]' : 'text-gray-500'}`} />
        ) : (
          <BotIcon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-[#C9A84C]' : 'text-gray-500'}`} />
        )}

        {/* Name */}
        <span
          className={`text-xs font-medium truncate ${isActive ? 'text-gray-200' : 'text-gray-500'}`}
        >
          {label}
        </span>
      </div>

      {/* Right: time */}
      <div className="flex items-center gap-1.5">
        {/* Active indicator dot */}
        {isActive && (
          <span className="relative flex h-2 w-2 flex-shrink-0">
            <span
              className="absolute inline-flex h-full w-full rounded-full opacity-75"
              style={{
                backgroundColor: isCritical ? '#ef4444' : isLow ? '#f87171' : '#C9A84C',
                animation: 'pulseRing 1.5s ease-out infinite',
              }}
            />
            <span
              className="relative inline-flex rounded-full h-2 w-2"
              style={{
                backgroundColor: isCritical ? '#ef4444' : isLow ? '#f87171' : '#C9A84C',
              }}
            />
          </span>
        )}

        <span
          className={`font-mono text-lg font-bold tabular-nums tracking-wide ${timeColor}`}
          style={{ minWidth: '4.5ch', textAlign: 'right' }}
        >
          {formatTime(time)}
        </span>
      </div>
    </div>
  );
};

/* ── Main Component ────────────────────────────────────────────────── */
const GameTimer: React.FC<GameTimerProps> = ({
  timeWhite,
  timeBlack,
  activeColor,
  orientation = 'white',
  whiteLabel = 'You',
  blackLabel = 'Stockfish AI',
}) => {
  /* The "top" timer is the opponent from the viewer's perspective */
  const topIsBlack = orientation === 'white';

  const topTime = topIsBlack ? timeBlack : timeWhite;
  const bottomTime = topIsBlack ? timeWhite : timeBlack;
  const topActive = topIsBlack ? activeColor === 'b' : activeColor === 'w';
  const bottomActive = topIsBlack ? activeColor === 'w' : activeColor === 'b';
  const topLabel = topIsBlack ? blackLabel : whiteLabel;
  const bottomLabel = topIsBlack ? whiteLabel : blackLabel;
  const topIcon: 'user' | 'bot' = topIsBlack ? 'bot' : 'user';
  const bottomIcon: 'user' | 'bot' = topIsBlack ? 'user' : 'bot';
  const topColorSide: 'white' | 'black' = topIsBlack ? 'black' : 'white';
  const bottomColorSide: 'white' | 'black' = topIsBlack ? 'white' : 'black';

  return (
    <div className="flex flex-col gap-2 w-full" style={{ maxWidth: 'min(calc(100vw - 40px), 400px)' }}>
      {/* Top timer (opponent) */}
      <TimerBar
        time={topTime}
        isActive={topActive}
        label={topLabel}
        icon={topIcon}
        colorSide={topColorSide}
      />

      {/* Bottom timer (player) */}
      <TimerBar
        time={bottomTime}
        isActive={bottomActive}
        label={bottomLabel}
        icon={bottomIcon}
        colorSide={bottomColorSide}
      />
    </div>
  );
};

export default GameTimer;
