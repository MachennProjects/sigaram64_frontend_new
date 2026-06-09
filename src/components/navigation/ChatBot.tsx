// Mantri AI Coach — Floating ChatBot
import React, { useState } from 'react';

interface ChatMessage {
  role: 'user' | 'bot';
  text: string;
}

const BOT_REPLIES = [
  "Great question! Focus on controlling the center with pawns first.",
  "Remember: Knights are best placed in the center. Avoid edges!",
  "Tip: Always look for forcing moves — checks, captures, threats.",
  "In the endgame, activate your king! It becomes a powerful piece.",
  "Study classic games by Fischer and Kasparov to improve rapidly.",
];

function ChatBotPanel({ onClose }: { onClose: () => void }) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'bot', text: 'வணக்கம்! 👋 I am Mantri, your AI chess coach. How can I help you today?' },
  ]);
  const [input, setInput] = useState('');

  function sendMessage() {
    if (!input.trim()) return;
    const userMsg: ChatMessage = { role: 'user', text: input.trim() };
    const botMsg: ChatMessage = {
      role: 'bot',
      text: BOT_REPLIES[Math.floor(Math.random() * BOT_REPLIES.length)],
    };
    setMessages(m => [...m, userMsg, botMsg]);
    setInput('');
  }

  return (
    <div className="fixed bottom-20 lg:bottom-8 right-4 z-[60] w-80 flex flex-col rounded-2xl border border-gold/40 shadow-2xl overflow-hidden animate-slideUp"
      style={{ background: 'var(--navy)', maxHeight: '420px' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-divider bg-navy-mid">
        <div className="flex items-center gap-2">
          <span className="text-lg">🤖</span>
          <div>
            <p className="text-white text-sm font-bold">Mantri AI Coach</p>
            <p className="text-green-400 text-[10px] flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" /> Online
            </p>
          </div>
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-white text-lg transition-colors">✕</button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2" style={{ maxHeight: '280px' }}>
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] px-3 py-2 rounded-xl text-xs leading-relaxed ${m.role === 'user'
                ? 'bg-gold text-navy font-semibold'
                : 'bg-navy-mid text-gray-200 border border-divider'
              }`}>
              {m.text}
            </div>
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="px-3 py-2 border-t border-divider flex items-center gap-2">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && sendMessage()}
          placeholder="Ask a chess question…"
          className="flex-1 bg-dark-bg border border-divider rounded-full px-3 py-1.5 text-white text-xs placeholder-gray-500 focus:outline-none focus:border-gold transition-colors"
        />
        <button
          onClick={sendMessage}
          className="w-8 h-8 rounded-full bg-gold flex items-center justify-center text-navy text-sm font-bold hover:bg-gold-light transition-colors active:scale-90"
        >
          →
        </button>
      </div>
    </div>
  );
}

export default function ChatBot() {
  const [showChat, setShowChat] = useState(false);

  return (
    <>
      {showChat && <ChatBotPanel onClose={() => setShowChat(false)} />}
      <button
        onClick={() => setShowChat(c => !c)}
        className="fixed bottom-24 lg:bottom-8 right-4 z-[55] w-14 h-14 rounded-full bg-gold shadow-lg flex items-center justify-center text-navy text-2xl hover:bg-gold-light transition-all active:scale-90 animate-glowPulse border-[3px] border-dark-bg"
        title="Ask Mantri AI Coach"
      >
        🤖
      </button>
    </>
  );
}
