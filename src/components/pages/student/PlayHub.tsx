// Screen 13 — Play Hub (vs Computer, vs Friend, Blindfold mode)
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Badge } from "../../ui";

type GameMode = 'computer' | 'friend' | 'blindfold';
type Difficulty = 'beginner' | 'intermediate' | 'advanced' | 'master';
type TimeControl = '1+0' | '3+2' | '5+0' | '10+0' | '15+10';
type ColorChoice = 'white' | 'black' | 'random';

const DIFFICULTIES: { key: Difficulty; label: string; elo: string; icon: string; desc: string }[] = [
  { key: 'beginner',     label: 'Beginner',     elo: '400–800',   icon: '🐣', desc: 'Perfect for new players' },
  { key: 'intermediate', label: 'Intermediate', elo: '800–1200',  icon: '♟',  desc: 'Develop your tactics' },
  { key: 'advanced',     label: 'Advanced',     elo: '1200–1800', icon: '♞',  desc: 'Sharpen your strategy' },
  { key: 'master',       label: 'Master',       elo: '1800–2400', icon: '👑', desc: 'Face Stockfish strength' },
];

const TIME_CONTROLS: { value: TimeControl; label: string; type: string }[] = [
  { value: '1+0',   label: '1 min',     type: 'Bullet' },
  { value: '3+2',   label: '3+2',       type: 'Blitz' },
  { value: '5+0',   label: '5 min',     type: 'Blitz' },
  { value: '10+0',  label: '10 min',    type: 'Rapid' },
  { value: '15+10', label: '15+10',     type: 'Rapid' },
];

const PIECES_DISPLAY: Record<string, string> = {
  "00":"♜","01":"♞","02":"♝","03":"♛","04":"♚","05":"♝","06":"♞","07":"♜",
  "10":"♟","11":"♟","12":"♟","13":"♟","14":"♟","15":"♟","16":"♟","17":"♟",
  "60":"♙","61":"♙","62":"♙","63":"♙","64":"♙","65":"♙","66":"♙","67":"♙",
  "70":"♖","71":"♘","72":"♗","73":"♕","74":"♔","75":"♗","76":"♘","77":"♖",
};

function MiniBoard({ blindfold = false }: { blindfold?: boolean }) {
  return (
    <div className="grid grid-cols-8 rounded-xl overflow-hidden border-2 border-navy-mid shadow-xl" style={{ width: 160, height: 160 }}>
      {Array.from({length: 64}).map((_,i) => {
        const row = Math.floor(i/8), col = i%8;
        const isDark = (row+col)%2===0;
        const piece = PIECES_DISPLAY[`${row}${col}`];
        const isBlack = piece && ['♜','♞','♝','♛','♚','♟'].includes(piece);
        return (
          <div key={i} className={`flex items-center justify-center text-xs select-none ${
            isDark ? 'bg-[#4A6082]' : 'bg-[#CBA98F]'
          }`}>
            {piece && !blindfold && (
              <span className={isBlack ? 'text-gray-900' : 'text-white'}>{piece}</span>
            )}
            {piece && blindfold && (
              <span className="w-2 h-2 rounded-full bg-gray-600" />
            )}
          </div>
        );
      })}
    </div>
  );
}

function ComputerTab() {
  const navigate = useNavigate();
  const [difficulty, setDifficulty] = useState<Difficulty>('intermediate');
  const [timeControl, setTimeControl] = useState<TimeControl>('10+0');
  const [color, setColor] = useState<ColorChoice>('white');

  return (
    <div className="space-y-4 animate-fadeIn">
      {/* Board preview */}
      {/* <div className="flex justify-center">
        <div className="relative">
          <MiniBoard />
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-dark-bg border border-gold/30 rounded-full px-3 py-1">
            <span className="text-gold text-xs font-semibold">
              {DIFFICULTIES.find(d => d.key === difficulty)?.elo} Elo
            </span>
          </div>
        </div>
      </div> */}

      {/* Difficulty */}
      <div>
        <p className="text-gray-400 text-xs font-semibold mb-2 uppercase tracking-wider">Difficulty</p>
        <div className="grid grid-cols-2 gap-2">
          {DIFFICULTIES.map(d => (
            <button
              key={d.key}
              onClick={() => setDifficulty(d.key)}
              className={`p-3 rounded-xl border text-left transition-all active:scale-95 ${
                difficulty === d.key
                  ? 'border-gold bg-gold/10 shadow-md'
                  : 'border-divider bg-card-bg hover:border-gold/40'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg">{d.icon}</span>
                <span className={`text-sm font-bold ${
                  difficulty === d.key ? 'text-gold' : 'text-white'
                }`}>{d.label}</span>
              </div>
              <p className="text-gray-500 text-[10px]">{d.desc}</p>
              <p className="text-gold-light text-[10px] font-semibold mt-0.5">{d.elo} Elo</p>
            </button>
          ))}
        </div>
      </div>

      {/* Time Control */}
      <div>
        <p className="text-gray-400 text-xs font-semibold mb-2 uppercase tracking-wider">Time Control</p>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {TIME_CONTROLS.map(tc => (
            <button
              key={tc.value}
              onClick={() => setTimeControl(tc.value)}
              className={`flex-shrink-0 flex flex-col items-center px-3 py-2 rounded-xl border text-xs transition-all active:scale-95 ${
                timeControl === tc.value
                  ? 'border-gold bg-gold/10 text-gold'
                  : 'border-divider bg-card-bg text-gray-400 hover:border-gold/40'
              }`}
            >
              <span className="font-bold">{tc.label}</span>
              <span className="text-[10px] opacity-70">{tc.type}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Color */}
      <div>
        <p className="text-gray-400 text-xs font-semibold mb-2 uppercase tracking-wider">Play As</p>
        <div className="flex gap-2">
          {(['white', 'black', 'random'] as ColorChoice[]).map(c => (
            <button
              key={c}
              onClick={() => setColor(c)}
              className={`flex-1 py-2.5 rounded-xl border text-xs font-semibold transition-all active:scale-95 capitalize ${
                color === c
                  ? 'border-gold bg-gold/10 text-gold'
                  : 'border-divider bg-card-bg text-gray-400 hover:border-gold/40'
              }`}
            >
              {c === 'white' ? '♔ White' : c === 'black' ? '♚ Black' : '🎲 Random'}
            </button>
          ))}
        </div>
      </div>

      <button
        className="w-full btn-gold py-4 font-bold text-base mt-2"
        onClick={() => navigate('/play/ai', { state: { difficulty, timeControl, color } })}
      >
        ♟ Start Game →
      </button>
    </div>
  );
}

function FriendTab() {
  const [inviteCode] = useState(() => Math.random().toString(36).substring(2, 8).toUpperCase());
  const [friendCode, setFriendCode] = useState('');
  const [tab, setTab] = useState<'create'|'join'>('create');
  const [timeControl, setTimeControl] = useState<TimeControl>('10+0');

  return (
    <div className="space-y-4 animate-fadeIn">
      <div className="flex bg-navy-mid rounded-xl p-1">
        {(['create', 'join'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-colors ${
              tab === t ? 'bg-gold text-navy shadow-md' : 'text-gray-400'
            }`}
          >
            {t === 'create' ? '🔗 Create Game' : '🎮 Join Game'}
          </button>
        ))}
      </div>

      {tab === 'create' && (
        <div className="space-y-4">
          <div className="card-glow p-5 text-center">
            <p className="text-gray-400 text-xs mb-2">Your game invite code</p>
            <div className="text-gold text-4xl font-black tracking-widest mb-2 font-mono">{inviteCode}</div>
            <p className="text-gray-500 text-xs">Share this code with your friend</p>
            <button className="mt-3 text-xs text-gold border border-gold/30 px-4 py-1.5 rounded-full hover:bg-gold/10 transition-colors">
              📋 Copy Code
            </button>
          </div>

          <div>
            <p className="text-gray-400 text-xs font-semibold mb-2 uppercase tracking-wider">Time Control</p>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {TIME_CONTROLS.map(tc => (
                <button
                  key={tc.value}
                  onClick={() => setTimeControl(tc.value)}
                  className={`flex-shrink-0 flex flex-col items-center px-3 py-2 rounded-xl border text-xs transition-all ${
                    timeControl === tc.value
                      ? 'border-gold bg-gold/10 text-gold'
                      : 'border-divider bg-card-bg text-gray-400 hover:border-gold/40'
                  }`}
                >
                  <span className="font-bold">{tc.label}</span>
                  <span className="text-[10px] opacity-70">{tc.type}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="card p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-navy-mid border border-divider flex items-center justify-center">
              <span className="text-lg animate-pulseRing">⏳</span>
            </div>
            <div>
              <p className="text-white text-sm font-semibold">Waiting for opponent…</p>
              <p className="text-gray-500 text-xs">Share code: <span className="text-gold font-mono font-bold">{inviteCode}</span></p>
            </div>
          </div>

          <button className="w-full btn-gold py-4 font-bold text-base">
            🔗 Create & Wait
          </button>
        </div>
      )}

      {tab === 'join' && (
        <div className="space-y-4">
          <div>
            <label className="block text-xs text-gray-400 mb-2 font-semibold uppercase tracking-wider">Enter Game Code</label>
            <input
              type="text"
              value={friendCode}
              onChange={e => setFriendCode(e.target.value.toUpperCase().slice(0,6))}
              placeholder="e.g. ABC123"
              className="input-field text-center text-2xl font-black tracking-widest text-gold uppercase font-mono"
              maxLength={6}
            />
          </div>
          <button
            className={`w-full btn-gold py-4 font-bold text-base ${
              friendCode.length < 6 ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            disabled={friendCode.length < 6}
          >
            🎮 Join Game →
          </button>
          <p className="text-center text-xs text-gray-500">Ask your friend for their 6-character game code</p>
        </div>
      )}
    </div>
  );
}

function BlindTab() {
  const navigate = useNavigate();
  const [difficulty, setDifficulty] = useState<Difficulty>('beginner');
  const [previewBlind, setPreviewBlind] = useState(false);

  return (
    <div className="space-y-4 animate-fadeIn">
      {/* Blindfold explainer */}
      <div className="card-glow p-4 flex items-start gap-3">
        <span className="text-3xl">🙈</span>
        <div>
          <h4 className="text-white font-bold text-sm mb-1">Blindfold Chess Mode</h4>
          <p className="text-gray-400 text-xs leading-relaxed">
            Play without seeing the pieces! Only the board squares are visible. A legendary training method used by World Champions to visualise the board.
          </p>
        </div>
      </div>

      {/* Board preview toggle */}
      <div className="flex justify-center">
        <div className="relative">
          <MiniBoard blindfold={previewBlind} />
          <button
            onClick={() => setPreviewBlind(b => !b)}
            className="mt-3 mx-auto block text-xs text-gold border border-gold/30 px-4 py-1.5 rounded-full hover:bg-gold/10 transition-colors"
          >
            {previewBlind ? '👁 Show Pieces' : '🙈 Preview Blind Mode'}
          </button>
        </div>
      </div>

      {/* Tips */}
      <div className="space-y-2">
        {[
          { icon: '🧠', tip: 'Visualise each piece position mentally before moving' },
          { icon: '🎙', tip: 'Use Mantri AI voice coach to announce moves' },
          { icon: '📈', tip: 'Start with Beginner level and slowly increase difficulty' },
        ].map((t, i) => (
          <div key={i} className="flex items-center gap-3 bg-navy-mid rounded-xl px-4 py-3">
            <span className="text-xl">{t.icon}</span>
            <p className="text-gray-300 text-xs">{t.tip}</p>
          </div>
        ))}
      </div>

      {/* Difficulty picker */}
      <div>
        <p className="text-gray-400 text-xs font-semibold mb-2 uppercase tracking-wider">AI Difficulty</p>
        <div className="grid grid-cols-2 gap-2">
          {DIFFICULTIES.slice(0, 2).map(d => (
            <button
              key={d.key}
              onClick={() => setDifficulty(d.key)}
              className={`p-3 rounded-xl border text-left transition-all active:scale-95 ${
                difficulty === d.key
                  ? 'border-gold bg-gold/10'
                  : 'border-divider bg-card-bg hover:border-gold/40'
              }`}
            >
              <span className="text-lg block mb-1">{d.icon}</span>
              <span className={`text-xs font-bold ${
                difficulty === d.key ? 'text-gold' : 'text-white'
              }`}>{d.label}</span>
              <p className="text-gray-500 text-[10px]">{d.elo} Elo</p>
            </button>
          ))}
        </div>
      </div>

      <button
        className="w-full btn-gold py-4 font-bold text-base"
        onClick={() => navigate('/analysis')}
      >
        🙈 Start Blindfold Game →
      </button>
    </div>
  );
}

export default function PlayHub() {
  const [mode, setMode] = useState<GameMode>('computer');

  const MODES: { key: GameMode; icon: string; label: string; sub: string; locked?: boolean }[] = [
    { key: 'computer',  icon: '🤖', label: 'vs Computer', sub: 'Stockfish AI' },
    { key: 'friend',    icon: '🤝', label: 'vs Friend',   sub: 'Coming Soon', locked: true },
    { key: 'blindfold', icon: '🙈', label: 'Blindfold',   sub: 'Coming Soon', locked: true },
  ];

  return (
    <div className="min-h-screen bg-dark-bg flex flex-col pb-6">
      {/* Page header */}
      <div className="px-5 pt-5 pb-4">
        <h1 className="text-white text-2xl font-black mb-1">Play Chess</h1>
        <p className="text-gray-400 text-sm">Choose your game mode and settings</p>
      </div>

      {/* Mode selector */}
      <div className="px-4 mb-5">
        <div className="grid grid-cols-3 gap-3">
          {MODES.map(m => (
            <button
              key={m.key}
              onClick={() => {
                if (!m.locked) setMode(m.key);
              }}
              className={`flex flex-col items-center gap-1.5 p-4 rounded-2xl border transition-all active:scale-95 relative overflow-hidden ${
                mode === m.key && !m.locked
                  ? 'border-gold bg-gold/10 shadow-lg'
                  : 'border-divider bg-card-bg hover:border-gold/40'
              } ${m.locked ? 'opacity-50 cursor-not-allowed hover:border-divider' : ''}`}
            >
              {mode === m.key && !m.locked && (
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gold" />
              )}
              {m.locked && (
                <div className="absolute top-2 right-2 text-xs">🔒</div>
              )}
              <span className="text-2xl">{m.icon}</span>
              <span className={`text-xs font-bold ${
                mode === m.key && !m.locked ? 'text-gold' : 'text-white'
              }`}>{m.label}</span>
              <span className="text-gray-500 text-[10px]">{m.sub}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Mode content */}
      <div className="flex-1 px-4">
        {mode === 'computer'  && <ComputerTab />}
        {mode === 'friend'    && <FriendTab />}
        {mode === 'blindfold' && <BlindTab />}
      </div>
    </div>
  );
}
