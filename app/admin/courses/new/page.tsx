'use client';
import { Suspense, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

interface Lang {
  id: string;
  name: string;
  nativeName: string;
  code: string;
  flag: string;
  canBeNative: boolean;
  canBeTarget: boolean;
}

const FIELD: React.CSSProperties = {
  width: '100%',
  padding: '10px 12px',
  borderRadius: '8px',
  border: '1px solid var(--border)',
  background: 'rgba(255,255,255,0.05)',
  color: 'var(--text-primary)',
  fontSize: '14px',
  boxSizing: 'border-box',
};
const LABEL: React.CSSProperties = { display: 'block', color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '6px' };

const EMPTY_LANGUAGE = {
  name: '',
  nativeName: '',
  code: '',
  flag: '',
  badge: '',
  learnerCount: '',
  order: 0,
  isActive: true,
  ttsLocale: '',
  sttLocale: '',
  direction: 'ltr',
  fontFamily: '',
  hasIPA: true,
};

const EMPTY_COURSE = {
  nativeLanguageId: '',
  level: 'A1',
  title: '',
  description: '',
  emoji: '📚',
  color: '#14B8A6',
  order: 0,
};

function NewCourseContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const targetLanguageId = searchParams.get('targetLanguageId') ?? '';

  const [languages, setLanguages] = useState<Lang[]>([]);
  const [saving, setSaving] = useState(false);
  const [languageForm, setLanguageForm] = useState(EMPTY_LANGUAGE);
  const [courseForm, setCourseForm] = useState(EMPTY_COURSE);

  useEffect(() => {
    fetch('/api/admin/languages')
      .then(r => r.json())
      .then(d => setLanguages(d.languages ?? []))
      .catch(() => {});
  }, []);

  const targetLanguage = useMemo(
    () => languages.find(l => l.id === targetLanguageId),
    [languages, targetLanguageId],
  );
  const nativeLanguages = languages.filter(l => l.canBeNative);
  const isCourseMode = Boolean(targetLanguageId);

  async function createLanguage(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/admin/languages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...languageForm,
          nativeName: languageForm.nativeName || languageForm.name,
          canBeNative: false,
          canBeTarget: true,
          badge: languageForm.badge || null,
          learnerCount: languageForm.learnerCount || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Хатогӣ');
      router.push(`/admin/courses/${data.language.id}`);
    } catch (e: any) {
      alert('Хатогӣ: ' + e.message);
    } finally {
      setSaving(false);
    }
  }

  async function createCourse(e: React.FormEvent) {
    e.preventDefault();
    if (!targetLanguageId) return;
    setSaving(true);
    try {
      const res = await fetch('/api/admin/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...courseForm, targetLanguageId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Хатогӣ');
      router.push(`/admin/courses/${targetLanguageId}`);
    } catch (e: any) {
      alert('Хатогӣ: ' + e.message);
    } finally {
      setSaving(false);
    }
  }

  if (isCourseMode && languages.length > 0 && !targetLanguage) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <h2 style={{ color: 'var(--text-primary)', marginBottom: '8px' }}>Забон ёфт нашуд</h2>
        <Link href="/admin/courses" style={{ color: 'var(--teal)' }}>Бозгашт ба забонҳо</Link>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 760 }}>
      <div style={{ fontSize: '12px', color: 'var(--text3)', marginBottom: '8px' }}>
        <Link href="/admin/courses" style={{ color: 'var(--text3)' }}>Забонҳои Омӯзишӣ</Link>
        {targetLanguage && <> › <Link href={`/admin/courses/${targetLanguage.id}`} style={{ color: 'var(--text3)' }}>{targetLanguage.flag} {targetLanguage.name}</Link></>}
        {' '}› {isCourseMode ? 'Курси нав' : 'Забони нав'}
      </div>

      <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>
        {isCourseMode ? `Курси нав барои ${targetLanguage?.flag ?? ''} ${targetLanguage?.name ?? ''}` : 'Забони нави омӯзишӣ'}
      </h1>
      <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '20px' }}>
        {isCourseMode
          ? 'Ин курс дар дохили ҳамин забон меистад. Баъд аз сохтани курс, модулҳо, дарсҳо, грамматика ва дигар маводро ба ҳамин курс илова мекунед.'
          : 'Аввал худи забонро созед. Баъд ба дохили он ворид шуда, курсҳо, сатҳҳо, дарсҳо ва грамматикаро илова мекунед.'}
      </p>

      {isCourseMode ? (
        <form onSubmit={createCourse} className="glass-card" style={{ padding: '24px', borderRadius: '16px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px,1fr))', gap: '16px' }}>
            <div>
              <label style={LABEL}>Забони модарӣ *</label>
              <select required value={courseForm.nativeLanguageId} onChange={e => setCourseForm(f => ({ ...f, nativeLanguageId: e.target.value }))} style={FIELD}>
                <option value="">Интихоб кунед...</option>
                {nativeLanguages.map(l => <option key={l.id} value={l.id}>{l.flag} {l.nativeName}</option>)}
              </select>
            </div>
            <div>
              <label style={LABEL}>Сатҳ *</label>
              <select value={courseForm.level} onChange={e => setCourseForm(f => ({ ...f, level: e.target.value }))} style={FIELD}>
                {['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
            <div>
              <label style={LABEL}>Сарлавҳаи курс *</label>
              <input required value={courseForm.title} onChange={e => setCourseForm(f => ({ ...f, title: e.target.value }))} placeholder="Забони чинӣ — A1" style={FIELD} />
            </div>
            <div>
              <label style={LABEL}>Эмоҷи</label>
              <input value={courseForm.emoji} onChange={e => setCourseForm(f => ({ ...f, emoji: e.target.value }))} style={FIELD} />
            </div>
            <div>
              <label style={LABEL}>Ранг</label>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <input type="color" value={courseForm.color} onChange={e => setCourseForm(f => ({ ...f, color: e.target.value }))} style={{ width: 42, height: 38, borderRadius: 7, border: '1px solid var(--border)', background: 'transparent', padding: 2 }} />
                <input value={courseForm.color} onChange={e => setCourseForm(f => ({ ...f, color: e.target.value }))} style={FIELD} />
              </div>
            </div>
            <div>
              <label style={LABEL}>Тартиб</label>
              <input type="number" value={courseForm.order} onChange={e => setCourseForm(f => ({ ...f, order: parseInt(e.target.value) || 0 }))} style={FIELD} />
            </div>
          </div>
          <div style={{ marginTop: '16px' }}>
            <label style={LABEL}>Тавсиф</label>
            <textarea value={courseForm.description} onChange={e => setCourseForm(f => ({ ...f, description: e.target.value }))} rows={3} style={{ ...FIELD, resize: 'vertical' }} />
          </div>
          <Actions saving={saving} backHref={targetLanguageId ? `/admin/courses/${targetLanguageId}` : '/admin/courses'} />
        </form>
      ) : (
        <form onSubmit={createLanguage} className="glass-card" style={{ padding: '24px', borderRadius: '16px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px,1fr))', gap: '16px' }}>
            <div><label style={LABEL}>Ном *</label><input required value={languageForm.name} onChange={e => setLanguageForm(f => ({ ...f, name: e.target.value }))} placeholder="Chinese" style={FIELD} /></div>
            <div><label style={LABEL}>Номи бумӣ</label><input value={languageForm.nativeName} onChange={e => setLanguageForm(f => ({ ...f, nativeName: e.target.value }))} placeholder="中文" style={FIELD} /></div>
            <div><label style={LABEL}>Код *</label><input required value={languageForm.code} onChange={e => setLanguageForm(f => ({ ...f, code: e.target.value }))} placeholder="zh" style={FIELD} /></div>
            <div><label style={LABEL}>Парчам *</label><input required value={languageForm.flag} onChange={e => setLanguageForm(f => ({ ...f, flag: e.target.value }))} placeholder="🇨🇳" style={FIELD} /></div>
            <div>
              <label style={LABEL}>Нишон</label>
              <select value={languageForm.badge} onChange={e => setLanguageForm(f => ({ ...f, badge: e.target.value }))} style={FIELD}>
                <option value="">Ҳеҷ</option><option value="HOT">HOT</option><option value="LIVE">LIVE</option><option value="SOON">SOON</option>
              </select>
            </div>
            <div><label style={LABEL}>Шумораи омӯзандагон</label><input value={languageForm.learnerCount} onChange={e => setLanguageForm(f => ({ ...f, learnerCount: e.target.value }))} placeholder="1.5B learners" style={FIELD} /></div>
            <div><label style={LABEL}>Тартиб</label><input type="number" value={languageForm.order} onChange={e => setLanguageForm(f => ({ ...f, order: parseInt(e.target.value) || 0 }))} style={FIELD} /></div>
          </div>

          <div style={{ marginTop: '24px', marginBottom: '8px', fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>Танзимоти забон</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px,1fr))', gap: '16px' }}>
            <div><label style={LABEL}>TTS Locale</label><input value={languageForm.ttsLocale} onChange={e => setLanguageForm(f => ({ ...f, ttsLocale: e.target.value }))} placeholder="zh-CN, en-US, ru-RU" style={FIELD} /></div>
            <div><label style={LABEL}>STT Locale</label><input value={languageForm.sttLocale} onChange={e => setLanguageForm(f => ({ ...f, sttLocale: e.target.value }))} placeholder="zh-CN" style={FIELD} /></div>
            <div>
              <label style={LABEL}>Самти хат</label>
              <select value={languageForm.direction} onChange={e => setLanguageForm(f => ({ ...f, direction: e.target.value }))} style={FIELD}>
                <option value="ltr">Чап → Рост (LTR)</option>
                <option value="rtl">Рост → Чап (RTL)</option>
              </select>
            </div>
            <div><label style={LABEL}>Шрифт</label><input value={languageForm.fontFamily} onChange={e => setLanguageForm(f => ({ ...f, fontFamily: e.target.value }))} placeholder="Noto Sans SC" style={FIELD} /></div>
          </div>

          <div style={{ display: 'flex', gap: '24px', marginTop: '18px', flexWrap: 'wrap' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', fontSize: '14px', cursor: 'pointer' }}>
              <input type="checkbox" checked={languageForm.isActive} onChange={e => setLanguageForm(f => ({ ...f, isActive: e.target.checked }))} /> Фаъол
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', fontSize: '14px', cursor: 'pointer' }}>
              <input type="checkbox" checked={languageForm.hasIPA} onChange={e => setLanguageForm(f => ({ ...f, hasIPA: e.target.checked }))} /> Транскрипсияи фонетикӣ (IPA)
            </label>
          </div>
          <Actions saving={saving} backHref="/admin/courses" />
        </form>
      )}
    </div>
  );
}

function Actions({ saving, backHref }: { saving: boolean; backHref: string }) {
  return (
    <div style={{ marginTop: '20px', display: 'flex', gap: '12px' }}>
      <button type="submit" disabled={saving} style={{ background: 'linear-gradient(135deg, #14B8A6, #0d9488)', color: '#fff', padding: '10px 24px', borderRadius: '8px', border: 'none', fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer' }}>
        {saving ? '⏳...' : '✅ Сохтан'}
      </button>
      <Link href={backHref} style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)', padding: '10px 24px', borderRadius: '8px', border: '1px solid var(--border)', textDecoration: 'none' }}>
        Бекор кардан
      </Link>
    </div>
  );
}

export default function NewCoursePage() {
  return (
    <Suspense fallback={<div style={{ padding: 40, color: 'var(--text3)' }}>Бор мешавад...</div>}>
      <NewCourseContent />
    </Suspense>
  );
}
