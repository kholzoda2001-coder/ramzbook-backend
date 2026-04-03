'use client';

import { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import AdminHeader from './AdminHeader';

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  useEffect(() => {
    if (!isMobile) setSidebarOpen(false);
  }, [isMobile]);

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: 'var(--bg-base)' }}>
      {/* Desktop Sidebar */}
      {!isMobile && (
        <div style={{ width: 260, flexShrink: 0, display: 'flex', flexDirection: 'column', height: '100%' }}>
          <Sidebar onClose={() => {}} staticMode />
        </div>
      )}

      {/* Mobile Sidebar Overlay */}
      {isMobile && (
        <>
          <div
            onClick={() => setSidebarOpen(false)}
            style={{
              position: 'fixed', inset: 0, zIndex: 40,
              background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)',
              opacity: sidebarOpen ? 1 : 0,
              pointerEvents: sidebarOpen ? 'auto' : 'none',
              transition: 'opacity 0.3s ease',
            }}
          />
          <div
            style={{
              position: 'fixed', top: 0, left: 0, bottom: 0, zIndex: 50, width: 260,
              transform: sidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
              transition: 'transform 0.3s ease',
            }}
          >
            <Sidebar onClose={() => setSidebarOpen(false)} />
          </div>
        </>
      )}

      {/* Main Content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
        <AdminHeader onMenuClick={() => setSidebarOpen(true)} />
        <main style={{ flex: 1, overflowY: 'auto', background: 'var(--bg-base)', transition: 'background 0.3s', padding: '28px' }}>
          {children}
        </main>
      </div>
    </div>
  );
}
