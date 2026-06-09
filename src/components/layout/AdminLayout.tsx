// SIGARAM64 — Admin/Manager Layout (Composition)
// Assembles sidebar and top bar
import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../navigation/Sidebar';
import AdminTopBar from '../navigation/AdminTopBar';
import AdminBottomNav from '../navigation/AdminBottomNav';
import ChatBot from '../navigation/ChatBot';

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [district, setDistrict] = useState('All Districts');

  return (
    <div className="min-h-screen bg-dark-bg flex flex-col lg:flex-row font-sans">

      {/* ── Sidebar ── */}
      <Sidebar isOpen={sidebarOpen} />

      {/* ── Main area ── */}
      <div className={`flex-1 flex flex-col min-h-screen ${sidebarOpen ? 'lg:ml-64' : ''} pb-20 lg:pb-0`}>

        {/* ── Top navbar (fixed at top) ── */}
        <AdminTopBar
          district={district}
          onDistrictChange={setDistrict}
          onToggleSidebar={() => setSidebarOpen(o => !o)}
        />

        {/* ── Page content ── */}
        <div className="flex-1 animate-fadeIn pb-6">
          <Outlet context={{ district }} />
        </div>
      </div>

      {/* ── ChatBot floating button ── */}
      <ChatBot />

      {/* ── Bottom navigation (Mobile Only) ── */}
      <AdminBottomNav />
    </div>
  );
}


