// Screen 05 — Puzzle Trainer with Move Classification + Voicebot
import React, { useState, useEffect } from "react";
import { Crown, Badge, MobileNavBar } from "../../ui";
import { useAuth } from "../../../context/AuthContext";

type MoveClass = "brilliant"|"best"|"good"|"inaccuracy"|"mistake"|"blunder"|null;

const MOVE_META: Record<NonNullable<MoveClass>, { icon:string; color:string; label:string }> = {
  brilliant:  { icon:"✨", color:"text-cyan-400",   label:"Brilliant" },
  best:       { icon:"★",  color:"text-gold",        label:"Best Move" },
  good:       { icon:"✓",  color:"text-green-400",   label:"Good" },
  inaccuracy: { icon:"?!",  color:"text-yellow-400", label:"Inaccuracy" },
  mistake:    { icon:"?",   color:"text-orange-400", label:"Mistake" },
  blunder:    { icon:"??",  color:"text-red-500",    label:"Blunder" },
};

const PIECES: Record<string,string> = {
  "00":"♜","01":"♞","02":"♝","03":"♛","04":"♚","05":"♝","06":"♞","07":"♜",
  "10":"♟","11":"♟","12":"♟","13":"♟","14":"♟","15":"♟","16":"♟","17":"♟",
  "60":"♙","61":"♙","62":"♙","63":"♙","64":"♙","65":"♙","66":"♙","67":"♙",
  "70":"♖","71":"♘","72":"♗","73":"♕","74":"♔","75":"♗","76":"♘","77":"♖",
};

export default function PuzzleScreen() {
  const { user, refreshUser } = useAuth();
  const [selected, setSelected] = useState<number|null>(null);
  const [moveClass, setMoveClass] = useState<MoveClass>(null);
  const [voiceActive, setVoiceActive] = useState(false);
  const [hintShown, setHintShown] = useState(false);
  const [streak, setStreak] = useState(user?.streak ?? 0);
  const [showConfetti, setShowConfetti] = useState(false);
  const cpl = 18;

  useEffect(() => {
    if (user?.streak !== undefined) {
      setStreak(user.streak);
    }
  }, [user?.streak]);

  function handleSquareClick(i: number) {
    if (moveClass) return;
    setSelected(i);
    setTimeout(() => {
      const classes: MoveClass[] = ["brilliant","best","good","inaccuracy","mistake","blunder"];
      const result = classes[Math.floor(Math.random() * 3)];
      setMoveClass(result);
      if (result === "brilliant") setShowConfetti(true);
    }, 400);
  }

  function handleNextPuzzle() {
    setSelected(null);
    setMoveClass(null);
    setHintShown(false);
    setShowConfetti(false);
    if (moveClass === "brilliant" || moveClass === "best" || moveClass === "good") {
      refreshUser();
      setStreak(s => s+1);
    }
  }

  const meta = moveClass ? MOVE_META[moveClass] : null;

  return (
    <div className="bg-dark-bg flex flex-col">
      {/* Confetti burst on brilliant move */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
          {Array.from({length: 20}).map((_,i) => (
            <div
              key={i}
              className="absolute w-2 h-2 rounded-full"
              style={{
                left: `${20 + Math.random() * 60}%`,
                top: '30%',
                backgroundColor: ['#C9A84C','#4ade80','#60a5fa','#f472b6','#facc15'][i % 5],
                animation: `confettiFall ${0.8 + Math.random() * 0.8}s ease-out ${Math.random() * 0.3}s forwards`,
              }}
            />
          ))}
        </div>
      )}
      {/* Top bar */}
      <div className="flex items-center justify-between px-5 pt-5 pb-3 bg-navy border-b border-divider sticky top-0 z-40">
        <button className="text-gray-400 text-xl">←</button>
        <div className="flex items-center gap-2">
          <span className="text-2xl">🔥</span>
          <span className="text-white font-bold">{streak}</span>
          <span className="text-gray-500 text-xs">streak</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-gray-400 text-xs">Puzzle #1,482</span>
          <button
            onClick={() => setHintShown(h => !h)}
            className="text-xs font-medium text-gold bg-navy-mid border border-gold/30 px-3 py-1 rounded-full"
          >
            Hint
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center px-4 py-4">

        {/* Puzzle info bar */}
        <div className="w-full max-w-sm flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Badge variant="gold">Intermediate</Badge>
            <span className="text-gray-500 text-xs">Elo 1,350</span>
          </div>
          {/* CPL badge */}
          <div className="flex items-center gap-1 bg-navy-mid rounded-full px-3 py-1">
            <span className="text-gray-400 text-xs">CPL</span>
            <span className={`text-sm font-bold ${cpl<25?"text-green-400":cpl<50?"text-yellow-400":"text-red-400"}`}>{cpl}</span>
          </div>
        </div>

        {/* Instruction */}
        <div className="w-full max-w-sm bg-navy-mid rounded-xl px-4 py-3 mb-4">
          <p className="text-white text-sm font-medium">White to move — Find the brilliant move! ✨</p>
        </div>

        {/* Chess Board — responsive */}
        <div className="relative mb-4">
          {/* Rank labels */}
          <div className="absolute -left-5 top-0 flex flex-col" style={{height: '100%'}}>
            {[8,7,6,5,4,3,2,1].map(n => (
              <div key={n} className="flex-1 flex items-center">
                <span className="text-gray-500 text-[10px]">{n}</span>
              </div>
            ))}
          </div>

          <div className="chess-board grid grid-cols-8 border-2 border-navy-mid rounded-lg overflow-hidden shadow-2xl">
            {Array.from({length:64}).map((_,i) => {
              const row = Math.floor(i/8), col = i%8;
              const isDark = (row+col)%2===0;
              const piece = PIECES[`${row}${col}`];
              const isBlackPiece = piece && ["♜","♞","♝","♛","♚","♟"].includes(piece);
              const isSelected = selected === i;

              return (
                <div key={i}
                  onClick={() => handleSquareClick(i)}
                  className={`aspect-square flex items-center justify-center text-xl select-none cursor-pointer transition-all
                    ${isDark ? "bg-[#4A6082]" : "bg-[#CBA98F]"}
                    ${isSelected ? "ring-2 ring-gold ring-inset brightness-110" : "hover:brightness-110"}`}
                >
                  {piece && (
                    <span className={`drop-shadow-md ${isBlackPiece ? "text-gray-900" : "text-white"}`}>
                      {piece}
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {/* File labels */}
          <div className="flex mt-1">
            {["a","b","c","d","e","f","g","h"].map(f => (
              <div key={f} className="flex-1 text-center">
                <span className="text-gray-500 text-[10px]">{f}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Move Classification Result */}
        {meta && (
          <div className={`w-full max-w-sm card p-4 mb-4 border-opacity-50`}>
            <div className="flex items-center gap-3 mb-2">
              <span className={`text-3xl font-bold ${meta.color}`}>{meta.icon}</span>
              <div>
                <div className={`font-bold ${meta.color}`}>{meta.label}!</div>
                <div className="text-gray-400 text-xs">CPL contribution: +{cpl}</div>
              </div>
            </div>
            <p className="text-gray-300 text-sm">
              Stockfish confirms: e4 was the critical move. Knights fork on f6 wins material.
            </p>
          </div>
        )}

        {/* Hint panel */}
        {hintShown && (
          <div className="w-full max-w-sm bg-navy-mid rounded-xl px-4 py-3 mb-4 border border-gold/20">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-gold">💡</span>
              <span className="text-gold text-xs font-semibold">Coach Hint</span>
            </div>
            <p className="text-gray-300 text-sm">Look for a knight fork opportunity. Check forcing moves first.</p>
          </div>
        )}

        {/* Voicebot */}
        <div className="w-full max-w-sm">
          <button
            onClick={() => setVoiceActive(v => !v)}
            className={`w-full flex items-center justify-center gap-3 py-3 rounded-full border font-medium text-sm transition-all active:scale-95
              ${voiceActive
                ? "bg-gold border-gold text-navy"
                : "border-gold/40 text-gold-light hover:bg-navy-mid"}`}
          >
            {voiceActive ? (
              /* Waveform bars */
              <span className="flex items-center gap-0.5 h-4">
                {[1,2,3,4,5].map(b => (
                  <span
                    key={b}
                    className="wave-bar w-0.5 bg-navy rounded-full block"
                    style={{ height: `${60 + b * 8}%` }}
                  />
                ))}
              </span>
            ) : (
              <span>🎙</span>
            )}
            {voiceActive ? "Listening… (tap to stop)" : "Ask Tamil Voicebot for help"}
          </button>
          {voiceActive && (
            <div className="bg-navy-mid rounded-xl px-4 py-3 mt-2 animate-fadeIn">
              <p className="text-gray-300 text-sm">
                <span className="text-gold font-semibold">Mantri:</span>{" "}
                "இந்த நிலையில் குதிரை நகர்த்துவது சிறந்த தேர்வு. f6 சதுரத்தை கவனிங்க!"
              </p>
            </div>
          )}
        </div>

        {/* Next puzzle */}
        {moveClass && (
          <button onClick={handleNextPuzzle} className="w-full max-w-sm btn-gold py-4 font-bold text-base mt-4">
            Next Puzzle →
          </button>
        )}
      </div>
    </div>
  );
}
