// Screen 14 — Famous Games / Legends (historical chess games with board playthrough)
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Badge } from "../../ui";
import GameViewer from "./famous-games/GameViewer";

// Database files
import gamesData from "../../../data/games.json";
import games1Data from "../../../data/games1.json";

export interface FamousGame {
  id: string | number;
  white: string;
  black: string;
  year: string;
  event: string;
  result: string;
  icon?: string;
  theme?: string;
  tag?: string;
  moves: string[];
  commentary?: string[];
  details?: string;
}

const FEATURED_GAMES: FamousGame[] = [
  {
    id: "f-1",
    white: "Paul Morphy",
    black: "Duke of Brunswick",
    year: "1858",
    event: "Opera Game",
    result: "1-0",
    icon: "🎭",
    theme: "from-purple-900/40 to-navy",
    tag: "Tactical Brilliance",
    moves: ["e4","e5","Nf3","d6","d4","Bg4","dxe5","Bxf3","Qxf3","dxe5","Bc4","Nf6","Qb3","Qe7","Nc3","c6","Bg5","b5","Nxb5","cxb5","Bxb5+","Nbd7","O-O-O","Rd8","Rxd7","Rxd7","Rd1","Qe6","Bxd7+","Nxd7","Qb8+","Nxb8","Rd8#"],
    commentary: [
      "e4 — Morphy opens with the King's Pawn, his signature move.",
      "e5 — Black mirrors with a symmetrical response.",
      "Nf3 — Development before attack — a golden principle.",
      "d6 — Black defends the e5 pawn somewhat passively.",
      "d4 — Morphy immediately strikes at the centre!",
      "Bg4 — Black pins the knight — but is this safe?",
      "dxe5 — Morphy captures, and the pin is broken immediately.",
      "Bxf3 — Black takes the knight but weakens the kingside.",
      "Qxf3 — Morphy grabs the bishop with the queen, gaining tempo.",
      "dxe5 — Black captures back, material is even for now.",
      "Bc4 — The Italian bishop targets f7, a classic weapon!",
      "Nf6 — Black develops and attacks the e4 pawn.",
      "Qb3 — Morphy attacks f7 and b7 simultaneously.",
      "Qe7 — Black defends f7 and centralises the queen.",
      "Nc3 — Another developing move, Morphy is ahead in development.",
      "c6 — Black shores up the center.",
      "Bg5 — Pinning the knight against the queen — pressure!",
      "b5 — Black tries a queenside counterattack.",
      "Nxb5! — Morphy sacrifices the knight for a devastating attack!",
      "cxb5 — Black must accept.",
      "Bxb5+ — Check! The king is now exposed.",
      "Nbd7 — Forced interposition.",
      "O-O-O — Morphy castles queenside — bringing the rook into the attack!",
      "Rd8 — Black tries to challenge the d-file.",
      "Rxd7! — The famous rook sacrifice begins!",
      "Rxd7 — Black must capture.",
      "Rd1 — The second rook joins the attack with decisive effect.",
      "Qe6 — Black defends, hoping to survive.",
      "Bxd7+ — Winning material while maintaining the attack.",
      "Nxd7 — Black recaptures.",
      "Qb8+! — A stunning queen sacrifice!",
      "Nxb8 — Black is forced to take.",
      "Rd8# — Checkmate! A masterpiece of development and tactics.",
    ],
  },
  {
    id: "f-2",
    white: "Bobby Fischer",
    black: "Boris Spassky",
    year: "1972",
    event: "World Championship G6",
    result: "1-0",
    icon: "👑",
    theme: "from-blue-900/40 to-navy",
    tag: "Queen's Gambit Masterclass",
    moves: ["d4","d5","c4","c6","Nc3","Nf6","Nf3","e6","Bg5","dxc4","e4","b5","e5","h6","Bh4","g5","Nxg5","hxg5","Bxg5","Nbd7","exf6","Bb7"],
    commentary: [
      "d4 — Fischer opens with the Queen's Pawn.",
      "d5 — Spassky responds symmetrically.",
      "c4 — The Queen's Gambit — offering a pawn for central control.",
      "c6 — The Slav Defence — one of the most solid responses.",
      "Nc3 — Developing and pressing the centre.",
      "Nf6 — Black develops and challenges the centre.",
      "Nf3 — More development.",
      "e6 — Black solidifies the pawn structure.",
      "Bg5 — The pin against the knight — tension rises!",
      "dxc4 — Black accepts the gambit pawn.",
      "e4 — Fischer immediately strikes at the centre!",
      "b5 — Spassky tries to hold the c4 pawn.",
      "e5 — Fischer advances boldly, pushing Black back.",
      "h6 — Spassky challenges the pin.",
      "Bh4 — Fischer maintains the pin.",
      "g5 — Spassky pushes — is the bishop safe?",
      "Nxg5! — Fischer sacrifices the knight for a dramatic attack!",
      "hxg5 — Black must capture.",
      "Bxg5 — The bishop recaptures with tempo.",
      "Nbd7 — Black defends.",
      "exf6 — Fischer captures, creating a passed pawn.",
      "Bb7 — Black develops the bishop to a strong diagonal.",
    ],
  },
  {
    id: "f-3",
    white: "Garry Kasparov",
    black: "Deep Blue (IBM)",
    year: "1997",
    event: "IBM Match Game 2",
    result: "0-1",
    icon: "🤖",
    theme: "from-cyan-900/40 to-navy",
    tag: "Human vs Machine",
    moves: ["e4","e5","Nf3","Nc6","Bb5","a6","Ba4","Nf6","O-O","Be7","Re1","b5","Bb3","d6","c3","O-O","h3","Nb8","d4","Nbd7"],
    commentary: [
      "e4 — Kasparov opens with his signature King's Pawn.",
      "e5 — Deep Blue responds symmetrically.",
      "Nf3 — Development — Kasparov plays his usual style.",
      "Nc6 — The computer defends the pawn.",
      "Bb5 — The Ruy Lopez — one of the oldest openings in chess.",
      "a6 — The Morphy Defence — Black challenges the bishop.",
      "Ba4 — Kasparov retreats the bishop, maintaining the pin.",
      "Nf6 — Development with a counterattack on the e4 pawn.",
      "O-O — Kasparov castles for king safety.",
      "Be7 — Deep Blue develops the bishop.",
      "Re1 — The rook supports the e4 pawn — classic Ruy Lopez.",
      "b5 — Black chases the bishop away.",
      "Bb3 — The bishop retreats to a strong diagonal.",
      "d6 — Solid pawn structure for Black.",
      "c3 — Kasparov prepares d4.",
      "O-O — Deep Blue castles — the machine plays solid chess!",
      "h3 — Preventing Bg4.",
      "Nb8 — The computer manoeuvres the knight!",
      "d4 — Kasparov finally strikes at the centre.",
      "Nbd7 — The knight re-routes to a better square.",
    ],
  },
  {
    id: "f-4",
    white: "Mikhail Tal",
    black: "Vasily Smyslov",
    year: "1959",
    event: "Candidates Tournament",
    result: "1-0",
    icon: "⚡",
    theme: "from-orange-900/40 to-navy",
    tag: "Sacrificial Attack",
    moves: ["e4","c6","d4","d5","Nc3","dxe4","Nxe4","Bf5","Ng3","Bg6","h4","h6","Nf3","Nd7","h5","Bh7","Bd3","Bxd3","Qxd3","e6","Bf4","Qa5+"],
    commentary: [
      "e4 — Tal opens aggressively, as always.",
      "c6 — Smyslov plays the Caro-Kann Defence — solid and classical.",
      "d4 — Establishing a strong pawn centre.",
      "d5 — Black counterattacks in the centre.",
      "Nc3 — Tal develops and supports the centre.",
      "dxe4 — Black captures, leading to a more open game.",
      "Nxe4 — Tal recaptures with the knight, centralised.",
      "Bf5 — Smyslov develops the bishop aggressively.",
      "Ng3 — Attacking the bishop.",
      "Bg6 — Black retreats the bishop to a safe square.",
      "h4 — Tal begins a kingside space grab!",
      "h6 — Stopping h5.",
      "Nf3 — Development.",
      "Nd7 — Black develops.",
      "h5! — Tal ignores the pawn move and advances!",
      "Bh7 — The bishop is shut in.",
      "Bd3 — Tal targets the misplaced bishop.",
      "Bxd3 — Black captures.",
      "Qxd3 — Tal's queen takes a powerful central position.",
      "e6 — Black solidifies the pawn structure.",
      "Bf4 — The bishop joins the attack.",
      "Qa5+ — Smyslov checks, but it's too late to escape Tal's attack.",
    ],
  },
];

/* ── Helpers for Parsing & Commentating ───────────────────────────────── */

function parseGameDetails(game: any) {
  let white = "Unknown White";
  let black = "Unknown Black";
  let result = "*";
  let event = "Historical Match";
  let year = "Unknown";

  if (game.details) {
    const parts = game.details.split(';').map((p: string) => p.trim());
    parts.forEach((part: string) => {
      const splitIdx = part.indexOf(':');
      if (splitIdx !== -1) {
        const key = part.substring(0, splitIdx).trim().toLowerCase();
        const val = part.substring(splitIdx + 1).trim();
        if (key === 'white') white = val;
        else if (key === 'black') black = val;
        else if (key === 'score') result = val;
      }
    });
  }

  const yearMatch = game.name.match(/\((\d{4})\)/);
  if (yearMatch) {
    year = yearMatch[1];
  }

  if (white === "Unknown White" || black === "Unknown Black") {
    const cleanName = game.name.replace(/\(\d{4}\)/, '').trim();
    const vsMatch = cleanName.split(/\bvs\b/i);
    if (vsMatch.length === 2) {
      white = vsMatch[0].trim();
      black = vsMatch[1].trim();
    } else {
      white = cleanName;
    }
  }

  return { white, black, result, event, year };
}

function getCategory(index: number, movesCount: number): 'tactical' | 'positional' | 'endgame' {
  if (movesCount < 30) return 'tactical';
  if (movesCount > 55) return 'endgame';
  const rand = (index * 17) % 3;
  if (rand === 0) return 'tactical';
  if (rand === 1) return 'endgame';
  return 'positional';
}

/* ── Memoized Subcomponents for List Performance ─────────────────────── */

const FeaturedGameCard = React.memo(({ game, onSelect }: { game: FamousGame; onSelect: (id: string | number) => void }) => {
  const handleClick = () => onSelect(game.id);
  return (
    <button
      onClick={handleClick}
      className={`flex-shrink-0 w-64 bg-gradient-to-b ${game.theme} rounded-2xl border border-divider p-4 text-left hover:border-gold/50 transition-all active:scale-[0.97] relative snap-start group`}
    >
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-gold/50 to-transparent group-hover:via-gold transition-all" />
      <div className="flex items-start gap-3">
        <span className="text-3xl select-none group-hover:scale-110 transition-transform origin-left">{game.icon}</span>
        <div className="flex-1 overflow-hidden">
          <h3 className="text-white font-bold text-sm truncate">{game.white}</h3>
          <p className="text-gray-400 text-[11px] truncate">vs {game.black}</p>
          <p className="text-[#E7CB75] text-[10px] font-bold mt-1.5">{game.event} · {game.year}</p>
          <div className="flex items-center justify-between mt-2.5">
            <span className="bg-gold/10 border border-gold/20 text-[#E7CB75] text-[9px] px-1.5 py-0.5 rounded font-semibold">{game.tag}</span>
            <span className="text-[10px] text-gray-500 font-medium">{game.moves.length} moves</span>
          </div>
        </div>
      </div>
    </button>
  );
});

const GameListItem = React.memo(({ game, onSelect }: { game: FamousGame; onSelect: (id: string | number) => void }) => {
  const handleClick = () => onSelect(game.id);
  return (
    <button
      onClick={handleClick}
      className="w-full bg-[#12234A]/40 hover:bg-[#12234A]/80 border border-[#1E2E52]/60 hover:border-gold/30 rounded-xl p-4 text-left transition-all active:scale-[0.99] flex items-center justify-between gap-4 group"
    >
      <div className="flex items-center gap-3 overflow-hidden">
        <span className="text-2xl bg-dark-bg p-2.5 rounded-xl border border-divider shadow-inner select-none group-hover:scale-110 transition-transform">{game.icon}</span>
        <div className="overflow-hidden">
          <h4 className="text-white text-xs font-bold leading-snug truncate">{game.white} <span className="text-gray-500 font-normal">vs</span> {game.black}</h4>
          <p className="text-[10px] text-gray-400 truncate mt-0.5">{game.event} · {game.year}</p>
          <div className="flex items-center gap-1.5 mt-1">
            <span className="text-[8px] font-semibold text-gray-500 uppercase tracking-wide">{game.tag}</span>
            <span className="text-gray-600 text-[9px] font-black">•</span>
            <span className="text-gray-500 text-[8px]">{game.moves.length} moves</span>
          </div>
        </div>
      </div>
      <div className="flex flex-col items-end gap-1.5 flex-shrink-0 select-none">
        <Badge variant="gold">{game.result}</Badge>
        <span className="text-[10px] text-gold font-bold group-hover:translate-x-1 transition-transform">Study →</span>
      </div>
    </button>
  );
});


/* ── Main Component (List View & Dynamic Loader) ─────────────────────── */

export default function FamousGames() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const gameIdParam = searchParams.get('id');

  const handleGameSelect = useCallback((id: string | number) => {
    setSearchParams({ id: String(id) });
  }, [setSearchParams]);

  const handleBack = useCallback(() => {
    setSearchParams({});
  }, [setSearchParams]);
  const [filter, setFilter] = useState<'all' | 'tactical' | 'positional' | 'endgame'>('all');
  const [searchQuery, setSearchQuery] = useState("");
  const [pageSize, setPageSize] = useState(15);

  // Parse and cache the entire games list
  const allDbGames = useMemo(() => {
    const list: FamousGame[] = [];

    // Add games1Data (curated classic list)
    games1Data.forEach((g: any, index: number) => {
      const parsed = parseGameDetails(g);
      const movesCount = g.moves.length;
      const cat = getCategory(index, movesCount);
      const tag = cat === 'tactical' ? 'Tactical Brilliance' 
                : cat === 'endgame' ? 'Endgame Mastery' 
                : 'Positional Masterclass';
      const theme = cat === 'tactical' ? 'from-purple-900/40 to-navy'
                  : cat === 'endgame' ? 'from-orange-900/40 to-navy'
                  : 'from-blue-900/40 to-navy';
      const icon = cat === 'tactical' ? '⚡'
                 : cat === 'endgame' ? '🎯'
                 : '👑';

      list.push({
        id: `g1-${index}`,
        white: parsed.white,
        black: parsed.black,
        year: parsed.year,
        event: parsed.event || "Curated Classic",
        result: parsed.result,
        icon,
        theme,
        tag,
        moves: g.moves,
        details: g.details
      });
    });

    // Add gamesData (full database)
    gamesData.forEach((g: any, index: number) => {
      const parsed = parseGameDetails(g);
      const movesCount = g.moves.length;
      const cat = getCategory(index + 500, movesCount);
      const tag = cat === 'tactical' ? 'Tactical Brilliance' 
                : cat === 'endgame' ? 'Endgame Mastery' 
                : 'Positional Masterclass';
      const theme = cat === 'tactical' ? 'from-purple-900/40 to-navy'
                  : cat === 'endgame' ? 'from-orange-900/40 to-navy'
                  : 'from-blue-900/40 to-navy';
      const icon = cat === 'tactical' ? '⚔️'
                 : cat === 'endgame' ? '♟'
                 : '🧩';

      list.push({
        id: `db-${index}`,
        white: parsed.white,
        black: parsed.black,
        year: parsed.year,
        event: parsed.event || "Historical Match",
        result: parsed.result,
        icon,
        theme,
        tag,
        moves: g.moves,
        details: g.details
      });
    });

    return list;
  }, []);

  // Filter list based on search and category tabs
  const filteredDbGames = useMemo(() => {
    return allDbGames.filter(game => {
      // Category filter
      if (filter !== 'all') {
        const movesCount = game.moves.length;
        // Re-calculate category using ID key to match getCategory inputs
        const idOffset = typeof game.id === 'string' && game.id.startsWith('db-') 
                       ? parseInt(game.id.split('-')[1]) + 500 
                       : parseInt(String(game.id).split('-')[1]) || 0;
        const cat = getCategory(idOffset, movesCount);
        if (cat !== filter) return false;
      }

      // Search query filter
      if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase();
        const matchesWhite = game.white.toLowerCase().includes(query);
        const matchesBlack = game.black.toLowerCase().includes(query);
        const matchesEvent = game.event.toLowerCase().includes(query);
        const matchesYear = game.year.toLowerCase().includes(query);
        return matchesWhite || matchesBlack || matchesEvent || matchesYear;
      }

      return true;
    });
  }, [allDbGames, filter, searchQuery]);

  // Load more pages slices
  const displayedDbGames = useMemo(() => {
    return filteredDbGames.slice(0, pageSize);
  }, [filteredDbGames, pageSize]);

  // Reset pagination on filter / search changes
  useEffect(() => {
    setPageSize(15);
  }, [filter, searchQuery]);

  // Find selected game from URL query parameter
  const selectedGame = useMemo(() => {
    if (!gameIdParam) return null;
    const featured = FEATURED_GAMES.find(g => String(g.id) === gameIdParam);
    if (featured) return featured;
    return allDbGames.find(g => String(g.id) === gameIdParam) || null;
  }, [gameIdParam, allDbGames]);

  if (selectedGame) {
    return <GameViewer game={selectedGame} onBack={handleBack} />;
  }

  return (
    <div className="min-h-screen bg-dark-bg flex flex-col pb-8">
      {/* Header */}
      <div className="px-5 pt-5 pb-4">
        <h1 className="text-white text-2xl font-black mb-1">🏆 Famous Games</h1>
        <p className="text-gray-400 text-sm">Study legendary chess masterpieces move by move</p>
      </div>

      {/* Featured Masterpieces Shelf */}
      {searchQuery.trim() === '' && filter === 'all' && (
        <div className="mb-6">
          <h2 className="text-white text-sm font-bold uppercase tracking-wider px-5 mb-3 text-gold">Featured Masterpieces</h2>
          <div className="flex gap-4 overflow-x-auto px-5 pb-3 snap-x scrollbar-thin">
            {FEATURED_GAMES.map(game => (
              <FeaturedGameCard
                key={game.id}
                game={game}
                onSelect={handleGameSelect}
              />
            ))}
          </div>
        </div>
      )}

      {/* Search Bar */}
      <div className="px-5 mb-4">
        <div className="relative">
          <span className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm select-none">🔍</span>
          <input
            type="text"
            placeholder="Search by player, event, or year..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#12234A] border border-[#1E2E52] rounded-xl pl-9 pr-8 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#C9A84C] transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-white text-xs select-none"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Filter tab bar */}
      <div className="flex gap-2 px-5 mb-5 overflow-x-auto pb-1 scrollbar-thin">
        {(['all', 'tactical', 'positional', 'endgame'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`flex-shrink-0 text-[11px] font-bold px-4 py-1.5 rounded-full transition-all active:scale-95 capitalize ${
              filter === f
                ? 'bg-[#C9A84C] text-navy shadow-md font-extrabold'
                : 'text-gold bg-navy-mid border border-gold/20 hover:bg-gold/15 hover:border-gold/40'
            }`}
          >
            {f === 'all' ? 'All Games' : f}
          </button>
        ))}
      </div>

      {/* Games Database List */}
      <div className="px-5 space-y-3 flex-1">
        <div className="flex items-center justify-between mb-1 select-none">
          <h2 className="text-gray-400 text-[10px] font-bold uppercase tracking-wider">Historical Database</h2>
          <span className="text-[10px] text-gray-500">{filteredDbGames.length} games match</span>
        </div>

        {displayedDbGames.length === 0 ? (
          <div className="card p-8 text-center text-gray-500 text-sm italic select-none">
            No historical games found matching your search.
          </div>
        ) : (
          displayedDbGames.map(game => (
            <GameListItem
              key={game.id}
              game={game}
              onSelect={handleGameSelect}
            />
          ))
        )}

        {/* Load More Button */}
        {filteredDbGames.length > pageSize && (
          <div className="pt-2 text-center">
            <button
              onClick={() => setPageSize(prev => prev + 15)}
              className="px-6 py-2.5 bg-[#12234A] hover:bg-[#1A2D52] border border-[#1E2E52] text-xs font-bold text-gray-300 hover:text-white rounded-xl shadow transition-colors w-full sm:w-auto"
            >
              Load More Games
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
