// SIGARAM64 — Student Layout (Composition)
// Assembles sidebar, top bar, bottom nav, and chatbot
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../navigation/Sidebar';
import StudentTopBar from '../navigation/StudentTopBar';
import StudentBottomNav from '../navigation/StudentBottomNav';
import ChatBot from '../navigation/ChatBot';

export default function StudentLayout() {
  const location = useLocation();
  const isQuizRoute = location.pathname === '/assessment';

  return (
    <div className={`${isQuizRoute ? 'h-screen overflow-hidden' : 'min-h-screen pb-20 md:pb-0'} bg-dark-bg flex flex-col md:flex-row`}>

      {/* ── Desktop Sidebar (Hidden on Mobile and during Quiz) ── */}
      {!isQuizRoute && <Sidebar />}

      {/* ── Main Content Area (Full screen during Quiz) ── */}
      <div className={`flex-1 flex flex-col ${isQuizRoute ? 'h-screen overflow-hidden' : 'min-h-screen md:ml-64'}`}>


        {/* ── Sticky top bar + dropdown ── */}
        <StudentTopBar />

        {/* ── Page content ── */}
        <div className={`flex-1 animate-fadeIn ${isQuizRoute ? 'pb-0 overflow-hidden flex flex-col' : 'pb-6'}`}>
          <Outlet />
        </div>

      </div>

      {/* ── ChatBot floating button (Hidden during Quiz) ── */}
      {!isQuizRoute && <ChatBot />}

      {/* ── Bottom navigation (Mobile Only and Hidden during Quiz) ── */}
      {!isQuizRoute && <StudentBottomNav />}
    </div>
  );
}
