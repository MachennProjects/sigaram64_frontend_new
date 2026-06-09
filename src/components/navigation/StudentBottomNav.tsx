// Student Mobile Bottom Navigation
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { STUDENT_NAV_TABS } from '../navigation/navConfig';

export default function StudentBottomNav() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-navy border-t border-divider flex justify-around py-2 z-50">
      {STUDENT_NAV_TABS.map(tab => {
        const isActive = location.pathname === tab.path;
        return (
          <button
            key={tab.path}
            onClick={() => navigate(tab.path)}
            className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-xl transition-all active:scale-90 ${isActive ? 'text-gold' : 'text-gray-500'
              }`}
          >
            <span className={`text-xl transition-transform ${isActive ? 'scale-110' : ''}`}>{tab.icon}</span>
            <span className={`text-[9px] font-semibold ${isActive ? 'text-gold' : 'text-gray-500'}`}>
              {tab.label}
            </span>
            {isActive && <span className="w-4 h-0.5 rounded-full bg-gold" />}
          </button>
        );
      })}
    </div>
  );
}
