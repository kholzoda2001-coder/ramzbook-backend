'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function DeleteCourseBtn({ id, title }: { id: string; title: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (!confirm(`Курси "${title}" нест карда шавад? Ҳамаи модулҳо, дарсҳо ва калимаҳо низ нест мешаванд!`)) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/courses/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? 'Хатогӣ');
      }
      router.refresh();
    } catch (e: any) {
      alert('Хатогӣ: ' + e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleDelete(); }}
      disabled={loading}
      style={{
        background: 'rgba(239,68,68,0.1)',
        color: '#EF4444',
        border: '1px solid rgba(239,68,68,0.2)',
        borderRadius: '8px',
        padding: '6px 10px',
        cursor: loading ? 'not-allowed' : 'pointer',
        fontSize: '13px',
        fontWeight: 600,
        transition: 'all 0.2s',
      }}
    >
      {loading ? '⏳' : '🗑️'}
    </button>
  );
}
