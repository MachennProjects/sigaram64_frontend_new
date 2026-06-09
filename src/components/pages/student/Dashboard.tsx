// Screen 04 — Student Dashboard (Upgraded: glassmorphism, responsive desktop grid)
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Crown, Badge } from "../../ui";
import { useAuth } from "../../../context/AuthContext";

const QUICK_ACTIONS = [
  { icon: "♟", label: "Play Computer", path: "/play", badge: null },
  { icon: "🧩", label: "Daily Puzzle", path: "/puzzle", badge: "3 new" },
  { icon: "🧠", label: "Assessment", path: "/assessment", badge: null },
  { icon: "📚", label: "Learn", path: "/lessons", badge: null },
  { icon: "🏆", label: "Famous Games", path: "/famous-games", badge: null },
  { icon: "📋", label: "PGN Viewer", path: "/pgn-load", badge: null },
  { icon: "👤", label: "My Profile", path: "/profile", badge: null },
];

const RECENT_GAMES = [
  { opp: "Arjun K.", result: "Win", rating: "+12", time: "2h ago", color: "♙" },
  { opp: "Priya M.", result: "Draw", rating: "+3", time: "Yesterday", color: "♙" },
  { opp: "Kavi S.", result: "Loss", rating: "-8", time: "2d ago", color: "♙" },
];

const MISSIONS = [
  { label: "Solve 3 puzzles", done: 2, total: 3, xp: 30, icon: "🧩" },
  { label: "Analyze a game", done: 0, total: 1, xp: 20, icon: "📊" },
  { label: "5-day streak", done: 4, total: 5, xp: 50, icon: "🔥" },
  { label: "Play 1 game", done: 1, total: 1, xp: 25, icon: "♟" },
];

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
  const [selectedTab, setSelectedTab] = useState<'missions' | 'recent'>('missions');
  const { user } = useAuth();
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
          } catch (e) {}
        });
    }
  }, [user]);

  const currentElo = quizResult?.estimatedElo ?? (user?.elo ?? 800);

  const actions = [
    { icon: "♟", label: "Play Computer", path: "/play", badge: null },
    { icon: "🧩", label: "Daily Puzzle", path: "/puzzle", badge: "3 new" },
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
                <div className="text-right lg:hidden">
                  <div className="text-gold text-3xl font-black">{currentElo}</div>
                  <div className="text-gray-400 text-xs">Elo Rating</div>
                  <div className="mt-1">
                    {quizResult ? (
                      <Badge variant="green">Level Verified</Badge>
                    ) : (
                      <Badge variant="green">↑ +28</Badge>
                    )}
                  </div>
                </div>
              </div>

              {/* Stats row */}
              <div className="grid grid-cols-3 gap-2 md:gap-3">
                <div className="bg-dark-bg/60 backdrop-blur rounded-2xl p-3 md:p-4 flex flex-col items-center text-center md:flex-row md:text-left md:items-center gap-1 md:gap-3 border border-divider/50 hover:border-gold/30 transition-colors">
                  <span className="text-xl md:text-2xl">🔥</span>
                  <div>
                    <div className="text-white font-bold text-lg md:text-xl leading-none">7</div>
                    <div className="text-gray-400 text-[10px] md:text-[11px] uppercase tracking-wider mt-0.5">Day streak</div>
                  </div>
                </div>
                <div className="bg-dark-bg/60 backdrop-blur rounded-2xl p-3 md:p-4 flex flex-col items-center text-center md:flex-row md:text-left md:items-center gap-1 md:gap-3 border border-divider/50 hover:border-gold/30 transition-colors">
                  <span className="text-xl md:text-2xl">⭐</span>
                  <div>
                    <div className="text-white font-bold text-lg md:text-xl leading-none">340</div>
                    <div className="text-gray-400 text-[10px] md:text-[11px] uppercase tracking-wider mt-0.5">XP total</div>
                  </div>
                </div>
                <div className="bg-dark-bg/60 backdrop-blur rounded-2xl p-3 md:p-4 flex flex-col items-center text-center md:flex-row md:text-left md:items-center gap-1 md:gap-3 border border-divider/50 hover:border-gold/30 transition-colors">
                  <span className="text-xl md:text-2xl">🏅</span>
                  <div>
                    <div className="text-white font-bold text-lg md:text-xl leading-none">5</div>
                    <div className="text-gray-400 text-[10px] md:text-[11px] uppercase tracking-wider mt-0.5">Badges</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Rating sparkline inside hero (Desktop pushes it to the right) */}
            <div className="mt-6 lg:mt-0 lg:w-1/3 min-w-[280px]">
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

        {/* ── 2-Column Desktop Layout for Missions & Recent Games ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">

          {/* Mobile Tabs */}
          <div className="flex bg-navy-mid rounded-xl p-1 lg:hidden">
            {(['missions', 'recent'] as const).map(t => (
              <button
                key={t}
                onClick={() => setSelectedTab(t)}
                className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-colors capitalize ${selectedTab === t ? 'bg-gold text-navy shadow-md' : 'text-gray-400'
                  }`}
              >
                {t === 'missions' ? '🎯 Daily Missions' : '🕹 Recent Games'}
              </button>
            ))}
          </div>

          {/* Missions Column */}
          <div className={`${selectedTab === 'missions' ? 'block' : 'hidden'} lg:block`}>
            <div className="hidden lg:flex items-center justify-between mb-4">
              <h3 className="text-white font-bold text-lg flex items-center gap-2">
                🎯 Daily Missions
              </h3>
              <p className="text-gray-500 text-sm">Resets in 14h 22m</p>
            </div>

            <div className="space-y-3 animate-fadeIn">
              <p className="text-gray-500 text-xs text-right lg:hidden">Resets in 14h 22m</p>
              {MISSIONS.map((m, i) => {
                const pct = (m.done / m.total) * 100;
                const done = m.done >= m.total;
                return (
                  <div key={i} className={`card p-4 lg:p-5 relative overflow-hidden hover:border-gold/30 transition-colors ${done ? 'border-green-700/30 bg-green-900/10' : ''
                    }`}>
                    {done && <div className="absolute top-0 left-0 bottom-0 w-[4px] bg-green-400 rounded-l-2xl" />}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl bg-dark-bg p-2 rounded-xl border border-divider shadow-inner">{m.icon}</span>
                        <span className={`text-base font-medium ${done ? 'text-green-400 line-through opacity-60' : 'text-gray-100'
                          }`}>{m.label}</span>
                      </div>
                      <span className={`text-sm font-bold bg-navy px-3 py-1 rounded-full border border-divider ${done ? 'text-green-400 border-green-900' : 'text-gold'
                        }`}>
                        {done ? '✓ Done' : `+${m.xp} XP`}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-2">
                      <div className="flex-1 h-2 bg-navy-mid rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-700 shadow-md ${done ? 'bg-green-400' : 'bg-gradient-to-r from-gold-light to-gold'
                            }`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="text-gray-400 text-xs font-bold w-8 text-right">{m.done}/{m.total}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent Games Column */}
          <div className={`${selectedTab === 'recent' ? 'block' : 'hidden'} lg:block`}>
            <div className="hidden lg:flex items-center justify-between mb-4">
              <h3 className="text-white font-bold text-lg flex items-center gap-2">
                🕹 Recent Games
              </h3>
              <button
                onClick={() => navigate('/profile')}
                className="text-gold text-sm font-semibold hover:underline"
              >View All →</button>
            </div>

            <div className="card divide-y divide-divider animate-fadeIn overflow-hidden">
              {RECENT_GAMES.map((g, i) => (
                <div key={i} className="flex items-center justify-between px-5 py-4 hover:bg-navy-mid/30 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-navy-mid to-dark-bg border border-divider flex items-center justify-center text-xl shadow-inner">
                      {g.color}
                    </div>
                    <div>
                      <div className="text-white text-base font-semibold">vs {g.opp}</div>
                      <div className="text-gray-500 text-xs mt-0.5">{g.time}</div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1 md:flex-row md:items-center md:gap-4">
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-bold ${g.result === 'Win' ? 'text-green-400' : g.result === 'Loss' ? 'text-red-400' : 'text-yellow-400'
                        }`}>{g.result}</span>
                      <span className={`text-xs font-mono px-2 py-0.5 rounded-md bg-dark-bg border border-divider ${g.rating.startsWith('+') ? 'text-green-400' : 'text-red-400'
                        }`}>{g.rating}</span>
                    </div>
                    <button
                      onClick={() => navigate('/analysis')}
                      className="text-gold text-xs font-semibold hover:underline bg-gold/10 px-3 py-1.5 rounded-lg border border-gold/20"
                    >Analyze</button>
                  </div>
                </div>
              ))}
              <div className="px-4 py-4 text-center bg-navy-mid/10 lg:hidden">
                <button
                  onClick={() => navigate('/profile')}
                  className="text-gold text-sm font-semibold hover:underline"
                >View All Games →</button>
              </div>
            </div>
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
