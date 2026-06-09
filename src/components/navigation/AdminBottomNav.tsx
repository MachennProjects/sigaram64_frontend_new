// Admin/Manager Mobile Bottom Navigation — Swipeable two-panel design
// Panel 1 (default): Admin/Manager nav items + student icon handle on right
// Panel 2 (swipe left): Student nav items + admin/manager icon handle on left
import React, { useState, useRef, useCallback, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ADMIN_BOTTOM_NAV, MANAGER_BOTTOM_NAV, STUDENT_NAV_TABS } from '../navigation/navConfig';
import type { NavItem } from '../navigation/navConfig';
import { useAuth } from '../../context/AuthContext';

// Paths that belong to the student panel
const STUDENT_PATHS = new Set(STUDENT_NAV_TABS.map(t => t.path));

export default function AdminBottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const isAdmin = user?.role === 'admin';
  const primaryHome = isAdmin ? '/admin' : '/district-activity';
  const primaryBottomNav = isAdmin ? ADMIN_BOTTOM_NAV : MANAGER_BOTTOM_NAV;
  const primaryLabel = isAdmin ? 'admin' : 'coach';
  const primaryIcon = isAdmin ? '🖥️' : '📍';

  // Auto-detect active panel from current route
  const derivedPanel = useMemo<'primary' | 'student'>(
    () => STUDENT_PATHS.has(location.pathname) ? 'student' : 'primary',
    [location.pathname]
  );
  const [panelOverride, setPanelOverride] = useState<'primary' | 'student' | null>(null);
  const activePanel = panelOverride ?? derivedPanel;

  // Reset override when route changes (so panel syncs with page)
  const lastPathRef = useRef(location.pathname);
  if (lastPathRef.current !== location.pathname) {
    lastPathRef.current = location.pathname;
    if (panelOverride !== null) setPanelOverride(null);
  }

  const [dragOffset, setDragOffset] = useState(0);
  const touchStartX = useRef(0);
  const isDragging = useRef(false);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    isDragging.current = true;
    setDragOffset(0);
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isDragging.current) return;
    const diff = e.touches[0].clientX - touchStartX.current;

    // Limit drag based on current panel
    if (activePanel === 'primary') {
      // Only allow dragging left (negative), clamp to 0...-screenWidth
      setDragOffset(Math.max(Math.min(diff, 0), -window.innerWidth));
    } else {
      // Only allow dragging right (positive), clamp to 0...screenWidth
      setDragOffset(Math.min(Math.max(diff, 0), window.innerWidth));
    }
  }, [activePanel]);

  const handleTouchEnd = useCallback(() => {
    isDragging.current = false;
    const threshold = window.innerWidth * 0.25;

    if (activePanel === 'primary' && dragOffset < -threshold) {
      setPanelOverride('student');
      navigate('/dashboard');
    } else if (activePanel === 'student' && dragOffset > threshold) {
      setPanelOverride('primary');
      navigate(primaryHome);
    }
    setDragOffset(0);
  }, [activePanel, dragOffset, navigate, primaryHome]);

  // Calculate the translate value
  // Container is 200% wide, so each panel = 50% of container width
  const baseTranslate = activePanel === 'primary' ? 0 : -50;
  const dragPercent = (dragOffset / window.innerWidth) * 50;

  const renderNavItems = (items: NavItem[]) =>
    items.map(tab => {
      const isActive = location.pathname === tab.path;
      return (
        <button
          key={tab.path}
          onClick={() => navigate(tab.path)}
          className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-xl transition-all active:scale-90 ${
            isActive ? 'text-gold' : 'text-gray-500'
          }`}
        >
          <span className={`text-xl transition-transform ${isActive ? 'scale-110' : ''}`}>
            {tab.icon}
          </span>
          <span className={`text-[9px] font-semibold ${isActive ? 'text-gold' : 'text-gray-500'}`}>
            {tab.label}
          </span>
          {isActive && <span className="w-4 h-0.5 rounded-full bg-gold" />}
        </button>
      );
    });

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50">
      {/* Swipeable container */}
      <div
        className="overflow-hidden bg-navy border-t-2 border-gold"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div
          className="flex w-[200%]"
          style={{
            transform: `translateX(${baseTranslate + dragPercent}%)`,
            transition: isDragging.current ? 'none' : 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        >
          {/* ── Panel 1: Primary items ── */}
          <div className="w-1/2 flex items-center py-2 px-1">
            <div className="flex-1 flex justify-around">
              {renderNavItems(primaryBottomNav)}
            </div>
            {/* Drag handle → swipe to student */}
            <button
              onClick={() => { setPanelOverride('student'); navigate('/dashboard'); }}
              className="flex flex-col items-center gap-0.5 px-2 py-1 text-gray-600 animate-pulse"
              aria-label="Swipe for student view"
            >
              <span className="text-base">🎓</span>
              <span className="text-[8px] text-gray-600">›</span>
            </button>
          </div>

          {/* ── Panel 2: Student items ── */}
          <div className="w-1/2 flex items-center py-2 px-1">
            {/* Drag handle → swipe to primary */}
            <button
              onClick={() => { setPanelOverride('primary'); navigate(primaryHome); }}
              className="flex flex-col items-center gap-0.5 px-2 py-1 text-gray-600 animate-pulse"
              aria-label={`Swipe for ${primaryLabel} view`}
            >
              <span className="text-base">{primaryIcon}</span>
              <span className="text-[8px] text-gray-600">‹</span>
            </button>
            <div className="flex-1 flex justify-around">
              {renderNavItems(STUDENT_NAV_TABS)}
            </div>
          </div>
        </div>

        {/* Panel indicator dots */}
        <div className="flex justify-center gap-1.5 pb-1.5">
          <span
            className={`w-1.5 h-1.5 rounded-full transition-colors ${
              activePanel === 'primary' ? 'bg-gold' : 'bg-gray-700'
            }`}
          />
          <span
            className={`w-1.5 h-1.5 rounded-full transition-colors ${
              activePanel === 'student' ? 'bg-gold' : 'bg-gray-700'
            }`}
          />
        </div>
      </div>
    </div>
  );
}

