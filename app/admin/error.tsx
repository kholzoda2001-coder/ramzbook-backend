'use client'; // Error components must be Client Components

import { useEffect } from 'react';

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Admin Panel Error:', error);
  }, [error]);

  return (
    <div style={{ padding: '40px', textAlign: 'center', background: 'rgba(255, 50, 50, 0.1)', borderRadius: '12px', border: '1px solid rgba(255, 50, 50, 0.2)', margin: '20px' }}>
      <h2 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--red)', marginBottom: '16px' }}>
        Мушкилии серверӣ ба миён омад
      </h2>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>
        {error.message || 'Маълумот аз база гирифта нашуд. Лутфан бори дигар кӯшиш кунед.'}
      </p>
      <button
        onClick={() => reset()}
        className="btn bg2b"
        style={{ padding: '10px 24px' }}
      >
        Аз нав кӯшиш кардан
      </button>
    </div>
  );
}
