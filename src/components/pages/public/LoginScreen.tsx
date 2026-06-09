// Screen 02 — Login (Email + Password for Student / Admin / Manager)
// Now wired to real Firebase Auth via useAuth()
import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import { DEMO_ACCOUNTS } from "../../../data/users";

export default function LoginScreen() {
  const navigate      = useNavigate();
  const location      = useLocation();
  const { login }     = useAuth();

  const [lang, setLang]         = useState<"en" | "ta">("en");
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw]     = useState(false);
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);

  const from = (location.state as any)?.from?.pathname ?? "/home";

  // ── i18n ───────────────────────────────────────────────────────────────────
  const labels = {
    en: {
      title:   "Sign In to Sigaram64",
      sub:     "India's First AI Chess Platform",
      email:   "Email Address",
      emailPh: "you@sigaram64.com",
      pw:      "Password",
      login:   "Login",
      forgot:  "Forgot Password?",
      newHere: "New here?",
      start:   "Start Free Assessment",
    },
    ta: {
      title:   "சிகரம்64-ல் உள்நுழையவும்",
      sub:     "தமிழகத்தின் முதல் AI சதுரங்கக் கல்விதளம்",
      email:   "மின்னஞ்சல் முகவரி",
      emailPh: "you@sigaram64.com",
      pw:      "கடவுச்சொல்",
      login:   "உள்நுழைக",
      forgot:  "கடவுச்சொல் மறந்துவிட்டதா?",
      newHere: "புதியவரா?",
      start:   "இலவச மதிப்பீட்டை தொடங்கு",
    },
  };
  const t = labels[lang];

  // ── Submit ─────────────────────────────────────────────────────────────────
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password) {
      setError("Please enter your email and password.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      await login(email.trim(), password);
      // onAuthStateChanged in AuthContext resolves role → RoleRedirect at /home
      navigate(from, { replace: true });
    } catch (err: any) {
      // Firebase error codes
      const code = err?.code ?? "";
      if (code === "auth/user-not-found" || code === "auth/wrong-password" || code === "auth/invalid-credential") {
        setError("Invalid email or password. Please try again.");
      } else if (code === "auth/too-many-requests") {
        setError("Too many attempts. Please wait a moment and try again.");
      } else if (code === "auth/user-disabled") {
        setError("This account has been disabled. Contact your admin.");
      } else {
        setError("Login failed: " + (err?.message ?? "Unknown error"));
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="h-screen bg-dark-bg flex flex-row overflow-hidden">

      {/* ── LEFT PANEL (desktop only) ─────────────────────────── */}
      <div className="hidden lg:flex w-5/12 xl:w-[42%] flex-shrink-0 bg-navy border-r border-divider flex-col items-center justify-center p-6 xl:p-12 relative overflow-hidden">
        {/* Decorative chess-grid background */}
        <div className="absolute inset-0 opacity-5">
          <div className="grid grid-cols-8 h-full">
            {Array.from({ length: 64 }).map((_, i) => {
              const isDark = (Math.floor(i / 8) + i % 8) % 2 === 0;
              return <div key={i} className={isDark ? "bg-white" : ""} />;
            })}
          </div>
        </div>

        {/* Gold accent line */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-gold via-gold-light to-gold" />

        {/* Logo */}
        <div className="flex items-center gap-2 mb-6 xl:mb-10">
          <span className="text-gold text-3xl">♛</span>
          <span className="text-gold font-bold text-xl tracking-widest">SIGARAM64</span>
        </div>

        {/* Chess board visual */}
        <div
          className="grid grid-cols-8 rounded-xl overflow-hidden border-2 border-navy-mid shadow-2xl mb-6 xl:mb-10 flex-shrink-0"
          style={{ width: 'min(260px, 25vh)', height: 'min(260px, 25vh)' }}
        >
          {Array.from({ length: 64 }).map((_, i) => {
            const row = Math.floor(i / 8);
            const col = i % 8;
            const isDark = (row + col) % 2 === 0;
            const pieces: Record<string, string> = {
              "00": "♜", "01": "♞", "02": "♝", "03": "♛", "04": "♚", "05": "♝", "06": "♞", "07": "♜",
              "10": "♟", "11": "♟", "12": "♟", "13": "♟", "14": "♟", "15": "♟", "16": "♟", "17": "♟",
              "60": "♙", "61": "♙", "62": "♙", "63": "♙", "64": "♙", "65": "♙", "66": "♙", "67": "♙",
              "70": "♖", "71": "♘", "72": "♗", "73": "♕", "74": "♔", "75": "♗", "76": "♘", "77": "♖",
            };
            const piece = pieces[`${row}${col}`];
            const isBlack = piece && ["♜","♞","♝","♛","♚","♟"].includes(piece);
            return (
              <div
                key={i}
                className={`flex items-center justify-center text-xs select-none aspect-square
                  ${isDark ? "bg-[#4A6082]" : "bg-[#CBA98F]"}`}
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

        {/* Tagline */}
        <h2 className="text-white text-xl xl:text-2xl font-bold text-center leading-snug mb-2">
          India's First<br />
          <span className="text-gold">AI Chess Platform</span>
        </h2>
        <p className="text-gray-400 text-center text-xs xl:text-sm mb-1">
          Serving 1,048+ students across Tamil Nadu
        </p>
        <p className="text-gold-light text-center text-xs xl:text-sm tamil">
          FIDE சான்றிதழ் பெற்ற தளம்
        </p>

        {/* Stat pills */}
        <div className="flex gap-2 mt-5 xl:mt-8">
          {[{v:"1,048+",l:"Students"},{v:"10+",l:"Districts"},{v:"FIDE",l:"Certified"}].map(s => (
            <div key={s.l} className="text-center bg-navy-mid border border-divider rounded-xl px-3 py-1.5">
              <p className="text-gold font-bold text-xs xl:text-sm">{s.v}</p>
              <p className="text-gray-500 text-[10px]">{s.l}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── RIGHT PANEL (form) ────────────────────────────────── */}
      <div className="flex-1 flex flex-col h-full overflow-y-auto">

        {/* Top bar */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3">
          <div className="flex items-center gap-2 lg:hidden">
            <span className="text-gold text-xl">♛</span>
            <span className="text-gold font-bold text-lg tracking-wide">SIGARAM64</span>
          </div>
          <div className="hidden lg:block" />
          <button
            onClick={() => setLang(l => l === "en" ? "ta" : "en")}
            className="text-xs font-semibold text-gold bg-navy-mid border border-gold/30 px-3 py-1.5 rounded-full transition-all active:scale-95"
          >
            {lang === "en" ? "தமிழ்" : "EN"}
          </button>
        </div>

        {/* Form area */}
        <div className="flex-1 flex items-center justify-center px-5 py-2">
          <div className="w-full max-w-sm animate-fadeIn">

            {/* Header */}
            <div className="text-center mb-6">
              <div className="w-12 h-12 rounded-xl bg-navy-mid border border-gold/30 flex items-center justify-center mx-auto mb-2 shadow-md">
                <span className="text-2xl">♛</span>
              </div>
              <h1 className="text-xl font-bold text-white mb-1">{t.title}</h1>
              <p className={`text-gray-400 text-xs ${lang === "ta" ? "tamil" : ""}`}>{t.sub}</p>
            </div>

            {/* Email + Password form */}
            <form onSubmit={handleSubmit}>

              {/* Email */}
              <div className="mb-3">
                <label className="block text-[11px] text-gray-400 mb-1.5">
                  {t.email}
                </label>
                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={e => { setEmail(e.target.value); setError(""); }}
                  placeholder={t.emailPh}
                  className="input-field text-sm py-2.5"
                  autoComplete="email"
                  autoFocus
                />
              </div>

              {/* Password */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[11px] text-gray-400">{t.pw}</label>
                  <button
                    type="button"
                    className="text-gold text-[11px] font-medium hover:underline"
                  >
                    {t.forgot}
                  </button>
                </div>
                <div className="relative">
                  <input
                    id="login-password"
                    type={showPw ? "text" : "password"}
                    value={password}
                    onChange={e => { setPassword(e.target.value); setError(""); }}
                    placeholder="••••••••"
                    className="input-field pr-10 text-sm py-2.5"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(s => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gold transition-colors text-xs"
                  >
                    {showPw ? "🙈" : "👁"}
                  </button>
                </div>
              </div>

              {/* Role hint */}
              <div className="mb-4 text-center">
                <p className="text-[10px] text-gray-500">
                  Use your registered email or contact admin
                </p>
              </div>

              {/* Error */}
              {error && (
                <div className="mb-3 bg-red-900/30 border border-red-700/40 rounded-xl px-3 py-2 animate-fadeIn">
                  <p className="text-red-400 text-xs">⚠ {error}</p>
                </div>
              )}

              {/* Development Demo Logins */}
              {import.meta.env.DEV && (
                <div className="mb-3 flex flex-col gap-2">
                  {(["student", "admin", "manager"] as const).map(role => (
                    <button
                      key={role}
                      type="button"
                      onClick={() => {
                        setEmail(DEMO_ACCOUNTS[role].email);
                        setPassword(DEMO_ACCOUNTS[role].password);
                      }}
                      className="w-full text-xs bg-navy-mid border border-dashed border-gold/50 text-gold/80 py-2 rounded-xl hover:bg-gold/10 transition-colors"
                    >
                      Auto-fill Demo {role.charAt(0).toUpperCase() + role.slice(1)} ID
                    </button>
                  ))}
                </div>
              )}

              {/* Submit */}
              <button
                id="login-submit"
                type="submit"
                disabled={loading}
                className={`w-full btn-gold py-3 text-sm font-bold mb-3 ${loading ? "opacity-70 cursor-wait" : ""}`}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-navy border-t-transparent rounded-full animate-spin" />
                    {lang === "en" ? "Signing in…" : "உள்நுழைகிறது…"}
                  </span>
                ) : t.login}
              </button>
            </form>

            {/* New here */}
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-500">
                {t.newHere}{" "}
                <button
                  onClick={() => navigate("/assessment")}
                  className="text-gold font-semibold hover:underline"
                >
                  {t.start}
                </button>
              </p>
            </div>

            {/* Back to home */}
            <p className="text-center text-xs text-gray-600 mt-5">
              <button onClick={() => navigate("/")} className="hover:text-gray-400 transition-colors">
                ← {lang === "en" ? "Back to home" : "முகப்பிற்கு திரும்பு"}
              </button>
            </p>

          </div>
        </div>
      </div>
    </div>
  );
}
