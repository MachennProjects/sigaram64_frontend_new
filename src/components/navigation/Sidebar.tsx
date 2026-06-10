// Unified Desktop Sidebar for all roles (Admin, Manager, Student)
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ADMIN_NAV, MANAGER_NAV, STUDENT_NAV_TABS } from '../navigation/navConfig';

interface SidebarProps {
  isOpen?: boolean;
}

export default function Sidebar({ isOpen = true }: SidebarProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  if (!isOpen) return null;

  const role = user?.role;
  const isStudent = role === 'student';
  const isAdmin = role === 'admin';
  const isManager = role === 'manager';

  // Determine Brand Header subtext
  const subBrand = isStudent
    ? 'Student Portal'
    : isAdmin
      ? 'Admin Panel'
      : 'Coach Portal';

  // Unified active/inactive styling
  const activeClass = 'bg-gold/10 text-gold border border-gold/30 font-semibold';
  const inactiveClass = 'text-gray-400 border border-transparent hover:bg-navy-mid hover:text-white';

  // Helper to render a navigation button
  const renderNavButton = (item: { icon: string; label: string; path: string }) => {
    const isActive = location.pathname === item.path;
    return (
      <button
        key={item.path}
        onClick={() => navigate(item.path)}
        className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all active:scale-95 text-left ${isActive ? activeClass : inactiveClass
          }`}
      >
        <span className="text-xl">{item.icon}</span>
        <span className="text-sm">{item.label}</span>
      </button>
    );
  };

  return (
    <div className="hidden md:flex fixed top-0 left-0 bottom-0 w-64 bg-navy border-r border-divider flex-col overflow-y-auto z-50">
      {/* Brand */}
      <div className="px-5 py-5 border-b border-divider mb-4">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-gold text-xl">♛</span>
          <span className="text-gold font-bold tracking-wide">SIGARAM64</span>
        </div>
        <p className="text-gray-500 text-xs ml-7">{subBrand}</p>
      </div>

      {/* Nav links */}
      <nav className="flex-1 px-3 py-1 space-y-1">
        {/* If Admin / Manager portal view */}
        {!isStudent && (
          <div className="space-y-1">
            <p className="text-gray-600 text-[10px] font-semibold uppercase tracking-widest px-3 pb-1">
              {isAdmin ? 'Admin' : 'Coach'}
            </p>
            {(isAdmin ? ADMIN_NAV.slice(0, 4) : MANAGER_NAV).map(renderNavButton)}
          </div>
        )}

        {/* Student links view */}
        <div className={!isStudent ? 'pt-4 space-y-1' : 'space-y-1'}>
          {!isStudent && (
            <p className="text-gray-600 text-[10px] font-semibold uppercase tracking-widest px-3 pb-1">
              Student View
            </p>
          )}
          {STUDENT_NAV_TABS.map(renderNavButton)}
        </div>
      </nav>

      {/* Desktop Sidebar Profile Footer */}
      <div
        className="px-4 py-4 border-t border-divider bg-navy-mid mt-auto cursor-pointer hover:bg-navy transition-colors"
        onClick={() => navigate('/profile')}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gold flex items-center justify-center">
            <span className="text-navy font-bold text-lg">
              {user?.avatar ?? user?.name?.[0] ?? (isAdmin ? 'A' : isManager ? 'C' : 'S')}
            </span>
          </div>
          <div className="flex-1 text-left">
            <p className="text-white text-sm font-semibold truncate">{user?.name}</p>
            {/* <p className="text-gray-400 text-[10px]">
              {isStudent ? `Elo ${user?.elo ?? '—'}` : isAdmin ? 'Admin' : 'Coach'}
            </p> */}
            <p className="text-gray-400 text-[10px]">
              {isStudent ? `Student` : isAdmin ? 'Admin' : 'Coach'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
