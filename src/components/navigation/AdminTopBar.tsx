// Admin Top Navbar
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { DISTRICTS } from '../navigation/navConfig';
import { triggerPrint } from '../../services/exportService';

interface AdminTopBarProps {
  district?: string;
  onDistrictChange?: (value: string) => void;
  onToggleSidebar: () => void;
}

export default function AdminTopBar({ district, onDistrictChange, onToggleSidebar }: AdminTopBarProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  return (
    <>
      <nav className="flex items-center gap-3 px-4 py-3 bg-navy border-b-2 border-gold sticky top-0 z-50 flex-shrink-0">
        {/* Hamburger */}
        <button
          onClick={onToggleSidebar}
          className="text-gray-400 hover:text-white text-lg transition-colors p-1 rounded-lg hover:bg-navy-mid"
        >
          ☰
        </button>

        {/* Logo — mobile only */}
        <div className="flex items-center gap-1 lg:hidden">
          <span className="text-gold text-lg">♛</span>
          <span className="text-gold font-bold text-sm">SIGARAM64</span>
        </div>

        {/* District selector (Admin only) */}
        {user?.role === 'admin' && (
          <select
            value={district}
            onChange={e => onDistrictChange?.(e.target.value)}
            className="bg-navy-mid text-gray-300 border border-divider rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-gold transition-colors ml-auto"
          >
            {DISTRICTS.map(d => <option key={d}>{d}</option>)}
          </select>
        )}

        {/* Export + Avatar */}
        <div className={`${user?.role !== 'admin' ? 'ml-auto' : ''} flex items-center gap-3`}>
          <button onClick={triggerPrint} className="text-xs font-semibold text-gold bg-navy-mid border border-gold/30 px-3 py-1.5 rounded-full hover:bg-gold hover:text-navy transition-all active:scale-95">
            ⬇ Export PDF
          </button>

          <div className="relative">
            <button
              onClick={() => setShowProfileMenu(m => !m)}
              className="w-8 h-8 rounded-full bg-gold flex items-center justify-center active:scale-95 transition-transform"
            >
              <span className="text-navy font-bold text-sm">{user?.avatar ?? (user?.role === 'admin' ? 'A' : 'C')}</span>
            </button>

            {showProfileMenu && (
              <div
                className="absolute top-10 right-0 bg-navy-mid border border-divider rounded-2xl shadow-2xl p-2 min-w-[180px] z-50 animate-fadeIn"
                onClick={e => e.stopPropagation()}
              >
                <div className="px-4 py-3 border-b border-divider mb-1">
                  <p className="text-white text-sm font-semibold">{user?.name}</p>
                  <p className="text-gray-400 text-xs">{user?.district}</p>
                  <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-navy border border-gold/30 text-gold capitalize">{user?.role}</span>
                </div>
                <button
                  onClick={() => { logout(); navigate('/'); }}
                  className="w-full text-left px-4 py-2.5 text-red-400 text-sm hover:bg-navy hover:text-red-300 rounded-xl transition-colors"
                >
                  🚪 Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>


      {/* Mobile overlay to close profile menu */}
      {showProfileMenu && (
        <div className="fixed inset-0 z-40" onClick={() => setShowProfileMenu(false)} />
      )}
    </>
  );
}
