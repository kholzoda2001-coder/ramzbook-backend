'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  BookOpen,
  Settings,
  ShieldCheck,
  LogOut,
  ChevronRight,
  X,
  Radio,
  Key,
} from 'lucide-react';

const navItems = [
  { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { label: 'Users', href: '/admin/users', icon: Users },
  { label: 'E-books', href: '/admin/products', icon: BookOpen },
  { label: 'OTP Settings', href: '/admin/otp-settings', icon: Radio },
  { label: 'Login Settings', href: '/admin/login-settings', icon: Key },
  { label: 'Settings', href: '/admin/settings', icon: Settings },
];

interface SidebarProps {
  onClose: () => void;
  staticMode?: boolean;
}

export default function AdminSidebar({ onClose, staticMode }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      style={{
        width: '100%', height: '100%', display: 'flex', flexDirection: 'column',
        background: 'var(--bg-surface)', borderRight: '1px solid var(--bg-border)', overflow: 'hidden',
      }}
    >
      {/* Brand */}
      <div style={{ padding: '28px 20px 20px', borderBottom: '1px solid var(--bg-border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '11px' }}>
            <div style={{
              width: 38, height: 38, borderRadius: '10px',
              background: 'linear-gradient(135deg, var(--accent-from), var(--accent-to))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 16px var(--accent-glow)', flexShrink: 0,
            }}>
              <ShieldCheck size={18} color="#fff" />
            </div>
            <div>
              <p style={{
                fontWeight: 700, fontSize: '15px',
                background: 'linear-gradient(135deg, var(--accent-from), var(--accent-to))',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
              }}>
                Ramz Admin
              </p>
              <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Super-App v1.0</p>
            </div>
          </div>

          {!staticMode && (
            <button
              onClick={onClose}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                width: 32, height: 32, borderRadius: 8,
                border: '1px solid var(--bg-border)', background: 'var(--bg-elevated)',
                color: 'var(--text-muted)', cursor: 'pointer',
              }}
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: '16px 12px', overflowY: 'auto' }}>
        <p style={{
          fontSize: '10px', fontWeight: 600, letterSpacing: '0.08em',
          color: 'var(--text-muted)', padding: '0 4px', marginBottom: '8px',
          textTransform: 'uppercase',
        }}>
          Main Menu
        </p>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.href === '/admin'
              ? pathname === '/admin'
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={staticMode ? undefined : onClose}
              className={`sidebar-nav-item ${isActive ? 'active' : ''}`}
            >
              <Icon size={17} />
              <span style={{ flex: 1 }}>{item.label}</span>
              {isActive && <ChevronRight size={14} style={{ opacity: 0.6 }} />}
            </Link>
          );
        })}
      </nav>

      {/* Bottom user card */}
      <div style={{ padding: '12px', borderTop: '1px solid var(--bg-border)' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: '10px',
          padding: '10px 12px', borderRadius: '10px',
          background: 'var(--bg-elevated)', marginBottom: '8px',
        }}>
          <div style={{
            width: 32, height: 32, borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--accent-from), var(--accent-to))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '13px', fontWeight: 700, color: '#fff', flexShrink: 0,
          }}>
            A
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              Admin User
            </p>
            <p style={{ fontSize: '11px', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              admin@ramz.tj
            </p>
          </div>
        </div>

        <Link
          href="/"
          style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            padding: '9px 12px', borderRadius: '8px',
            color: 'var(--text-muted)', fontSize: '13px', fontWeight: 500,
            textDecoration: 'none', transition: 'color 0.15s ease, background 0.15s ease',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--red)'; e.currentTarget.style.background = 'rgba(239,68,68,0.08)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.background = 'transparent'; }}
        >
          <LogOut size={15} />
          Sign Out
        </Link>
      </div>
    </aside>
  );
}
