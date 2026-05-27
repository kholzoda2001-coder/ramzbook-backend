'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function DeleteLanguageBtn({ id, name }: { id: string; name: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (!confirm(`Шумо дар ҳақиқат мехоҳед забони "${name}"-ро нест кунед?`)) return;
    
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/languages/${id}`, { method: 'DELETE' });
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error ?? 'Хатогӣ ҳангоми нест кардан');
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
      onClick={handleDelete} 
      disabled={loading}
      title="Нест кардан" 
      style={{ 
        background: 'rgba(239,68,68,0.1)', 
        color: '#EF4444', 
        border: '1px solid rgba(239,68,68,0.2)', 
        borderRadius: '6px', 
        padding: '4px 10px', 
        cursor: loading ? 'not-allowed' : 'pointer', 
        fontSize: '13px',
        opacity: loading ? 0.5 : 1
      }}
    >
      {loading ? '⏳' : '🗑️'}
    </button>
  );
}
