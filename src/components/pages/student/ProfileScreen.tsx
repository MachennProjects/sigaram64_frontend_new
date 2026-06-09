// Screen 16 — Full Profile Screen with stats, game history, badges
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import { Badge } from "../../ui";
import { GameAnalysisResult, getGameOutcome } from "../../../engine/gameAnalyzer";
import { fetchUserGames } from "../../../firebase/firestoreService";
import { convertLegacyGameToAnalysis } from "../admin/StudentAnalytics";
const BADGES = [
  { icon: '🔥', label: '7-Day Streak', earned: true, desc: 'Played 7 days in a row' },
  { icon: '♟', label: 'First Win', earned: true, desc: 'Won your first game' },
  { icon: '🧩', label: 'Puzzle Master', earned: true, desc: 'Solved 50 puzzles' },
  { icon: '📊', label: 'Analyst', earned: true, desc: 'Analyzed 10 games' },
  { icon: '🏆', label: 'Tournament Ready', earned: false, desc: 'Win 20 games to unlock' },
  { icon: '👑', label: 'Grand Master Path', earned: false, desc: 'Reach Elo 1800 to unlock' },
  { icon: '🌟', label: '100 Games', earned: false, desc: 'Play 100 games to unlock' },
  { icon: '⚡', label: 'Bullet King', earned: false, desc: 'Win 10 bullet games to unlock' },
];

const STATS = [
  { label: 'Total Games', value: '47', icon: '♟' },
  { label: 'Win Rate', value: '61%', icon: '🏆' },
  { label: 'Puzzles', value: '128', icon: '🧩' },
  { label: 'Best Rating', value: '1,260', icon: '📈' },
];



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

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<'history' | 'badges' | 'stats'>('history');
  const [savedGames, setSavedGames] = useState<GameAnalysisResult[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  useEffect(() => {
    if (user?.uid) {
      setLoadingHistory(true);
      fetchUserGames(user.uid)
        .then(gamesData => {
          const formattedGames = gamesData.map(g => convertLegacyGameToAnalysis(g));
          setSavedGames(formattedGames);
        })
        .catch(e => console.error('Failed to load games from Firebase', e))
        .finally(() => setLoadingHistory(false));
    }
  }, [user]);

  const wins = savedGames.filter(g => getGameOutcome(g.result, g.playerColor) === 'win').length;
  const losses = savedGames.filter(g => getGameOutcome(g.result, g.playerColor) === 'loss').length;
  const draws = savedGames.filter(g => getGameOutcome(g.result, g.playerColor) === 'draw').length;

  return (
    <div className="min-h-screen bg-dark-bg flex flex-col pb-6">

      {/* Profile Hero */}
      <div className="relative mx-4 mt-5 rounded-3xl overflow-hidden bg-card-bg border border-divider">
        <div className="absolute inset-0 opacity-[0.04] pointer-events-none">
          <div className="grid grid-cols-8 md:grid-cols-16 h-full">
            {Array.from({ length: 128 }).map((_, i) => (
              <div key={i} className={(Math.floor(i / 16) + i % 16) % 2 === 0 ? 'bg-white' : ''} />
            ))}
          </div>
        </div>
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-gold to-transparent" />

        <div className="relative px-6 py-6 md:p-8 lg:flex lg:items-end lg:justify-between lg:gap-8">
          <div className="flex-1">
            <div className="flex items-start justify-between mb-4 lg:mb-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gold flex items-center justify-center shadow-lg">
                  <span className="text-navy text-3xl font-black">
                    {user?.avatar ?? user?.name?.[0] ?? 'S'}
                  </span>
                </div>
                <div>
                  <h2 className="text-white text-xl md:text-3xl font-bold">{user?.name ?? 'Student'}</h2>
                  <p className="text-gray-400 text-sm mt-0.5">{user?.id ?? 'TN001'} {user?.school && `• ${user.school}`}</p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="chip-gold text-[10px] capitalize">{user?.role ?? 'student'}</span>
                  </div>
                </div>
              </div>
              {/* Mobile ELO display */}
              <div className="text-right lg:hidden">
                <div className="text-gold text-3xl font-black">{user?.elo ?? '1,240'}</div>
                <div className="text-gray-400 text-xs">Elo Rating</div>
                <div className="mt-1">
                  <Badge variant="green">↑ +28</Badge>
                </div>
              </div>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-dark-bg/60 backdrop-blur rounded-2xl p-4 flex items-center gap-3 border border-divider/50 hover:border-gold/30 transition-colors">
                <span className="text-green-400 text-2xl font-bold">W</span>
                <div>
                  <div className="text-white font-bold text-xl leading-none">{user?.games_won || wins || 0}</div>
                  <div className="text-gray-400 text-[11px] uppercase tracking-wider mt-0.5">Wins</div>
                </div>
              </div>
              <div className="bg-dark-bg/60 backdrop-blur rounded-2xl p-4 flex items-center gap-3 border border-divider/50 hover:border-gold/30 transition-colors">
                <span className="text-yellow-400 text-2xl font-bold">D</span>
                <div>
                  <div className="text-white font-bold text-xl leading-none">{user?.games_drawn || draws || 0}</div>
                  <div className="text-gray-400 text-[11px] uppercase tracking-wider mt-0.5">Draws</div>
                </div>
              </div>
              <div className="bg-dark-bg/60 backdrop-blur rounded-2xl p-4 flex items-center gap-3 border border-divider/50 hover:border-gold/30 transition-colors">
                <span className="text-red-400 text-2xl font-bold">L</span>
                <div>
                  <div className="text-white font-bold text-xl leading-none">{user?.games_played ? (user.games_played - (user.games_won || 0) - (user.games_drawn || 0)) : losses || 0}</div>
                  <div className="text-gray-400 text-[11px] uppercase tracking-wider mt-0.5">Losses</div>
                </div>
              </div>
            </div>
          </div>

          {/* Rating sparkline inside hero (Desktop pushes it to the right) */}
          <div className="mt-6 lg:mt-0 lg:w-1/3 min-w-[280px]">
            <div className="hidden lg:flex justify-between items-end mb-2">
              <div>
                <div className="text-gold text-4xl font-black">1,240</div>
                <div className="text-gray-400 text-sm">Elo Rating</div>
              </div>
              <Badge variant="green">↑ +28 this week</Badge>
            </div>
            <div className="flex items-center justify-between mb-1 lg:hidden">
              <span className="text-gray-500 text-xs">Rating — last 30 days</span>
              <span className="text-gold text-xs font-semibold">1,240 ↑</span>
            </div>
            <div className="bg-dark-bg/40 backdrop-blur p-4 rounded-2xl border border-white/5">
              <RatingSparkline />
              <div className="flex justify-between text-gray-500 text-xs mt-2">
                <span>1,180</span>
                <span className="text-gold font-semibold">+60 pts</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mx-4 mt-4">
        <div className="flex bg-navy-mid rounded-xl p-1">
          {(['history', 'badges', 'stats'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-colors capitalize ${tab === t ? 'bg-gold text-navy shadow-md' : 'text-gray-400'
                }`}
            >
              {t === 'history' ? '🕹 History' : t === 'badges' ? '🏅 Badges' : '📊 Stats'}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 mt-4">
        {/* Game History */}
        {tab === 'history' && (
          <div className="card divide-y divide-divider animate-fadeIn">
            {loadingHistory ? (
              <div className="divide-y divide-divider">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="px-4 py-4 animate-pulse">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 w-2/3">
                        <div className="w-2 h-8 bg-navy-mid/60 rounded-full flex-shrink-0" />
                        <div className="space-y-2 flex-1">
                          <div className="h-4 bg-navy-mid/60 rounded w-3/4" />
                          <div className="h-3 bg-navy-mid/40 rounded w-1/2" />
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="h-4 bg-navy-mid/60 rounded w-8" />
                        <div className="w-16 h-7 bg-navy-mid/60 rounded-full" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : savedGames.length === 0 ? (
              <div className="px-4 py-8 text-center text-gray-500 text-sm">
                No games played yet. <button onClick={() => navigate('/play/ai')} className="text-gold hover:underline">Play a game</button> to see your history!
              </div>
            ) : (
              savedGames.map((g, i) => {
                const outcome = getGameOutcome(g.result, g.playerColor);
                const isWin = outcome === 'win';
                const isDraw = outcome === 'draw';
                const isLoss = outcome === 'loss';
                const resultColor = isWin ? 'text-green-400' : isLoss ? 'text-red-400' : 'text-yellow-400';
                const bgIndicator = isWin ? 'bg-green-400' : isLoss ? 'bg-red-400' : 'bg-yellow-400';
                const dateStr = new Date(g.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
                
                return (
                  <div key={i} className="px-4 py-3">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-8 rounded-full flex-shrink-0 ${bgIndicator}`} />
                        <div>
                          <p className="text-white text-sm font-semibold">vs Stockfish ({g.difficulty})</p>
                          <p className="text-gray-500 text-xs">{g.totalMoves} moves · {dateStr}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-bold ${resultColor}`}>
                          {isWin ? 'Win' : isLoss ? 'Loss' : 'Draw'}
                        </span>
                        <button
                          onClick={() => navigate('/analysis', { state: { analysisResult: g } })}
                          className="text-gold text-xs font-semibold hover:underline bg-gold/10 px-2 py-1 rounded-full border border-gold/30"
                        >
                          Review →
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Badges */}
        {tab === 'badges' && (
          <div className="grid grid-cols-2 gap-3 animate-fadeIn">
            {BADGES.map((b, i) => (
              <div
                key={i}
                className={`card p-4 relative overflow-hidden ${b.earned
                    ? 'border-gold/30 bg-gold/5'
                    : 'opacity-50'
                  }`}
              >
                {b.earned && <div className="absolute top-0 left-0 right-0 h-[2px] bg-gold" />}
                <span className="text-3xl block mb-2">{b.icon}</span>
                <p className={`text-sm font-bold mb-0.5 ${b.earned ? 'text-gold' : 'text-gray-500'
                  }`}>{b.label}</p>
                <p className="text-gray-500 text-xs leading-tight">{b.desc}</p>
                {b.earned && (
                  <div className="absolute top-3 right-3">
                    <span className="text-green-400 text-xs font-bold">✓</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Stats */}
        {tab === 'stats' && (
          <div className="space-y-3 animate-fadeIn">
            <div className="grid grid-cols-2 gap-3">
              {STATS.map((s, i) => (
                <div key={i} className="card p-4 relative overflow-hidden">
                  <div className="absolute top-0 left-0 bottom-0 w-[3px] bg-gold rounded-l-2xl" />
                  <span className="text-2xl block mb-2">{s.icon}</span>
                  <div className="text-gold text-2xl font-black">{s.value}</div>
                  <div className="text-gray-400 text-xs mt-0.5">{s.label}</div>
                </div>
              ))}
            </div>

            {/* Openings breakdown */}
            <div className="card p-4">
              <p className="text-gray-400 text-xs font-semibold mb-3 uppercase tracking-wider">Top Openings</p>
              {[
                { name: 'Italian Game', count: 12, pct: 70 },
                { name: 'Ruy Lopez', count: 8, pct: 50 },
                { name: 'Sicilian', count: 6, pct: 33 },
                { name: 'Queen\'s Gambit', count: 5, pct: 60 },
              ].map((o, i) => (
                <div key={i} className="mb-3 last:mb-0">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-300 font-medium">{o.name}</span>
                    <span className="text-gray-500">{o.count} games · {o.pct}% win</span>
                  </div>
                  <div className="h-1.5 bg-navy-mid rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gold rounded-full transition-all duration-700"
                      style={{ width: `${o.pct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Accuracy ring chart placeholder */}
            <div className="card p-5 text-center">
              <p className="text-gray-400 text-xs font-semibold mb-4 uppercase tracking-wider">Accuracy This Month</p>
              <div className="relative w-28 h-28 mx-auto mb-3">
                <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                  <circle cx="50" cy="50" r="40" fill="none" stroke="#1E2E52" strokeWidth="10" />
                  <circle
                    cx="50" cy="50" r="40" fill="none"
                    stroke="#C9A84C" strokeWidth="10"
                    strokeDasharray="251.2"
                    strokeDashoffset={251.2 * (1 - 0.78)}
                    strokeLinecap="round"
                    className="transition-all duration-1000"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-gold text-2xl font-black">78%</span>
                  <span className="text-gray-500 text-[10px]">Accuracy</span>
                </div>
              </div>
              <div className="flex justify-center gap-6 text-xs">
                <div><span className="text-cyan-400 font-bold">✨ 3</span> <span className="text-gray-500">Brilliant</span></div>
                <div><span className="text-gold font-bold">★ 12</span> <span className="text-gray-500">Best</span></div>
                <div><span className="text-red-400 font-bold">?? 2</span> <span className="text-gray-500">Blunders</span></div>
              </div>
            </div>
          </div>
        )}

        {/* Logout button */}
        <button
          onClick={() => { logout(); navigate('/'); }}
          className="w-full btn-danger py-3 mt-5 text-sm font-semibold"
        >
          🚪 Logout
        </button>
      </div>
    </div>
  );
}
