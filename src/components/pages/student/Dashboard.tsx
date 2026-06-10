// Screen 04 — Student Dashboard (Upgraded: glassmorphism, responsive desktop grid)
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Crown, Badge } from "../../ui";
import { useAuth } from "../../../context/AuthContext";
import { fetchUserGames } from "../../../firebase/firestoreService";
import { convertLegacyGameToAnalysis } from "../admin/StudentAnalytics";
import { getGameOutcome } from "../../../engine/gameAnalyzer";

const QUICK_ACTIONS = [
  { icon: "♟", label: "Play Computer", path: "/play", badge: null },
  { icon: "🧩", label: "Daily Puzzle", path: "/puzzle", badge: "3 new" },
  { icon: "🧠", label: "Assessment", path: "/assessment", badge: null },
  { icon: "📚", label: "Learn", path: "/lessons", badge: null },
  { icon: "🏆", label: "Famous Games", path: "/famous-games", badge: null },
  { icon: "📋", label: "PGN Viewer", path: "/pgn-load", badge: null },
  { icon: "👤", label: "My Profile", path: "/profile", badge: null },
];

function formatGameResult(resultStr: string, playerColor?: string) {
  const outcome = getGameOutcome(resultStr || '', playerColor || 'white');
  if (outcome === 'win') return { label: 'Win', colorClass: 'text-green-400', ratingClass: 'text-green-400' };
  if (outcome === 'loss') return { label: 'Loss', colorClass: 'text-red-400', ratingClass: 'text-red-400' };
  return { label: 'Draw', colorClass: 'text-yellow-400', ratingClass: 'text-yellow-400' };
}

function formatGameTime(dateInput: any): string {
  if (!dateInput) return '—';
  let d: Date;
  if (typeof dateInput === 'string') {
    d = new Date(dateInput);
  } else if (typeof dateInput === 'number') {
    d = new Date(dateInput);
  } else if (dateInput && typeof dateInput.toMillis === 'function') {
    d = new Date(dateInput.toMillis());
  } else if (dateInput && dateInput.seconds) {
    d = new Date(dateInput.seconds * 1000);
  } else {
    d = new Date(dateInput);
  }
  
  const diffMs = Date.now() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return 'Yesterday';
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}



const FAMOUS_GAMES = [
  { white: "Fischer", black: "Spassky", year: "1972", event: "World Championship", icon: "👑" },
  { white: "Kasparov", black: "Deep Blue", year: "1997", event: "IBM Match G2", icon: "🤖" },
  { white: "Morphy", black: "D.Paulsen", year: "1857", event: "Opera Game", icon: "🎭" },
  { white: "Tal", black: "Botvinnik", year: "1960", event: "World Championship", icon: "⚡" },
];

// SVG sparkline for rating chart
function RatingSparkline() {
  const points = "0,68 40,62 80,55 110,48 150,38 180,32 220,22 260,15 300,8";
  return (
    <svg viewBox="0 0 300 80" className="w-full h-14 md:h-20 lg:h-24 transition-all">
      <defs>
        <linearGradient id="goldGrad2" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#C9A84C" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#C9A84C" stopOpacity="0" />
        </linearGradient>
      </defs>
      <polyline points={points} fill="none" stroke="#C9A84C" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
      <polygon points={`${points} 300,80 0,80`} fill="url(#goldGrad2)" />
      {/* Data dots */}
      {[[0, 68], [80, 55], [150, 38], [220, 22], [300, 8]].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="3" fill="#C9A84C" />
      ))}
    </svg>
  );
}

export default function StudentDashboard() {
  const navigate = useNavigate();
  const { user, games: realGames, loadingGames } = useAuth();
  const [quizResult, setQuizResult] = useState<any>(null);

  useEffect(() => {
    if (user?.id) {
      const uid = user.id;
      fetch('/api/quiz-results')
        .then(res => res.json())
        .then(data => {
          if (data[uid]) {
            setQuizResult(data[uid]);
          }
        })
        .catch(err => {
          console.error("Error fetching quiz results:", err);
          try {
            const cached = sessionStorage.getItem(`sigaram64_quiz_${uid}`);
            if (cached) {
              setQuizResult(JSON.parse(cached));
            }
          } catch (e) { }
        });
    }
  }, [user]);

  const currentElo = quizResult?.estimatedElo ?? (user?.elo ?? 800);
  const userStreak = user?.streak ?? 0;
  const missions = [
    { label: "Solve 3 puzzles", done: 2, total: 3, xp: 30, icon: "🧩" },
    { label: "Analyze a game", done: 0, total: 1, xp: 20, icon: "📊" },
    { label: "5-day streak", done: Math.min(userStreak, 5), total: 5, xp: 50, icon: "🔥" },
    { label: "Play 1 game", done: 1, total: 1, xp: 25, icon: "♟" },
  ];

  const actions = [
    { icon: "♟", label: "Play Computer", path: "/play", badge: null },
    { icon: "🧩", label: "Daily Puzzle", path: "#", badge: "🔒 Locked" },
    { icon: "🧠", label: "Assessment", path: "/assessment", badge: quizResult?.quizCompleted ? "✅ Done" : "New" },
    { icon: "📚", label: "Learn", path: "/lessons", badge: null },
    { icon: "🏆", label: "Famous Games", path: "/famous-games", badge: null },
    { icon: "📋", label: "PGN Viewer", path: "/pgn-load", badge: null },
    { icon: "👤", label: "My Profile", path: "/profile", badge: null },
  ];

  return (
    <div className="min-h-screen bg-dark-bg flex flex-col items-center">

      {/* Container to restrict max width on desktop and center it nicely */}
      <div className="w-full max-w-7xl px-4 md:px-8 space-y-6 lg:space-y-8 pb-8 pt-5">

        {/* ── Hero Card ── */}
        <div className="relative rounded-3xl overflow-hidden bg-card-bg border border-divider">
          {/* Animated chess pattern background */}
          <div className="absolute inset-0 opacity-[0.04] pointer-events-none">
            <div className="grid grid-cols-8 md:grid-cols-16 h-full">
              {Array.from({ length: 128 }).map((_, i) => (
                <div key={i} className={(Math.floor(i / 16) + i % 16) % 2 === 0 ? 'bg-white' : ''} />
              ))}
            </div>
          </div>
          {/* Gold top accent */}
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-gold to-transparent" />

          <div className="relative px-6 py-6 md:p-8 lg:flex lg:items-end lg:justify-between lg:gap-8">
            <div className="flex-1">
              <div className="flex items-start justify-between mb-4 lg:mb-6">
                <div>
                  <p className="text-gray-400 text-sm mb-1">Good morning, {user?.name || "Student"}! 👋</p>
                  <h2 className="text-white text-2xl md:text-3xl font-bold">Your Chess Journey</h2>
                  {quizResult ? (
                    <p className="text-gold-light text-sm mt-1">Category: {quizResult.playerCategory} (Score: {quizResult.quizScore}/100)</p>
                  ) : (
                    <p className="text-gold-light text-sm mt-1">உங்கள் சதுரங்க பயணம்</p>
                  )}
                </div>
                {/* Mobile ELO display */}
                {/* <div className="text-right lg:hidden">
                  <div className="text-gold text-3xl font-black">{currentElo}</div>
                  <div className="text-gray-400 text-xs">Elo Rating</div>
                  <div className="mt-1">
                    {quizResult ? (
                      <Badge variant="green">Level Verified</Badge>
                    ) : (
                      <Badge variant="green">↑ +28</Badge>
                    )}
                  </div>
                </div> */}
              </div>

              {/* Stats row */}
              <div className="grid grid-cols-3 gap-2 md:gap-3">
                <div className="bg-dark-bg/60 backdrop-blur rounded-2xl p-3 md:p-4 flex flex-col items-center text-center md:flex-row md:text-left md:items-center gap-1 md:gap-3 border border-divider/50 hover:border-gold/30 transition-colors">
                  <span className="text-xl md:text-2xl">🔥</span>
                  <div>
                    <div className="text-white font-bold text-lg md:text-xl leading-none">{user?.streak || 0}</div>
                    <div className="text-gray-400 text-[10px] md:text-[11px] uppercase tracking-wider mt-0.5">Day streak</div>
                  </div>
                </div>
                <div className="bg-dark-bg/60 backdrop-blur rounded-2xl p-3 md:p-4 flex flex-col items-center text-center md:flex-row md:text-left md:items-center gap-1 md:gap-3 border border-divider/50 hover:border-gold/30 transition-colors opacity-50">
                  <span className="text-xl md:text-2xl">⭐</span>
                  <div>
                    <div className="text-white font-bold text-lg md:text-xl leading-none flex items-center gap-1">🔒 <span>340</span></div>
                    <div className="text-gray-400 text-[10px] md:text-[11px] uppercase tracking-wider mt-0.5">XP total</div>
                  </div>
                </div>
                <div className="bg-dark-bg/60 backdrop-blur rounded-2xl p-3 md:p-4 flex flex-col items-center text-center md:flex-row md:text-left md:items-center gap-1 md:gap-3 border border-divider/50 hover:border-gold/30 transition-colors opacity-50">
                  <span className="text-xl md:text-2xl">🏅</span>
                  <div>
                    <div className="text-white font-bold text-lg md:text-xl leading-none flex items-center gap-1">🔒 <span>5</span></div>
                    <div className="text-gray-400 text-[10px] md:text-[11px] uppercase tracking-wider mt-0.5">Badges</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Rating section */}
            {/* <div className="mt-6 lg:mt-0 lg:w-1/3 min-w-[280px]">
              <div className="hidden lg:flex justify-between items-end mb-2">
                <div>
                  <div className="text-gold text-4xl font-black">{currentElo}</div>
                  <div className="text-gray-400 text-sm">Elo Rating</div>
                </div>
                {quizResult ? (
                  <Badge variant="green">Level Verified</Badge>
                ) : (
                  <Badge variant="green">↑ +28 this week</Badge>
                )}
              </div>
              <div className="flex items-center justify-between mb-1 lg:hidden">
                <span className="text-gray-500 text-xs">Rating — last 30 days</span>
                <span className="text-gold text-xs font-semibold">{currentElo} ↑</span>
              </div>
            </div> */}
          </div>
        </div>

        {/* ── Quick Actions Grid ── */}
        <div>
          <h3 className="text-white font-bold mb-4 flex items-center gap-2 text-lg">
            Quick Actions
            <span className="text-gray-600 text-xs font-normal">• jump right in</span>
          </h3>
          <div className="grid grid-cols-4 md:grid-cols-8 gap-3 md:gap-4">
            {actions.map((a, i) => (
              <button
                key={i}
                onClick={() => navigate(a.path)}
                className="relative flex flex-col items-center justify-center gap-2 bg-card-bg rounded-2xl border border-divider p-4 hover:border-gold/50 hover:-translate-y-1 transition-all active:scale-95 shadow-lg"
              >
                {a.badge && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full shadow-md z-10">
                    {a.badge}
                  </span>
                )}
                <span className="text-3xl drop-shadow-md">{a.icon}</span>
                <span className="text-gray-200 text-[10px] md:text-xs text-center leading-tight font-semibold mt-1">{a.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* ── Full-Width Layout for Recent Games ── */}
        <div className="w-full">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-bold text-lg flex items-center gap-2">
              🕹 Recent Games
            </h3>
            <button
              onClick={() => navigate('/profile')}
              className="text-gold text-sm font-semibold hover:underline"
            >View All →</button>
          </div>

          <div className="card divide-y divide-divider animate-fadeIn overflow-hidden">
            {loadingGames ? (
              <div className="divide-y divide-divider">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="px-5 py-4 animate-pulse flex items-center justify-between">
                    <div className="flex items-center gap-4 w-2/3">
                      <div className="w-12 h-12 bg-navy-mid/60 rounded-xl flex-shrink-0" />
                      <div className="space-y-2 flex-1">
                        <div className="h-4 bg-navy-mid/60 rounded w-3/4" />
                        <div className="h-3 bg-navy-mid/40 rounded w-1/2" />
                      </div>
                    </div>
                    <div className="w-24 h-8 bg-navy-mid/60 rounded-lg" />
                  </div>
                ))}
              </div>
            ) : realGames.length === 0 ? (
              <div className="px-5 py-8 text-center text-gray-500 text-sm">
                No games played yet. <button onClick={() => navigate('/play')} className="text-gold hover:underline font-semibold">Play computer</button> to see your history!
              </div>
            ) : (
              realGames.slice(0, 5).map((game) => {
                const gameAnalysis = convertLegacyGameToAnalysis(game);
                const outcome = formatGameResult(game.result, gameAnalysis.playerColor);
                const dateStr = formatGameTime(game.datePlayed);
                const isWhite = gameAnalysis.playerColor === 'white';
                const oppName = game.opponent || `Stockfish (Level ${game.aiLevel ?? 1})`;
                const accuracy = game.summaryStats?.accuracy;

                return (
                  <div
                    key={game.id}
                    onClick={() => navigate(`/analysis/${game.id}`, { state: { analysisResult: gameAnalysis } })}
                    className="flex items-center justify-between px-5 py-4 hover:bg-navy-mid/30 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-navy-mid to-dark-bg border border-divider flex items-center justify-center text-xl shadow-inner select-none">
                        {isWhite ? "♙" : "♟"}
                      </div>
                      <div>
                        <div className="text-white text-base font-semibold">vs {oppName}</div>
                        <div className="text-gray-500 text-xs mt-0.5">{dateStr}</div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1 md:flex-row md:items-center md:gap-4">
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-bold ${outcome.colorClass}`}>{outcome.label}</span>
                        {accuracy != null && (
                          <span className="text-xs font-mono px-2 py-0.5 rounded-md bg-dark-bg border border-divider text-gold">
                            {accuracy}% Acc
                          </span>
                        )}
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/analysis/${game.id}`, { state: { analysisResult: gameAnalysis } });
                        }}
                        className="text-gold text-xs font-semibold hover:underline bg-gold/10 px-3 py-1.5 rounded-lg border border-gold/20"
                      >Analyze</button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* ── Famous Games & Coming Soon (Side by Side on Desktop) ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">

          {/* Famous Games */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-bold text-lg flex items-center gap-2">
                🏆 Famous Games
              </h3>
              <button
                onClick={() => navigate('/famous-games')}
                className="text-gold text-sm font-semibold hover:underline"
              >See All →</button>
            </div>
            {/* Keeping the horizontal scroll for Famous games as it feels like a nice swipeable shelf, even on desktop */}
            <div className="flex gap-4 overflow-x-auto pb-4 snap-x">
              {FAMOUS_GAMES.map((g, i) => (
                <button
                  key={i}
                  onClick={() => navigate('/famous-games')}
                  className="flex-shrink-0 w-48 md:w-56 card-hover p-4 md:p-5 relative overflow-hidden text-left snap-start group"
                >
                  <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-gold/20 via-gold/60 to-gold/20 rounded-t-2xl group-hover:via-gold transition-all" />
                  <span className="text-3xl md:text-4xl block mb-3 drop-shadow-md group-hover:scale-110 transition-transform origin-left">{g.icon}</span>
                  <p className="text-white text-sm md:text-base font-bold leading-tight mb-1">{g.white} <span className="text-gray-500 font-normal text-xs">vs</span> {g.black}</p>
                  <p className="text-gold text-xs font-medium">{g.event}</p>
                  <p className="text-gray-500 text-[11px] mt-1">{g.year}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Coming Soon Shelf */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <h3 className="text-white font-bold text-lg">Coming Soon</h3>
              <Badge variant="coming">Phase 2</Badge>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: '🗺️', label: 'Campaign Map' },
                { icon: '🏫', label: 'Live Classes' },
                { icon: '🏆', label: 'Tournaments' },
                { icon: '📱', label: 'Mobile App' },
              ].map((c, i) => (
                <button
                  key={i}
                  onClick={() => navigate('/features')}
                  className="flex flex-col items-center justify-center gap-2 bg-card-bg rounded-2xl border border-divider p-4 opacity-70 hover:opacity-100 hover:border-gold/40 transition-all hover:-translate-y-1"
                >
                  <span className="text-3xl drop-shadow-sm">{c.icon}</span>
                  <span className="text-gray-300 text-xs text-center font-medium">{c.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
