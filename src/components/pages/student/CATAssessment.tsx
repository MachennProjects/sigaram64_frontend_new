// Screen 03 — CAT Assessment (Intro + Live Puzzle)
import React, { useState, useEffect, useRef } from "react";
import { Crown, Badge } from "../../ui";

const PUZZLES = [
  {
    fen: "start",
    instruction: { en: "White to move. Find the best move.", ta: "வெள்ளை நகரணும். சிறந்த நடவடிக்கை கண்டுபிடி." },
    difficulty: "Beginner",
    elo: 800,
    hint: "Look for a fork!",
  },
  {
    fen: "mid",
    instruction: { en: "Black to move. Find the winning combination.", ta: "கருப்பு நகரணும். வெற்றி கலவை கண்டுபிடி." },
    difficulty: "Intermediate",
    elo: 1200,
    hint: "Pin the piece!",
  },
];

const PIECES: Record<string,string> = {
  "00":"♜","01":"♞","02":"♝","03":"♛","04":"♚","05":"♝","06":"♞","07":"♜",
  "10":"♟","11":"♟","12":"♟","13":"♟","14":"♟","15":"♟","16":"♟","17":"♟",
  "60":"♙","61":"♙","62":"♙","63":"♙","64":"♙","65":"♙","66":"♙","67":"♙",
  "70":"♖","71":"♘","72":"♗","73":"♕","74":"♔","75":"♗","76":"♘","77":"♖",
};

function AssessmentIntro({ onStart, lang }: { onStart: ()=>void; lang: "en"|"ta" }) {
  const content = {
    en: {
      title: "Adaptive Chess Assessment",
      sub: "Discover your true chess level in 8–12 minutes",
      bullets: [
        "20 adaptive puzzles — difficulty adjusts to your answers",
        "Click pieces on the board — no notation typing needed",
        "Bilingual: switch Tamil ↔ English anytime",
        "Accurate Elo rating from your very first attempt",
      ],
      note: "Assessment saved automatically. Resume anytime.",
      btn: "Begin Assessment",
      level: "Expected level range: Elo 400 – 2,400",
    },
    ta: {
      title: "தகவமைப்பு சதுரங்க மதிப்பீடு",
      sub: "8–12 நிமிடங்களில் உங்கள் உண்மையான நிலையை கண்டுபிடிக்கவும்",
      bullets: [
        "20 தகவமைக்கக்கூடிய புதிர்கள் — உங்கள் பதில்களுக்கு ஏற்ப சிரமம் மாறும்",
        "சதுரங்கப் பலகையில் கிளிக் செய்யுங்கள் — குறிப்பு தட்டச்சு தேவையில்லை",
        "இருமொழி: எந்த நேரத்திலும் தமிழ் ↔ ஆங்கிலம் மாற்றலாம்",
        "உங்கள் முதல் முயற்சியிலேயே துல்லியமான Elo மதிப்பீடு",
      ],
      note: "மதிப்பீடு தானாகவே சேமிக்கப்படும். எப்போது வேண்டுமானாலும் தொடரலாம்.",
      btn: "மதிப்பீட்டை தொடங்கு",
      level: "எதிர்பார்க்கப்படும் நிலை: Elo 400 – 2,400",
    }
  };
  const c = content[lang];
  return (
    <div className="flex-1 flex items-center justify-center px-5 py-10">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-2xl bg-navy-mid border border-gold/30 flex items-center justify-center mx-auto mb-5">
            <span className="text-5xl">🧠</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">{c.title}</h1>
          <p className="text-gray-400">{c.sub}</p>
        </div>

        <div className="card p-6 mb-6">
          <ul className="space-y-3">
            {c.bullets.map((b,i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="text-gold mt-0.5">✓</span>
                <span className="text-gray-300 text-sm">{b}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex items-center gap-2 bg-navy-mid rounded-xl px-4 py-3 mb-6">
          <span className="text-gold text-sm">📊</span>
          <span className="text-gold-light text-sm font-medium">{c.level}</span>
        </div>

        <button onClick={onStart} className="w-full btn-gold py-4 text-base font-bold mb-3">
          {c.btn}
        </button>
        <p className="text-center text-xs text-gray-500">{c.note}</p>
      </div>
    </div>
  );
}

function LivePuzzle({ puzzleIdx, total, lang, onNext }: {
  puzzleIdx: number; total: number; lang: "en"|"ta"; onNext: ()=>void;
}) {
  const [selected, setSelected] = useState<number|null>(null);
  const [answered, setAnswered] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const puzzle = PUZZLES[puzzleIdx % PUZZLES.length];

  useEffect(() => {
    setTimeLeft(30); setAnswered(false); setSelected(null);
  }, [puzzleIdx]);

  useEffect(() => {
    if (answered) return;
    const t = setInterval(() => setTimeLeft(s => {
      if (s <= 1) { clearInterval(t); setAnswered(true); return 0; }
      return s - 1;
    }), 1000);
    return () => clearInterval(t);
  }, [puzzleIdx, answered]);

  const progress = ((puzzleIdx) / total) * 100;
  const timeColor = timeLeft > 15 ? "text-green-400" : timeLeft > 7 ? "text-yellow-400" : "text-red-400";

  return (
    <div className="flex-1 flex flex-col px-4 py-4 max-w-lg mx-auto w-full animate-fadeIn">
      {/* Progress bar + circular timer */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-gray-400 text-xs">Puzzle {puzzleIdx+1} of {total}</span>
          {/* Circular countdown */}
          <div className="relative w-10 h-10">
            <svg className="w-10 h-10 -rotate-90" viewBox="0 0 36 36">
              <circle cx="18" cy="18" r="15.9" fill="none" stroke="#1E2E52" strokeWidth="3" />
              <circle
                cx="18" cy="18" r="15.9" fill="none"
                stroke={timeLeft > 15 ? "#4ade80" : timeLeft > 7 ? "#facc15" : "#f87171"}
                strokeWidth="3"
                strokeDasharray="100"
                strokeDashoffset={100 - (timeLeft / 30) * 100}
                strokeLinecap="round"
                className="transition-all duration-1000"
              />
            </svg>
            <span className={`absolute inset-0 flex items-center justify-center text-[10px] font-bold font-mono ${timeColor}`}>
              {timeLeft}
            </span>
          </div>
        </div>
        <div className="h-2 bg-navy-mid rounded-full overflow-hidden">
          <div className="h-full bg-gold rounded-full transition-all duration-300" style={{width:`${progress}%`}} />
        </div>
        <div className="flex justify-between mt-1">
          <Badge variant="gold">{puzzle.difficulty}</Badge>
          <span className="text-gray-500 text-xs">Elo ~{puzzle.elo}</span>
        </div>
      </div>

      {/* Instruction */}
      <div className="bg-navy-mid rounded-xl px-4 py-3 mb-4 flex items-center gap-3">
        <span className="text-gold text-lg">💡</span>
        <p className="text-white text-sm font-medium">{puzzle.instruction[lang]}</p>
      </div>

      {/* Chess Board — responsive */}
      <div className="flex justify-center mb-4">
        <div className="relative">
          {/* Rank labels */}
          <div className="absolute -left-5 top-0 bottom-0 flex flex-col">
            {[8,7,6,5,4,3,2,1].map(n => (
              <div key={n} className="flex-1 flex items-center">
                <span className="text-gray-500 text-[10px]">{n}</span>
              </div>
            ))}
          </div>
          <div className="chess-board grid grid-cols-8 border-2 border-navy-mid rounded overflow-hidden shadow-xl">
            {Array.from({length:64}).map((_,i) => {
              const row = Math.floor(i/8), col = i%8;
              const isDark = (row+col)%2===0;
              const piece = PIECES[`${row}${col}`];
              const isBlack = piece && ["♜","♞","♝","♛","♚","♟"].includes(piece);
              return (
                <div key={i}
                  onClick={() => { if(!answered){ setSelected(i); setAnswered(true); } }}
                  className={`aspect-square flex items-center justify-center text-xl select-none cursor-pointer
                    transition-all hover:brightness-110
                    ${isDark ? "bg-[#4A6082]" : "bg-[#CBA98F]"}
                    ${selected===i ? "ring-2 ring-gold ring-inset brightness-110" : ""}`}
                >
                  {piece && (
                    <span className={isBlack ? "text-gray-900 drop-shadow" : "text-white drop-shadow-md"}>
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
      </div>

      {/* Hint / Result */}
      {answered ? (
        <div className="card p-4 mb-4 border-green-700/40 bg-green-900/20">
          <p className="text-green-400 text-sm font-semibold">✓ Answer recorded</p>
          <p className="text-gray-400 text-xs mt-1">Moving to next puzzle…</p>
        </div>
      ) : (
        <div className="flex items-center gap-2 text-gray-500 text-xs mb-4">
          <span>🎙</span>
          <span>Click a piece to move · Voice hint available</span>
        </div>
      )}

      {answered && (
        <button onClick={onNext} className="w-full btn-gold py-3 font-semibold">
          {puzzleIdx + 1 >= total ? "View My Rating →" : "Next Puzzle →"}
        </button>
      )}
    </div>
  );
}

export default function CATAssessment() {
  const [phase, setPhase] = useState<"intro"|"puzzle"|"done">("intro");
  const [puzzleIdx, setPuzzleIdx] = useState(0);
  const [lang, setLang] = useState<"en"|"ta">("en");
  const TOTAL = 10;

  function handleNext() {
    if (puzzleIdx + 1 >= TOTAL) setPhase("done");
    else setPuzzleIdx(i => i+1);
  }

  return (
    <div className="min-h-screen bg-dark-bg flex flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-divider">
        <div className="flex items-center gap-2">
          <Crown size={18} />
          <span className="text-gold font-bold">SIGARAM64</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setLang(l => l==="en"?"ta":"en")}
            className="text-xs font-semibold text-gold bg-navy-mid border border-gold/30 px-3 py-1.5 rounded-full"
          >
            {lang==="en" ? "தமிழ்" : "EN"}
          </button>
          {phase==="puzzle" && (
            <button className="text-gray-400 text-xs hover:text-white">Save & Exit</button>
          )}
        </div>
      </div>

      {phase === "intro" && <AssessmentIntro onStart={() => setPhase("puzzle")} lang={lang} />}
      {phase === "puzzle" && (
        <LivePuzzle puzzleIdx={puzzleIdx} total={TOTAL} lang={lang} onNext={handleNext} />
      )}
      {phase === "done" && (
        <div className="flex-1 flex items-center justify-center px-5 py-10">
          <div className="text-center max-w-sm">
            <div className="text-6xl mb-4">🏆</div>
            <h2 className="text-3xl font-bold text-white mb-2">Assessment Complete!</h2>
            <p className="text-gray-400 mb-6">Your rating is being calculated…</p>
            <div className="card p-6 mb-6">
              <div className="text-gold text-5xl font-bold mb-1">1,240</div>
              <div className="text-gray-400 text-sm">Your Estimated Elo Rating</div>
              <div className="mt-3"><Badge variant="green">Intermediate · Class B</Badge></div>
            </div>
            <button className="btn-gold w-full py-4">Go to Dashboard →</button>
          </div>
        </div>
      )}
    </div>
  );
}
