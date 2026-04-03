'use client';

import {
  Users, DollarSign, CreditCard, BookOpen,
  TrendingUp, TrendingDown, ArrowUpRight, Activity,
} from 'lucide-react';

const stats = [
  { label: 'Total Users',           value: '—',    change: 'Live',      trend: 'up',   icon: Users,      color: '#6366f1', glow: 'rgba(99,102,241,0.2)',   delay: 'delay-1' },
  { label: 'Monthly Revenue',       value: '—',    change: 'Coming',    trend: 'up',   icon: DollarSign, color: '#10b981', glow: 'rgba(16,185,129,0.2)',   delay: 'delay-2' },
  { label: 'Active Subscriptions',  value: '—',    change: 'Coming',    trend: 'up',   icon: CreditCard, color: '#8b5cf6', glow: 'rgba(139,92,246,0.2)',   delay: 'delay-3' },
  { label: 'Published E-books',     value: '—',    change: 'Live',      trend: 'up',   icon: BookOpen,   color: '#f59e0b', glow: 'rgba(245,158,11,0.2)',   delay: 'delay-4' },
];

const recentActivity = [
  { event: 'New user registered',   user: 'test@ramzbook.tj',             time: 'Just now',   type: 'user'     },
  { event: 'Database connected',    user: 'Hostinger MySQL · Live',       time: '—',          type: 'system'   },
  { event: 'Admin panel loaded',    user: 'Next.js 14 · Tailwind CSS',    time: 'Now',        type: 'system'   },
  { event: 'Prisma schema synced',  user: '12 tables · MySQL',            time: 'Earlier',    type: 'system'   },
];

const activityColor: Record<string, string> = {
  user: '#6366f1', system: '#10b981', purchase: '#10b981', subscription: '#3b82f6', book: '#f59e0b',
};

const topBooks = [
  { title: 'Connect your first real e-book', sales: 0,   revenue: '—' },
  { title: 'Add book content via the form',  sales: 0,   revenue: '—' },
  { title: 'Manage users from Users tab',    sales: 0,   revenue: '—' },
];

export default function AdminDashboardPage() {
  return (
    <div>
      <div className="fade-up" style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '26px', fontWeight: 700, color: 'var(--text-primary)' }}>Dashboard</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '4px' }}>
          Welcome back, Admin. Here&apos;s what&apos;s happening today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-7">
        {stats.map((stat) => {
          const Icon = stat.icon;
          const isUp = stat.trend === 'up';
          return (
            <div key={stat.label} className={`stat-card fade-up ${stat.delay}`}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                <div style={{ width: 44, height: 44, borderRadius: '12px', background: stat.glow, border: `1px solid ${stat.color}33`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon size={20} color={stat.color} />
                </div>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', fontSize: '12px', fontWeight: 600, color: isUp ? 'var(--green)' : 'var(--red)', background: isUp ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', padding: '3px 9px', borderRadius: '99px' }}>
                  {isUp ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                  {stat.change}
                </span>
              </div>
              <p style={{ fontSize: '28px', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.5px', marginBottom: '4px' }}>
                {stat.value}
              </p>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{stat.label}</p>
            </div>
          );
        })}
      </div>

      {/* Bottom 2-col grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Recent Activity */}
        <div className="glass-card fade-up delay-2 p-6">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)' }}>Recent Activity</h2>
            <Activity size={15} color="var(--text-muted)" />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {recentActivity.map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', borderRadius: '10px', background: 'var(--bg-elevated)', border: '1px solid var(--bg-border)' }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: activityColor[item.type], flexShrink: 0, boxShadow: `0 0 6px ${activityColor[item.type]}` }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)', marginBottom: '2px' }}>{item.event}</p>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.user}</p>
                </div>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', flexShrink: 0 }}>{item.time}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Selling E-books */}
        <div className="glass-card fade-up delay-3 p-6">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)' }}>Top Selling E-books</h2>
            <ArrowUpRight size={15} color="var(--text-muted)" />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {topBooks.map((book, i) => (
              <div
                key={i}
                style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '12px 10px', borderRadius: '9px', transition: 'background 0.15s ease', cursor: 'default' }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-elevated)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                <span style={{ width: 24, height: 24, borderRadius: '6px', background: i === 0 ? 'linear-gradient(135deg,#f59e0b,#ef4444)' : i === 1 ? 'linear-gradient(135deg,#94a3b8,#cbd5e1)' : i === 2 ? 'linear-gradient(135deg,#b45309,#d97706)' : 'var(--bg-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 700, color: i <= 2 ? '#fff' : 'var(--text-muted)', flexShrink: 0 }}>
                  {i + 1}
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{book.title}</p>
                  <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{book.sales} sales</p>
                </div>
                <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--green)', flexShrink: 0 }}>{book.revenue}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
