// Screen 15 — PGN Viewer (paste/upload PGN, step through moves with board)
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Chess } from 'chess.js';
import PgnGameViewer from './PgnGameViewer';
import { ParsedGame } from './types';

const SAMPLE_PGN = `[Event "World Championship"]
[Site "Reykjavik"]
[Date "1972.07.16"]
[White "Fischer, Robert J"]
[Black "Spassky, Boris V"]
[Result "1-0"]

1. d4 d5 2. c4 c6 3. Nc3 Nf6 4. Nf3 e6 5. Bg5 dxc4 6. e4 b5
7. e5 h6 8. Bh4 g5 9. Nxg5 hxg5 10. Bxg5 Nbd7 11. exf6 Bb7
12. g3 c5 13. d5 Qb6 14. Bg2 O-O-O 15. O-O c4 16. Qe2 Bb4 1-0`;

function splitMultiplePgns(text: string): string[] {
  const normalized = text.replace(/\r\n/g, '\n').trim();
  const games = normalized.split(/\n\s*\n(?=\[)/g);
  if (games.length > 0 && games[0]) {
    return games;
  }
  return [normalized];
}

function parsePgn(pgnString: string): ParsedGame {
  const chess = new Chess();
  chess.loadPgn(pgnString);
  
  const headers = chess.getHeaders();
  const history = chess.history({ verbose: true });
  
  const temp = new Chess();
  const startFen = headers['FEN'] || 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
  try {
    if (headers['FEN']) {
      temp.load(headers['FEN']);
    }
  } catch (err) {
    console.error('Error loading custom FEN', err);
  }
  
  const startComment = temp.getComment();
  
  const moves = history.map((move) => {
    try {
      temp.move(move.san);
    } catch {
      // fallback
    }
    const comment = temp.getComment();
    return {
      san: move.san,
      color: move.color as 'w' | 'b',
      from: move.from,
      to: move.to,
      fen: temp.fen(),
      fenBefore: move.before,
      comment: comment || undefined,
    };
  });
  
  return {
    headers,
    moves,
    startFen,
    startComment: startComment || undefined,
  };
}

export default function PgnViewer() {
  const navigate = useNavigate();
  const location = useLocation();
  const isViewer = location.pathname === '/pgn-load/viewer';

  const [pgn, setPgn] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('chess_pgn_input') || '';
    }
    return '';
  });
  const [parsedGames, setParsedGames] = useState<ParsedGame[]>([]);
  const [activeGameIdx, setActiveGameIdx] = useState<number>(0);
  const [error, setError] = useState('');

  // Synchronize/parse existing PGN on mount or path change if we are on the viewer page
  useEffect(() => {
    if (isViewer) {
      const savedPgn = localStorage.getItem('chess_pgn_input');
      if (savedPgn) {
        try {
          const rawGames = splitMultiplePgns(savedPgn);
          const parsed: ParsedGame[] = [];
          for (const gameStr of rawGames) {
            try {
              const game = parsePgn(gameStr);
              if (game.moves.length > 0 || Object.keys(game.headers).length > 0) {
                parsed.push(game);
              }
            } catch (e) {
              console.error('Failed to parse a game block', e);
            }
          }
          if (parsed.length > 0) {
            setParsedGames(parsed);
            setPgn(savedPgn);
          } else {
            navigate('/pgn-load', { replace: true });
          }
        } catch (err) {
          navigate('/pgn-load', { replace: true });
        }
      } else {
        navigate('/pgn-load', { replace: true });
      }
    }
  }, [isViewer, navigate]);

  function handleLoad(pgnToLoad: string = pgn, silent: boolean = false) {
    if (!pgnToLoad.trim()) { 
      if (!silent) setError('Please paste a PGN string first.'); 
      return; 
    }
    try {
      const rawGames = splitMultiplePgns(pgnToLoad);
      const parsed: ParsedGame[] = [];
      
      for (const gameStr of rawGames) {
        try {
          const game = parsePgn(gameStr);
          if (game.moves.length > 0 || Object.keys(game.headers).length > 0) {
            parsed.push(game);
          }
        } catch (e) {
          console.error('Failed to parse a game block', e);
        }
      }

      if (parsed.length === 0) {
        if (!silent) setError('No valid chess games could be parsed. Check your PGN format.');
        return;
      }

      setParsedGames(parsed);
      setActiveGameIdx(0);
      setError('');
      localStorage.setItem('chess_pgn_input', pgnToLoad);
      navigate('/pgn-load/viewer');
    } catch (err) {
      if (!silent) setError('Invalid PGN format. Please check and try again.');
    }
  }

  function handleBack() {
    navigate('/pgn-load');
  }

  function handleLoadNew() {
    setPgn('');
    setParsedGames([]);
    localStorage.removeItem('chess_pgn_input');
    navigate('/pgn-load');
  }

  function loadSample() {
    setPgn(SAMPLE_PGN);
    setError('');
  }

  const handleDragOver = (e: React.DragEvent<HTMLTextAreaElement>) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent<HTMLTextAreaElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.name.endsWith('.pgn')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        setPgn(text);
      };
      reader.readAsText(file);
    }
  };

  if (isViewer) {
    if (parsedGames[activeGameIdx]) {
      return (
        <PgnGameViewer
          game={parsedGames[activeGameIdx]}
          gamesCount={parsedGames.length}
          activeGameIdx={activeGameIdx}
          onGameSelect={setActiveGameIdx}
          onBack={handleBack}
          onLoadNew={handleLoadNew}
        />
      );
    }
    // If we are on the viewer path but games haven't parsed yet (e.g. on mount/refresh),
    // show a clean loading screen instead of flashing the lobby.
    if (typeof window !== 'undefined' && localStorage.getItem('chess_pgn_input')) {
      return (
        <div className="flex-1 bg-[#070E24] flex items-center justify-center min-h-screen text-white select-none">
          <div className="text-center space-y-3">
            <div className="animate-spin text-3xl">⏳</div>
            <div className="text-sm font-semibold text-gray-400">Loading your chess game...</div>
          </div>
        </div>
      );
    }
  }

  return (
    <div className="flex-1 overflow-y-auto bg-[#070E24] p-8 space-y-6 text-white select-none min-h-screen">
      {/* Header */}
      <div>
        <h1 className="text-white text-2xl font-black mb-1 flex items-center gap-2">
          📋 PGN Viewer
        </h1>
        <p className="text-gray-400 text-sm">Paste any PGN game and replay it move by move</p>
      </div>

      <div className="w-full space-y-6">
        {/* How to use */}
        <div className="bg-[#0B1530]/50 border border-[#1E2E52]/60 rounded-xl p-5 shadow-lg">
          <p className="text-[#C9A84C] text-xs font-bold mb-3 uppercase tracking-wider">💡 How to use</p>
          <ul className="space-y-2">
            {[
              'Paste any PGN text from chess.com, Lichess, or ChessBase',
              'Click Load Game to parse the moves',
              'Use ⏮ ◀ ▶ ⏭ to navigate through the game'
            ].map((tip, i) => (
              <li key={i} className="flex items-start gap-2.5">
                <span className="text-[#C9A84C] text-xs font-bold">✓</span>
                <span className="text-gray-300 text-xs leading-relaxed">{tip}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Input Form */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-gray-400 text-[10px] font-bold uppercase tracking-wider">PGN INPUT</label>
            <button
              onClick={loadSample}
              className="text-xs text-[#C9A84C] border border-[#C9A84C]/40 hover:border-[#C9A84C] hover:bg-[#C9A84C]/10 px-4 py-1.5 rounded-full transition-colors font-semibold flex items-center gap-1"
            >
              ⚡ Load Sample
            </button>
          </div>
          
          <textarea
            value={pgn}
            onChange={e => { setPgn(e.target.value); setError(''); localStorage.setItem('chess_pgn_input', e.target.value); }}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            placeholder={`Paste PGN here...\n\n[Event "My Game"]\n[White "Player 1"]\n[Black "Player 2"]\n[Result "1-0"]\n\n1. e4 e5 2. Nf3 Nc6 3. Bb5...`}
            className="w-full bg-[#0D1530] border border-[#1E2E52] rounded-xl px-4 py-3.5 text-xs text-gray-300 placeholder-gray-600 focus:outline-none focus:border-[#C9A84C] transition-colors font-mono resize-none shadow-inner"
            rows={10}
          />
          
          {error && (
            <div className="bg-red-900/20 border border-red-700/30 rounded-xl px-4 py-3">
              <p className="text-red-400 text-xs">⚠ {error}</p>
            </div>
          )}

          {/* Load button */}
          <button
            onClick={() => handleLoad(pgn)}
            disabled={!pgn.trim()}
            className={`w-full py-4 rounded-xl font-bold text-sm transition-all duration-200 select-none text-center flex items-center justify-center gap-2 ${
              !pgn.trim() 
                ? 'bg-gray-700/50 text-gray-500 cursor-not-allowed border border-gray-600/30'
                : 'bg-[#C9A84C] hover:bg-[#B3933B] text-[#0A1128] shadow-lg active:scale-[0.99]'
            }`}
          >
            📋 Load Game →
          </button>
        </div>

        {/* Supported sources */}
        <div className="bg-[#0B1530]/30 border border-[#1E2E52]/40 rounded-xl p-5 shadow-lg space-y-4">
          <p className="text-gray-400 text-[10px] font-bold uppercase tracking-wider">SUPPORTED SOURCES</p>
          <div className="grid grid-cols-3 gap-4">
            {[
              { name: 'Chess.com', icon: '♛' },
              { name: 'Lichess', icon: '♞' },
              { name: 'ChessBase', icon: '♜' },
            ].map(s => (
              <div key={s.name} className="bg-[#0D1530]/80 border border-[#1E2E52]/40 rounded-xl p-6 text-center flex flex-col items-center justify-center gap-2 hover:bg-[#12234A]/30 transition-all cursor-pointer">
                <span className="text-3xl text-white block">{s.icon}</span>
                <span className="text-gray-400 text-xs font-semibold">{s.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
