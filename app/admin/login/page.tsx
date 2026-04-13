'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

/* ──────────────────────────────────────────────
   Inline SVG icons (no external dependency)
   ────────────────────────────────────────────── */
function ShieldIcon() {
  return (
    <svg width="36" height="36" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <polyline points="9 12 11 14 15 10" />
    </svg>
  );
}
function MailIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  );
}
function LockIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}
function EyeIcon({ off }: { off?: boolean }) {
  return off ? (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  ) : (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}
function SpinnerIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
      style={{ animation: 'spin 0.75s linear infinite' }}>
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}
function ArrowRightIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
  );
}

/* ──────────────────────────────────────────────
   Main Component
   ────────────────────────────────────────────── */
export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const [mounted, setMounted]   = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError('Iltimos, email va parolni kiriting.');
      return;
    }
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email: email.trim(), password: password.trim() }),
      });

      let data: { success?: boolean; error?: string } = {};
      try {
        data = await res.json();
      } catch {
        // JSON parse failed — treat as network-level error
        setError('Server javobi noto\'g\'ri. Iltimos, qayta urinib ko\'ring.');
        return;
      }

      if (res.ok && data.success) {
        // Successful login → redirect to admin dashboard
        router.push('/admin');
        router.refresh();
      } else {
        setError(data.error ?? 'Noto\'g\'ri email yoki parol.');
      }
    } catch {
      setError('Server bilan ulanib bo\'lmadi. Internet aloqasini tekshiring.');
    } finally {
      setLoading(false);
    }
  };

  // Floating particles for visual richness
  const particles = [
    { top: '18%', left: '12%', size: 3, delay: 0 },
    { top: '72%', left: '85%', size: 2, delay: 1.5 },
    { top: '45%', left: '5%',  size: 4, delay: 0.8 },
    { top: '88%', left: '30%', size: 2, delay: 2.2 },
    { top: '10%', left: '70%', size: 3, delay: 1.0 },
    { top: '60%', left: '92%', size: 2, delay: 0.3 },
  ];

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      background: 'linear-gradient(135deg, #0a0c12 0%, #0f111a 40%, #16102a 100%)',
      fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
      position: 'relative',
      overflow: 'hidden',
    }}>

      {/* ── Animated background blobs ── */}
      <div style={{
        position: 'absolute', top: '-20%', left: '-15%',
        width: '60%', height: '65%', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(99,102,241,0.18) 0%, transparent 68%)',
        animation: 'blobFloat 9s ease-in-out infinite',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', bottom: '-15%', right: '-10%',
        width: '55%', height: '60%', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(139,92,246,0.15) 0%, transparent 68%)',
        animation: 'blobFloat 12s ease-in-out infinite reverse',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', top: '35%', right: '20%',
        width: '30%', height: '30%', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)',
        animation: 'blobFloat 7s ease-in-out infinite 3s',
        pointerEvents: 'none',
      }} />

      {/* ── Floating particles ── */}
      {mounted && particles.map((p, i) => (
        <div key={i} style={{
          position: 'absolute',
          top: p.top, left: p.left,
          width: p.size, height: p.size,
          borderRadius: '50%',
          background: 'rgba(99,102,241,0.5)',
          animation: `particleFloat ${4 + p.delay}s ease-in-out infinite ${p.delay}s`,
          pointerEvents: 'none',
        }} />
      ))}

      {/* ── Grid overlay ── */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage:
          'linear-gradient(rgba(99,102,241,0.04) 1px, transparent 1px),' +
          'linear-gradient(90deg, rgba(99,102,241,0.04) 1px, transparent 1px)',
        backgroundSize: '52px 52px',
        pointerEvents: 'none',
      }} />

      {/* ════════════════ Login Card ════════════════ */}
      <div
        className="login-card"
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '448px',
          background: 'rgba(15, 17, 26, 0.88)',
          backdropFilter: 'blur(28px)',
          WebkitBackdropFilter: 'blur(28px)',
          borderRadius: '28px',
          border: '1px solid rgba(99,102,241,0.22)',
          boxShadow:
            '0 40px 100px rgba(0,0,0,0.65),' +
            '0 0 0 1px rgba(255,255,255,0.03),' +
            'inset 0 1px 0 rgba(255,255,255,0.07)',
          overflow: 'hidden',
        }}
      >
        {/* Top gradient bar */}
        <div style={{
          height: '3px',
          background: 'linear-gradient(90deg, #6366f1, #8b5cf6, #a78bfa, #6366f1)',
          backgroundSize: '200% 100%',
          animation: 'gradientShift 3s linear infinite',
        }} />

        {/* ── Header ── */}
        <div style={{
          padding: '44px 44px 28px',
          textAlign: 'center',
          borderBottom: '1px solid rgba(99,102,241,0.1)',
        }}>
          {/* Shield icon */}
          <div
            className="login-float"
            style={{
              width: '76px', height: '76px',
              background: 'linear-gradient(135deg, rgba(99,102,241,0.22), rgba(139,92,246,0.22))',
              borderRadius: '22px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 22px',
              border: '1px solid rgba(99,102,241,0.35)',
              boxShadow: '0 0 40px rgba(99,102,241,0.28)',
              color: '#818cf8',
            }}
          >
            <ShieldIcon />
          </div>

          <h1 style={{
            fontSize: '28px', fontWeight: 800,
            background: 'linear-gradient(135deg, #e2e8f0 0%, #a5b4fc 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            margin: '0 0 8px',
            lineHeight: 1.2,
            letterSpacing: '-0.5px',
          }}>
            Admin Portal
          </h1>
          <p style={{ color: '#4b5680', fontSize: '14px', fontWeight: 400, margin: 0 }}>
            Faqat vakolatli xodimlar uchun kirish
          </p>
        </div>

        {/* ── Form area ── */}
        <div style={{ padding: '32px 44px 40px' }}>

          {/* Error banner */}
          {error && (
            <div style={{
              marginBottom: '22px',
              padding: '13px 16px',
              background: 'rgba(239,68,68,0.1)',
              border: '1px solid rgba(239,68,68,0.28)',
              borderRadius: '12px',
              color: '#fca5a5',
              fontSize: '14px',
              fontWeight: 500,
              display: 'flex',
              alignItems: 'center',
              gap: '9px',
              animation: 'shakeError 0.4s ease',
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                style={{ flexShrink: 0, color: '#f87171' }}>
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>

            {/* Email field */}
            <div style={{ marginBottom: '18px' }}>
              <label htmlFor="admin-email" style={{
                display: 'block', fontSize: '12px', fontWeight: 600,
                color: '#6b7280', marginBottom: '9px',
                letterSpacing: '0.8px', textTransform: 'uppercase',
              }}>
                Email Manzil
              </label>
              <div style={{ position: 'relative' }}>
                <span style={{
                  position: 'absolute', left: '15px', top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#4b5680', pointerEvents: 'none',
                  display: 'flex',
                }}>
                  <MailIcon />
                </span>
                <input
                  id="admin-email"
                  type="email"
                  autoComplete="email"
                  placeholder="admin@ramz.tj"
                  value={email}
                  onChange={e => { setEmail(e.target.value); setError(''); }}
                  disabled={loading}
                  required
                  style={{
                    width: '100%',
                    padding: '15px 16px 15px 48px',
                    background: 'rgba(255,255,255,0.04)',
                    border: `1.5px solid ${error ? 'rgba(239,68,68,0.45)' : 'rgba(99,102,241,0.18)'}`,
                    borderRadius: '13px',
                    color: '#f1f5f9',
                    fontSize: '15px',
                    fontFamily: 'inherit',
                    outline: 'none',
                    transition: 'border-color 0.2s, box-shadow 0.2s, background 0.2s',
                    boxSizing: 'border-box',
                    opacity: loading ? 0.6 : 1,
                  }}
                  onFocus={e => {
                    e.target.style.borderColor = 'rgba(99,102,241,0.65)';
                    e.target.style.boxShadow   = '0 0 0 3px rgba(99,102,241,0.14)';
                    e.target.style.background   = 'rgba(255,255,255,0.06)';
                  }}
                  onBlur={e => {
                    e.target.style.borderColor = error ? 'rgba(239,68,68,0.45)' : 'rgba(99,102,241,0.18)';
                    e.target.style.boxShadow   = 'none';
                    e.target.style.background   = 'rgba(255,255,255,0.04)';
                  }}
                />
              </div>
            </div>

            {/* Password field */}
            <div style={{ marginBottom: '30px' }}>
              <label htmlFor="admin-password" style={{
                display: 'block', fontSize: '12px', fontWeight: 600,
                color: '#6b7280', marginBottom: '9px',
                letterSpacing: '0.8px', textTransform: 'uppercase',
              }}>
                Admin Paroli
              </label>
              <div style={{ position: 'relative' }}>
                <span style={{
                  position: 'absolute', left: '15px', top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#4b5680', pointerEvents: 'none',
                  display: 'flex',
                }}>
                  <LockIcon />
                </span>
                <input
                  id="admin-password"
                  type={showPass ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="••••••••••••"
                  value={password}
                  onChange={e => { setPassword(e.target.value); setError(''); }}
                  disabled={loading}
                  required
                  style={{
                    width: '100%',
                    padding: '15px 50px 15px 48px',
                    background: 'rgba(255,255,255,0.04)',
                    border: `1.5px solid ${error ? 'rgba(239,68,68,0.45)' : 'rgba(99,102,241,0.18)'}`,
                    borderRadius: '13px',
                    color: '#f1f5f9',
                    fontSize: '15px',
                    fontFamily: 'inherit',
                    outline: 'none',
                    transition: 'border-color 0.2s, box-shadow 0.2s, background 0.2s',
                    boxSizing: 'border-box',
                    opacity: loading ? 0.6 : 1,
                  }}
                  onFocus={e => {
                    e.target.style.borderColor = 'rgba(99,102,241,0.65)';
                    e.target.style.boxShadow   = '0 0 0 3px rgba(99,102,241,0.14)';
                    e.target.style.background   = 'rgba(255,255,255,0.06)';
                  }}
                  onBlur={e => {
                    e.target.style.borderColor = error ? 'rgba(239,68,68,0.45)' : 'rgba(99,102,241,0.18)';
                    e.target.style.boxShadow   = 'none';
                    e.target.style.background   = 'rgba(255,255,255,0.04)';
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(v => !v)}
                  tabIndex={-1}
                  style={{
                    position: 'absolute', right: '14px', top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: '#4b5680', padding: '4px',
                    display: 'flex', alignItems: 'center',
                    transition: 'color 0.2s',
                    outline: 'none',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.color = '#818cf8')}
                  onMouseLeave={e => (e.currentTarget.style.color = '#4b5680')}
                  aria-label={showPass ? 'Parolni yashirish' : 'Parolni ko\'rsatish'}
                >
                  <EyeIcon off={showPass} />
                </button>
              </div>
            </div>

            {/* Submit button */}
            <button
              id="admin-login-btn"
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '16px 20px',
                background: loading
                  ? 'rgba(99,102,241,0.45)'
                  : 'linear-gradient(135deg, #6366f1 0%, #7c3aed 100%)',
                border: 'none',
                borderRadius: '14px',
                color: '#ffffff',
                fontSize: '16px',
                fontWeight: 700,
                fontFamily: 'inherit',
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                letterSpacing: '0.2px',
                transition: 'transform 0.15s ease, box-shadow 0.2s ease, opacity 0.2s',
                boxShadow: loading ? 'none' : '0 8px 32px rgba(99,102,241,0.4)',
                position: 'relative',
                overflow: 'hidden',
              }}
              onMouseEnter={e => {
                if (!loading) {
                  (e.currentTarget as HTMLButtonElement).style.transform  = 'translateY(-2px)';
                  (e.currentTarget as HTMLButtonElement).style.boxShadow  = '0 16px 40px rgba(99,102,241,0.5)';
                }
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLButtonElement).style.transform  = 'translateY(0)';
                (e.currentTarget as HTMLButtonElement).style.boxShadow  = loading ? 'none' : '0 8px 32px rgba(99,102,241,0.4)';
              }}
              onMouseDown={e => {
                if (!loading) (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0) scale(0.98)';
              }}
              onMouseUp={e => {
                if (!loading) (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-2px)';
              }}
            >
              {loading ? (
                <>
                  <SpinnerIcon />
                  Tekshirilmoqda...
                </>
              ) : (
                <>
                  <LockIcon />
                  Xavfsiz kirish
                  <ArrowRightIcon />
                </>
              )}
            </button>

          </form>
        </div>

        {/* ── Footer ── */}
        <div style={{
          padding: '14px 44px',
          borderTop: '1px solid rgba(99,102,241,0.08)',
          background: 'rgba(0,0,0,0.18)',
          textAlign: 'center',
          fontSize: '12px',
          color: '#2d3550',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '6px',
        }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            style={{ color: '#4b5680' }}>
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
          Ramz Security tomonidan himoyalangan
        </div>
      </div>

      {/* ── Global Keyframes ── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

        @keyframes blobFloat {
          0%, 100% { transform: translateY(0px) scale(1); }
          50%       { transform: translateY(-18px) scale(1.03); }
        }
        @keyframes particleFloat {
          0%, 100% { transform: translateY(0px); opacity: 0.5; }
          50%       { transform: translateY(-12px); opacity: 1; }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes loginFadeIn {
          from { opacity: 0; transform: translateY(32px) scale(0.96); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes gradientShift {
          0%   { background-position: 0% 50%; }
          100% { background-position: 200% 50%; }
        }
        @keyframes shakeError {
          0%, 100% { transform: translateX(0); }
          20%       { transform: translateX(-6px); }
          40%       { transform: translateX(6px); }
          60%       { transform: translateX(-4px); }
          80%       { transform: translateX(4px); }
        }
        .login-card  { animation: loginFadeIn 0.7s cubic-bezier(0.22,1,0.36,1) both; }
        .login-float { animation: blobFloat 4s ease-in-out infinite; }
        input::placeholder { color: #2d3550 !important; }
        input:-webkit-autofill,
        input:-webkit-autofill:hover,
        input:-webkit-autofill:focus {
          -webkit-box-shadow: 0 0 0 1000px rgba(15,17,26,0.9) inset !important;
          -webkit-text-fill-color: #f1f5f9 !important;
          caret-color: #f1f5f9;
        }
        * { box-sizing: border-box; }
      `}</style>
    </div>
  );
}
