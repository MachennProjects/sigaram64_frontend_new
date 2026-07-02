// ─── Shared UI Components — SIGARAM64 Design System ───
import logoIcon from '../../assets/Logo/sigaram64_icon_transparent_512.png';

export const Crown = ({ size = 24, className = "" }) => (
  <img src={logoIcon} alt="Crown Logo" style={{ height: size, width: size }} className={`object-contain ${className}`} />
);

export const GoldBar = () => (
  <div className="w-full h-[3px] bg-gold" />
);

export const Badge = ({ children, variant = "gold" }: { children: React.ReactNode; variant?: "gold"|"green"|"gray"|"coming" }) => {
  const styles = {
    gold:    "bg-navy-mid text-gold-light border border-gold/30",
    green:   "bg-green-900/40 text-green-400 border border-green-700/40",
    gray:    "bg-navy-mid text-gray-400",
    coming:  "bg-navy-mid text-gold-light",
  };
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${styles[variant]}`}>
      {children}
    </span>
  );
};

export const StatCard = ({ number, label }: { number: string; label: string }) => (
  <div className="bg-card-bg rounded-xl p-4 border border-divider">
    <div className="text-gold text-3xl font-bold">{number}</div>
    <div className="text-gray-400 text-sm mt-1">{label}</div>
  </div>
);

export const NavBar = ({ onMenuClick }: { onMenuClick?: () => void }) => (
  <nav className="w-full bg-navy border-b-2 border-gold px-8 py-4 flex items-center justify-between fixed top-0 z-50">
    <div className="flex items-center gap-2">
      <Crown size={22} />
      <span className="text-gold text-xl font-bold tracking-wide">SIGARAM64</span>
    </div>
    <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-300">
      {["Features","Assessment","For Schools","Districts","Blog"].map(l => (
        <a key={l} href="#" className="hover:text-gold transition-colors">{l}</a>
      ))}
    </div>
    <div className="flex items-center gap-3">
      <span className="text-xs font-medium text-gold bg-navy-mid border border-gold/30 px-3 py-1 rounded-full">EN | தமிழ்</span>
      <a href="#" className="text-sm text-gray-300 hover:text-white">Login</a>
      <button className="btn-gold text-sm px-4 py-2">Start Free</button>
    </div>
  </nav>
);

export const MobileNavBar = () => (
  <div className="fixed bottom-0 left-0 right-0 bg-navy border-t border-divider flex justify-around py-2 z-50 md:hidden">
    {[
      { icon:"🏠", label:"Home" },
      { icon:"♟", label:"Puzzles" },
      { icon:"📊", label:"Analyze" },
      { icon:"📚", label:"Learn" },
      { icon:"👤", label:"Profile" },
    ].map(tab => (
      <button key={tab.label} className="flex flex-col items-center gap-1 px-3 py-1">
        <span className="text-xl">{tab.icon}</span>
        <span className="text-[10px] text-gray-400">{tab.label}</span>
      </button>
    ))}
  </div>
);

export const FeatureCard = ({
  icon, title, desc, tag, comingSoon = false
}: {
  icon: string; title: string; desc: string; tag?: string; comingSoon?: boolean;
}) => (
  <div className="card relative p-6 hover:border-gold/40 transition-colors">
    <div className="gold-top-accent" />
    {comingSoon && (
      <div className="absolute top-4 right-4">
        <Badge variant="coming">Coming Soon</Badge>
      </div>
    )}
    {tag && !comingSoon && (
      <Badge variant="gold" >{tag}</Badge>
    )}
    <div className="text-3xl mt-3 mb-4">{icon}</div>
    <h3 className="text-white text-lg font-semibold mb-2">{title}</h3>
    <p className="text-gray-400 text-sm leading-relaxed">{desc}</p>
  </div>
);

export const SectionHeader = ({ title, sub, centered = false }: { title: string; sub?: string; centered?: boolean }) => (
  <div className={centered ? "text-center" : ""}>
    <h2 className="section-title">{title}</h2>
    {sub && <p className="section-sub">{sub}</p>}
  </div>
);
