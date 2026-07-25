'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Забонро дар ТАМОМИ барнома фаъол/хомӯш мекунад.
 *
 * Фарқ аз ToggleCourseBtn: он танҳо ЯК курсро хомӯш мекунад. Ин як забонро
 * ва ҳамаи курсҳояшро якбора мегирад, пас забон дар ҳама ҷо нопадид мешавад:
 * онбординг, интихобкунандаи забон дар профил, ва худи мазмун.
 */
export default function ToggleLanguageBtn({
  id,
  name,
  isActive,
}: {
  id: string;
  name: string;
  isActive: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleToggle(e: React.MouseEvent) {
    // Корт худаш <Link> аст — бе ин пахш ба саҳифаи забон мебарад.
    e.preventDefault();
    e.stopPropagation();

    const next = !isActive;
    const msg = next
      ? `Забони "${name}" ФАЪОЛ карда шавад?\n\nОн дар онбординг ва профил пайдо мешавад.`
      : `Забони "${name}" дар ТАМОМИ барнома ХОМӮШ карда шавад?\n\n` +
        `• аз онбординг нопадид мешавад\n` +
        `• аз интихобкунандаи забон дар профил нопадид мешавад\n` +
        `• дарсҳояш дигар кушода намешаванд\n\n` +
        `Ҳеҷ чиз НЕСТ намешавад — дарсҳо, калимаҳо ва прогресси корбарон боқӣ ` +
        `мемонанд. Ҳар вақт баргардонида метавонед.`;
    if (!confirm(msg)) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/admin/languages/${id}/visibility`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: next }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? 'Хатогӣ');

      // Огоҳии ростқавлона: хонандагоне ки ин забонро интихоб кардаанд,
      // баъд аз хомӯш кардан экрани холӣ мебинанд.
      if (!next && data.affectedLearners > 0) {
        alert(
          `"${name}" хомӯш шуд (${data.coursesUpdated} курс).\n\n` +
            `⚠️ ДИҚҚАТ: ${data.affectedLearners} хонанда ин забонро ҳамчун забони ` +
            `омӯзиш интихоб кардааст. Онҳо акнун мазмунро намебинанд ва бояд ` +
            `забони дигар интихоб кунанд.`
        );
      }
      router.refresh();
    } catch (err: any) {
      alert('Хатогӣ: ' + err.message);
    } finally {
      setLoading(false);
    }
  }

  const on = isActive;
  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      title={on ? 'Дар тамоми барнома хомӯш кардан' : 'Фаъол кардан'}
      style={{
        background: on ? 'rgba(251,191,36,0.10)' : 'rgba(34,197,94,0.10)',
        color: on ? '#FBBF24' : '#22C55E',
        border: `1px solid ${on ? 'rgba(251,191,36,0.25)' : 'rgba(34,197,94,0.25)'}`,
        borderRadius: '8px',
        padding: '6px 12px',
        cursor: loading ? 'not-allowed' : 'pointer',
        fontSize: '12px',
        fontWeight: 700,
        transition: 'all 0.2s',
      }}
    >
      {loading ? '⏳' : on ? '🚫 Хомӯш кардан' : '✅ Фаъол кардан'}
    </button>
  );
}
