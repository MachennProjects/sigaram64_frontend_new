// Screen 07 — Feature Shelf (Coming Soon Phase 2/3 with detail modals)
import React, { useState } from "react";
import { Crown, Badge } from "../../ui";

interface Feature {
  icon: string;
  title: string;
  phase: string;
  eta: string;
  desc: string;
  details: string[];
  color: string;
}

const FEATURES: Feature[] = [
  {
    icon:"🗺️", title:"Campaign Map", phase:"Phase 2", eta:"Q3 2026",
    color:"from-blue-900/40 to-navy",
    desc:"23-level Duolingo-style chess journey. XP, streaks, hearts, badges, avatar customisation.",
    details:[
      "23 progressive levels — Pawn to World Champion",
      "XP system with streaks and hearts",
      "Custom avatar with unlockable chess pieces",
      "Daily quests and weekly challenges",
      "Leaderboards per school and district",
    ],
  },
  {
    icon:"🎬", title:"Video Lessons", phase:"Phase 2", eta:"Q4 2026",
    color:"from-purple-900/40 to-navy",
    desc:"AI-generated lessons with interactive board overlays. Heygen + Higgsfield + Remotion pipeline.",
    details:[
      "AI-generated coach avatar narrates each lesson",
      "Interactive board overlays — click to explore",
      "Tamil and English audio tracks",
      "Lesson notes auto-saved to your profile",
      "Progress-gated: unlock as you improve",
    ],
  },
  {
    icon:"🏫", title:"Virtual Live Classes", phase:"Phase 2", eta:"Q1 2027",
    color:"from-green-900/40 to-navy",
    desc:"Beats Zoom. Synced demo board. AI chess move detection. Auto post-class puzzle packs.",
    details:[
      "Synced interactive demo board for teacher",
      "AI detects moves from camera — no board setup needed",
      "Attendance auto-tracked",
      "Post-class puzzle pack auto-generated",
      "Recording + transcript saved",
    ],
  },
  {
    icon:"🏆", title:"Tournament Manager", phase:"Phase 2", eta:"Q2 2027",
    color:"from-yellow-900/40 to-navy",
    desc:"Swiss · Arena · Round Robin. Full bracket with auto-pairing and live results.",
    details:[
      "Swiss, Arena, Round Robin formats",
      "Auto-pairing engine (Elo-balanced)",
      "Live results dashboard for spectators",
      "Arbiter controls — pause, bye, forfeit",
      "Digital certificate for winners",
    ],
  },
  {
    icon:"♟",  title:"Endgame Lab", phase:"Phase 2", eta:"Q3 2027",
    color:"from-orange-900/40 to-navy",
    desc:"E1–E10: Basic checkmates through GM-level rook endings. Structured progression.",
    details:[
      "10-tier structured endgame curriculum",
      "Interactive board training for each ending",
      "Spaced repetition recall",
      "Performance tracking by endgame type",
      "GM explanations for each technique",
    ],
  },
  {
    icon:"🤖", title:"Mantri AI Advisor", phase:"Phase 3", eta:"Q4 2027",
    color:"from-cyan-900/40 to-navy",
    desc:"World's first Tamil-speaking chess AI advisor. LLM-powered position explanations.",
    details:[
      "Conversational Tamil chess coaching",
      "Position-specific Socratic questions",
      "Weakness identification from game history",
      "Study plan generation per student",
      "Integration with voicebot for audio output",
    ],
  },
  {
    icon:"📱", title:"Native Mobile App", phase:"Phase 3", eta:"Q1 2028",
    color:"from-rose-900/40 to-navy",
    desc:"iOS + Android. Offline-first puzzle play. Syncs when connection returns.",
    details:[
      "iOS and Android native apps",
      "Offline puzzle play — no internet needed",
      "Background sync when connection returns",
      "Push notifications for challenges and results",
      "Biometric login support",
    ],
  },
  {
    icon:"🌍", title:"Global Expansion", phase:"Phase 3", eta:"Q2 2028",
    color:"from-indigo-900/40 to-navy",
    desc:"Tamil → Hindi → Arabic → Spanish. FIDE partnership track for international scale.",
    details:[
      "Multi-language platform: Tamil, Hindi, Arabic, Spanish",
      "FIDE official partnership track",
      "Country-specific curriculum adaptations",
      "Global leaderboard",
      "International tournament integrations",
    ],
  },
];

export default function FeatureShelf() {
  const [modal, setModal] = useState<Feature|null>(null);
  const [activeFilter, setActiveFilter] = useState<"All"|"Phase 2"|"Phase 3">("All");

  const filteredFeatures = FEATURES.filter(f =>
    activeFilter === "All" ? true : f.phase === activeFilter
  );

  return (
    <div className="min-h-screen bg-dark-bg flex flex-col pb-20">
      {/* Top bar */}
      <div className="flex items-center justify-between px-5 pt-5 pb-3 bg-navy border-b border-divider sticky top-0 z-40">
        <button className="text-gray-400 text-xl">←</button>
        <span className="text-white font-semibold text-sm">Coming Soon</span>
        <span className="text-xs text-gold">Phase 2 & 3</span>
      </div>

      <div className="px-4 py-5">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-white mb-1">The Full Vision</h2>
          <p className="text-gray-400 text-sm">Every feature is planned, sequenced, and coming. Tap to learn more.</p>
        </div>

        {/* Phase filter */}
        <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
          {(["All","Phase 2","Phase 3"] as const).map(p => (
            <button
              key={p}
              onClick={() => setActiveFilter(p)}
              className={`flex-shrink-0 text-xs font-semibold px-4 py-1.5 rounded-full transition-all active:scale-95 ${
                activeFilter === p
                  ? "bg-gold text-navy shadow-md"
                  : "text-gold bg-navy-mid border border-gold/30 hover:bg-gold hover:text-navy"
              }`}
            >
              {p}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 gap-4">
          {filteredFeatures.map((f,i) => (
            <button
              key={i}
              onClick={() => setModal(f)}
              className={`bg-gradient-to-b ${f.color} rounded-2xl border border-divider p-4 text-left relative overflow-hidden hover:border-gold/40 transition-colors`}
            >
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gold/30 rounded-t-2xl" />
              <span className="text-3xl mb-2 block">{f.icon}</span>
              <h3 className="text-white text-sm font-semibold leading-tight mb-1">{f.title}</h3>
              <div className="flex items-center gap-1">
                <span className="text-gold-light text-[10px] font-semibold">{f.phase}</span>
                <span className="text-gray-600 text-[10px]">·</span>
                <span className="text-gray-500 text-[10px]">{f.eta}</span>
              </div>
            </button>
          ))}
        </div>

        {/* Subscribe nudge */}
        <div className="mt-6 card p-5 text-center">
          <p className="text-white font-semibold mb-2">Get notified when features launch</p>
          <p className="text-gray-400 text-sm mb-4">Early access for existing users</p>
          <button className="btn-gold px-6 py-3 text-sm w-full">Notify Me →</button>
        </div>
      </div>

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-end" onClick={() => setModal(null)}>
          <div
            className="bg-dark-bg border-t-2 border-gold rounded-t-3xl w-full p-6 pb-10"
            onClick={e => e.stopPropagation()}
          >
            <div className="w-10 h-1 bg-divider rounded-full mx-auto mb-5" />
            <div className="flex items-start gap-4 mb-4">
              <span className="text-5xl">{modal.icon}</span>
              <div>
                <h3 className="text-white text-xl font-bold">{modal.title}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="coming">{modal.phase}</Badge>
                  <span className="text-gray-500 text-xs">{modal.eta}</span>
                </div>
              </div>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed mb-5">{modal.desc}</p>
            <h4 className="text-gold text-sm font-semibold mb-3">What's included:</h4>
            <ul className="space-y-2 mb-6">
              {modal.details.map((d,i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-gold text-sm mt-0.5">✓</span>
                  <span className="text-gray-300 text-sm">{d}</span>
                </li>
              ))}
            </ul>
            <button className="w-full btn-gold py-3 font-semibold">Get Early Access Notification</button>
          </div>
        </div>
      )}
    </div>
  );
}
