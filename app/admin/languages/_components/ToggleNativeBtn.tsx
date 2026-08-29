'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Забони МОДАРӢ (= забони интерфейс)-ро фаъол/хомӯш мекунад.
 *
 * Фарқ аз `courses/_components/ToggleLanguageBtn`: он `isActive`-ро иваз
 * мекунад, ки нақши ОМӮЗИШИро мекушад (курсҳое, ки ин забон дар онҳо ҲАДАФ
 * аст). Ин ҷо бошад нақши МОДАРӢ хомӯш мешавад — курсҳое, ки ин забон дар
 * онҳо забони ХОНАНДА аст. Барои англисӣ, ки ҳар ду нақшро дорад, ин фарқ
 * ҳалкунанда аст: хомӯш кардани «англисӣ ҳамчун модарӣ» набояд курси
 * тоҷикӣ→англисиро бикушад.
 */
export default function ToggleNativeBtn({
  id,
  name,
  canBeNative,
  targetCount,
}: {
  id: string;
  name: string;
  canBeNative: boolean;
  targetCount: number;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleToggle() {
    const next = !canBeNative;
    const msg = next
      ? `Забони «${name}»-ро ҳамчун забони МОДАРӢ фаъол кунем?\n\n` +
        `• дар онбординг ва профил пайдо мешавад\n` +
        `• забонҳои омӯзишии тобеи он боз кушода мешаванд`
      : `Забони «${name}»-ро ҳамчун забони МОДАРӢ ХОМӮШ кунем?\n\n` +
        `• аз онбординг ва профил нопадид мешавад\n` +
        (targetCount > 0
          ? `• ${targetCount} забони омӯзишии тобеи он низ пинҳон мешавад\n`
          : '') +
        `\nҲеҷ чиз НЕСТ намешавад — курсҳо, дарсҳо ва прогресси хонандагон ` +
        `боқӣ мемонанд ва ҳар лаҳза баргардонида мешаванд.`;
    if (!confirm(msg)) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/admin/languages/${id}/native-visibility`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ canBeNative: next }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? 'Хатогӣ');

      // Огоҳии ростқавлона: хонандагони мавҷуда роҳнамои ХОЛӢ мебинанд.
      if (!next && data.affectedLearners > 0) {
        alert(
          `«${name}» ҳамчун забони модарӣ хомӯш шуд.\n\n` +
            `${data.coursesHidden} курс ва ${data.targetLanguagesHidden} забони ` +
            `омӯзишӣ пинҳон шуд.\n\n` +
            `⚠️ ДИҚҚАТ: ${data.affectedLearners} хонанда маҳз ҳамин забонро ` +
            `ҳамчун забони модарӣ дорад. Онҳо акнун роҳнамои холӣ мебинанд ва ` +
            `бояд забони дигар интихоб кунанд.`,
        );
      }
      router.refresh();
    } catch (err: any) {
      alert('Хатогӣ: ' + err.message);
    } finally {
      setLoading(false);
    }
  }

  const on = canBeNative;
  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      title={
        on
          ? 'Ҳамчун забони модарӣ хомӯш кардан (курсҳояш низ пинҳон мешаванд)'
          : 'Ҳамчун забони модарӣ фаъол кардан'
      }
      style={{
        background: on ? 'rgba(251,191,36,0.10)' : 'rgba(34,197,94,0.10)',
        color: on ? '#FBBF24' : '#22C55E',
        border: `1px solid ${on ? 'rgba(251,191,36,0.25)' : 'rgba(34,197,94,0.25)'}`,
        borderRadius: '8px',
        padding: '6px 12px',
        cursor: loading ? 'not-allowed' : 'pointer',
        fontSize: '12px',
        fontWeight: 700,
        whiteSpace: 'nowrap',
        transition: 'all 0.2s',
      }}
    >
      {loading ? '⏳' : on ? '🚫 Хомӯш кардан' : '✅ Фаъол кардан'}
    </button>
  );
}
