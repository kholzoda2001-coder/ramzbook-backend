'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Курсро фаъол / ғайрифаъол мекунад (isActive).
 *
 * Чаро ин ба ҷои нест кардан лозим аст: дар
 * `app/api/mobile/languages/target/route.ts` забон ТАНҲО вақте ба рӯйхати
 * онбординг меафтад, ки ҳадди ақал ЯК курси ФАЪОЛ дошта бошад. Пас курсро
 * ғайрифаъол кардан = забон аз барнома тамоман нопадид мешавад — ҳамон
 * натиҷаи намоён, вале:
 *   • бебозгашт нест (як пахш барои баргардонидан);
 *   • прогресси корбарон нигоҳ дошта мешавад;
 *   • хатои foreign-key намедиҳад (UserProgress → Lesson бе onDelete аст,
 *     пас нест кардани курси истифодашуда умуман РАД мешавад).
 */
export default function ToggleCourseBtn({
  id,
  title,
  isActive,
}: {
  id: string;
  title: string;
  isActive: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleToggle() {
    const next = !isActive;
    const msg = next
      ? `Курси "${title}" ФАЪОЛ карда шавад? Он дар барнома барои хонандагон пайдо мешавад.`
      : `Курси "${title}" ХОМӮШ карда шавад?\n\nОн аз барнома пинҳон мешавад, вале ҳамаи дарсҳо, калимаҳо ва прогресси корбарон боқӣ мемонанд. Ҳар вақт баргардонида метавонед.`;
    if (!confirm(msg)) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/admin/courses/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: next }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? 'Хатогӣ');
      }
      router.refresh();
    } catch (e: any) {
      alert('Хатогӣ: ' + e.message);
    } finally {
      setLoading(false);
    }
  }

  const on = isActive;
  return (
    <button
      onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleToggle(); }}
      disabled={loading}
      title={on ? 'Хомӯш кардан (аз барнома пинҳон мешавад)' : 'Фаъол кардан'}
      style={{
        background: on ? 'rgba(251,191,36,0.10)' : 'rgba(34,197,94,0.10)',
        color: on ? '#FBBF24' : '#22C55E',
        border: `1px solid ${on ? 'rgba(251,191,36,0.25)' : 'rgba(34,197,94,0.25)'}`,
        borderRadius: '8px',
        padding: '6px 10px',
        cursor: loading ? 'not-allowed' : 'pointer',
        fontSize: '13px',
        fontWeight: 600,
        transition: 'all 0.2s',
      }}
    >
      {loading ? '⏳' : on ? '🚫 Хомӯш' : '✅ Фаъол'}
    </button>
  );
}
