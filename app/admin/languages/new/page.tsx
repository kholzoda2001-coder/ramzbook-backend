"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Globe, Flag, AlignLeft, Layers, Plus, Trash2, 
  ChevronDown, ChevronRight, CheckCircle, ArrowRight, Save, LayoutTemplate,
  Info, BookOpen, Volume2, Type, Upload, Download
} from 'lucide-react';

// Types
type Word = {
  id: string;
  originalWord: string;
  translation: string;
  transcription: string;
  pronunciation: string;
  audioUrl: string;
  emoji: string;
};

type Lesson = {
  id: string;
  name: string;
  words: Word[];
};

type Unit = {
  id: string;
  name: string;
  lessons: Lesson[];
};

type Level = {
  id: string;
  name: string;
  units: Unit[];
};

export default function AddNewLanguagePage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Accordion State
  const [expandedLevelId, setExpandedLevelId] = useState<string | null>(null);
  const [expandedUnitId, setExpandedUnitId] = useState<string | null>(null);

  // Step 1 State
  const [languageName, setLanguageName] = useState('');
  const [languageCode, setLanguageCode] = useState('');
  const [flagUrl, setFlagUrl] = useState('');
  const [description, setDescription] = useState('');

  // Step 2 State (Tree)
  const [levels, setLevels] = useState<Level[]>([]);

  // Helpers to generate IDs
  const genId = () => Math.random().toString(36).substring(2, 9);

  // --- Handlers for Tree ---
  const handleGenerateLevels = (count: number) => {
    const newLevels: Level[] = [];
    for (let i = 1; i <= count; i++) {
      newLevels.push({ id: genId(), name: `Level ${i}`, units: [] });
    }
    setLevels(newLevels);
    if (newLevels.length > 0) setExpandedLevelId(newLevels[0].id);
  };

  const addUnit = (levelId: string) => {
    const newUnitId = genId();
    setLevels(prev => prev.map(l => {
      if (l.id === levelId) {
        return { ...l, units: [...l.units, { id: newUnitId, name: `Unit ${l.units.length + 1}`, lessons: [] }] };
      }
      return l;
    }));
    setExpandedUnitId(newUnitId);
  };

  const addLesson = (levelId: string, unitId: string) => {
    setLevels(prev => prev.map(l => {
      if (l.id === levelId) return {
          ...l, units: l.units.map(u => {
            if (u.id === unitId) return { ...u, lessons: [...u.lessons, { id: genId(), name: `Lesson ${u.lessons.length + 1}`, words: [] }] };
            return u;
          })
        };
      return l;
    }));
  };

  const addWord = (levelId: string, unitId: string, lessonId: string) => {
    setLevels(prev => prev.map(l => {
      if (l.id === levelId) return {
          ...l, units: l.units.map(u => {
            if (u.id === unitId) return {
                ...u, lessons: u.lessons.map(ls => {
                  if (ls.id === lessonId) return {
                      ...ls, words: [...ls.words, { 
                        id: genId(), originalWord: '', translation: '', transcription: '', pronunciation: '', audioUrl: '', emoji: '' 
                      }]
                    };
                  return ls;
                })
              };
            return u;
          })
        };
      return l;
    }));
  };

  const updateWord = (levelId: string, unitId: string, lessonId: string, wordId: string, field: keyof Word, value: string) => {
    setLevels(prev => prev.map(l => {
      if (l.id === levelId) return { ...l, units: l.units.map(u => {
        if (u.id === unitId) return { ...u, lessons: u.lessons.map(ls => {
          if (ls.id === lessonId) return { ...ls, words: ls.words.map(w => {
            if (w.id === wordId) return { ...w, [field]: value };
            return w;
          })};
          return ls;
        })};
        return u;
      })};
      return l;
    }));
  };

  const removeWord = (levelId: string, unitId: string, lessonId: string, wordId: string) => {
    setLevels(prev => prev.map(l => {
      if (l.id === levelId) return { ...l, units: l.units.map(u => {
        if (u.id === unitId) return { ...u, lessons: u.lessons.map(ls => {
          if (ls.id === lessonId) return { ...ls, words: ls.words.filter(w => w.id !== wordId) };
          return ls;
        })};
        return u;
      })};
      return l;
    }));
  };

  const handleCsvUpload = (levelId: string, unitId: string, lessonId: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split('\n');
      const newWords: Word[] = [];
      
      let startIndex = 0;
      if (lines[0] && (lines[0].toLowerCase().includes('original') || lines[0].toLowerCase().includes('калима'))) {
        startIndex = 1;
      }

      for (let i = startIndex; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        
        // Handle CSV split respecting commas inside quotes (basic regex)
        // For simplicity, splitting by comma, but standardizing quotes if any
        const parts = line.split(',');
        if (parts.length >= 2) {
          newWords.push({
            id: genId(),
            originalWord: parts[0]?.replace(/^"|"$/g, '').trim() || '',
            translation: parts[1]?.replace(/^"|"$/g, '').trim() || '',
            transcription: parts[2]?.replace(/^"|"$/g, '').trim() || '',
            pronunciation: parts[3]?.replace(/^"|"$/g, '').trim() || '',
            emoji: parts[4]?.replace(/^"|"$/g, '').trim() || '',
            audioUrl: '',
          });
        }
      }

      if (newWords.length > 0) {
        setLevels(prev => prev.map(l => {
          if (l.id === levelId) return { ...l, units: l.units.map(u => {
            if (u.id === unitId) return { ...u, lessons: u.lessons.map(ls => {
              if (ls.id === lessonId) return { ...ls, words: [...ls.words, ...newWords] };
              return ls;
            })};
            return u;
          })};
          return l;
        }));
      }
    };
    reader.readAsText(file);
    // Reset input
    event.target.value = '';
  };

  const downloadDemoCsv = () => {
    // Add BOM for UTF-8 Excel support
    const csvContent = "\uFEFFКалима,Тарҷума,Транскриптсия,Талаффуз,Эмоҷи\nApple,Себ,/ˈæpl/,[Эппл],🍎\nBook,Китоб,/bʊk/,[Бук],📖\nSun,Офтоб,/sʌn/,[Сан],☀️\nCar,Мошин,/kɑːr/,[Кар],🚗";
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "demo_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const updateLevelName = (levelId: string, name: string) => {
    setLevels(prev => prev.map(l => l.id === levelId ? { ...l, name } : l));
  };

  const updateUnitName = (levelId: string, unitId: string, name: string) => {
    setLevels(prev => prev.map(l => l.id === levelId ? { ...l, units: l.units.map(u => u.id === unitId ? { ...u, name } : u) } : l));
  };

  const updateLessonName = (levelId: string, unitId: string, lessonId: string, name: string) => {
    setLevels(prev => prev.map(l => l.id === levelId ? { ...l, units: l.units.map(u => u.id === unitId ? { ...u, lessons: u.lessons.map(ls => ls.id === lessonId ? { ...ls, name } : ls) } : u) } : l));
  };

  // --- Submit ---
  const handlePublish = async () => {
    setIsSubmitting(true);
    setError(null);

    const payload = {
      languageName, languageCode, flagUrl, description,
      levels: levels.map(l => ({
        name: l.name,
        units: l.units.map(u => ({
          name: u.name,
          lessons: u.lessons.map(ls => ({
            name: ls.name,
            words: ls.words.map(w => ({
              originalWord: w.originalWord, translation: w.translation,
              transcription: w.transcription, pronunciation: w.pronunciation, audioUrl: w.audioUrl, emoji: w.emoji
            }))
          }))
        }))
      }))
    };

    try {
      const res = await fetch('/api/admin/languages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create language');
      router.push('/admin/products');
    } catch (err: any) {
      setError(err.message);
      setIsSubmitting(false);
    }
  };

  const totalWordsCount = levels.reduce((sum, l) => sum + l.units.reduce((usum, u) => usum + u.lessons.reduce((lsum, ls) => lsum + ls.words.length, 0), 0), 0);

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', paddingBottom: '100px' }}>
      {/* Header */}
      <div className="fade-up" style={{ marginBottom: '30px', display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{ width: 48, height: 48, borderRadius: '16px', background: 'linear-gradient(135deg, #00D4C0, #4B6BFB)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Globe size={24} color="#fff" />
        </div>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>Иловаи Забони Нав</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '15px', marginTop: '4px' }}>
            Роудмап ва мундариҷаи курси навро қадам ба қадам созед
          </p>
        </div>
      </div>

      {/* Stepper */}
      <div className="glass-card" style={{ padding: '24px', marginBottom: '32px', display: 'flex', gap: '20px', alignItems: 'center', justifyContent: 'center' }}>
        {[
          { num: 1, label: 'Маълумоти Асосӣ' },
          { num: 2, label: 'Сохтори Дарсҳо' },
          { num: 3, label: 'Нашр кардан' }
        ].map((s, idx) => (
          <React.Fragment key={s.num}>
            <div style={{ display: 'flex', alignItems: 'center', opacity: step >= s.num ? 1 : 0.4, cursor: step > s.num ? 'pointer' : 'default' }} onClick={() => step > s.num && setStep(s.num)}>
              <div style={{ 
                width: 36, height: 36, borderRadius: '50%', 
                background: step === s.num ? 'var(--primary)' : step > s.num ? '#10B981' : 'var(--bg-elevated)',
                color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 700, fontSize: '15px', boxShadow: step === s.num ? '0 0 15px rgba(0, 212, 192, 0.4)' : 'none'
              }}>
                {step > s.num ? <CheckCircle size={18} /> : s.num}
              </div>
              <span style={{ marginLeft: '12px', fontWeight: 600, color: step === s.num ? 'var(--primary)' : 'var(--text-primary)', fontSize: '15px' }}>
                {s.label}
              </span>
            </div>
            {idx < 2 && <div style={{ height: 2, flex: 1, background: step > s.num ? '#10B981' : 'var(--border-color)', opacity: 0.5, maxWidth: '100px' }} />}
          </React.Fragment>
        ))}
      </div>

      {error && (
        <div className="fade-up" style={{ padding: '16px 20px', background: 'rgba(239,68,68,0.1)', color: '#ef4444', borderRadius: '12px', marginBottom: '24px', border: '1px solid rgba(239,68,68,0.2)', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Info size={20} />
          <span style={{ fontWeight: 500 }}>{error}</span>
        </div>
      )}

      {/* STEP 1: Basic Info */}
      {step === 1 && (
        <div className="glass-card fade-up" style={{ padding: '40px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: -50, right: -50, opacity: 0.05, pointerEvents: 'none' }}>
            <Globe size={300} />
          </div>
          
          <div style={{ maxWidth: '600px', position: 'relative', zIndex: 1 }}>
            <h2 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '24px' }}>1. Маълумоти умумии забон</h2>
            
            <div style={{ display: 'grid', gap: '24px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600, color: 'var(--text-secondary)' }}>Номи Забон <span style={{ color: '#ef4444' }}>*</span></label>
                <div className="input-group" style={{ background: 'var(--bg-main)' }}>
                  <Type size={18} color="var(--primary)" />
                  <input type="text" placeholder="Масалан: English, Russian, Тоҷикӣ" value={languageName} onChange={e => setLanguageName(e.target.value)} />
                </div>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '6px' }}>Ин ном дар саҳифаи асосии апп (Categories) пайдо мешавад.</p>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600, color: 'var(--text-secondary)' }}>Коди Забон (ихтиёрӣ)</label>
                  <div className="input-group" style={{ background: 'var(--bg-main)' }}>
                    <AlignLeft size={18} />
                    <input type="text" placeholder="en, ru, tg" value={languageCode} onChange={e => setLanguageCode(e.target.value)} />
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600, color: 'var(--text-secondary)' }}>Парчам (Emoji / URL)</label>
                  <div className="input-group" style={{ background: 'var(--bg-main)' }}>
                    <Flag size={18} color="#F5A623" />
                    <input type="text" placeholder="🇺🇸 ё URL-и сурат" value={flagUrl} onChange={e => setFlagUrl(e.target.value)} />
                  </div>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600, color: 'var(--text-secondary)' }}>Тавсиф (Description)</label>
                <textarea 
                  style={{ width: '100%', minHeight: '100px', padding: '16px', background: 'var(--bg-main)', border: '1px solid var(--border-color)', borderRadius: '12px', color: 'var(--text-primary)', outline: 'none', resize: 'vertical' }}
                  placeholder="Дар бораи ин курс каме маълумот нависед..."
                  value={description} onChange={e => setDescription(e.target.value)}
                />
              </div>

              <div style={{ padding: '24px', background: 'rgba(0, 212, 192, 0.05)', borderRadius: '16px', border: '1px solid rgba(0, 212, 192, 0.1)' }}>
                <label style={{ display: 'block', marginBottom: '12px', fontSize: '15px', fontWeight: 700, color: 'var(--primary)' }}>Интихоби миқдори Сатҳҳо (Levels)</label>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px' }}>Шумо чанд сатҳ (А1, А2, В1...) сохтан мехоҳед? Баъдтар ҳам илова кардан мумкин аст.</p>
                <div style={{ display: 'flex', gap: '12px' }}>
                  {[1, 3, 5, 7].map(num => (
                    <button 
                      key={num}
                      onClick={() => handleGenerateLevels(num)}
                      style={{ 
                        flex: 1, padding: '12px 0', borderRadius: '10px', cursor: 'pointer', fontWeight: 700, fontSize: '15px',
                        background: levels.length === num ? 'var(--primary)' : 'var(--bg-elevated)',
                        color: levels.length === num ? '#fff' : 'var(--text-secondary)',
                        border: '2px solid', borderColor: levels.length === num ? 'var(--primary)' : 'var(--border-color)',
                        transition: 'all 0.2s'
                      }}
                    >
                      {num} Сатҳ
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div style={{ marginTop: '32px' }}>
              <button 
                className="gradient-btn"
                disabled={!languageName || levels.length === 0}
                onClick={() => setStep(2)}
                style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', padding: '16px', borderRadius: '12px', color: '#fff', fontSize: '16px', fontWeight: 700, border: 'none', cursor: 'pointer', opacity: (!languageName || levels.length === 0) ? 0.5 : 1, boxShadow: '0 8px 20px rgba(0,212,192,0.3)' }}
              >
                Сохтори дарсҳоро созед <ArrowRight size={20} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STEP 2: Roadmap Builder */}
      {step === 2 && (
        <div className="fade-up">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', padding: '0 8px' }}>
            <div>
              <h2 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-primary)' }}>2. Сохтори Роудмап</h2>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '4px' }}>Калимаҳоро ба дарсҳо ва модулҳо тақсим кунед.</p>
            </div>
            <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-color)', padding: '10px 20px', borderRadius: '12px' }}>
              <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Калимаҳои умумӣ: </span>
              <b style={{ color: 'var(--primary)', fontSize: '18px' }}>{totalWordsCount}</b>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {levels.map((level, lIdx) => {
              const isLevelExpanded = expandedLevelId === level.id;
              
              return (
                <div key={level.id} className="glass-card" style={{ border: isLevelExpanded ? '2px solid var(--primary)' : '1px solid var(--border-color)', borderRadius: '16px', overflow: 'hidden', transition: 'all 0.3s' }}>
                  {/* Level Header (Clickable) */}
                  <div 
                    onClick={() => setExpandedLevelId(isLevelExpanded ? null : level.id)}
                    style={{ padding: '20px 24px', background: isLevelExpanded ? 'rgba(0, 212, 192, 0.05)' : 'transparent', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: 40, height: 40, borderRadius: '10px', background: 'var(--bg-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Layers size={20} color="var(--primary)" />
                      </div>
                      <div style={{ flex: 1 }}>
                        <input 
                          type="text" 
                          value={level.name} 
                          onChange={(e) => updateLevelName(level.id, e.target.value)} 
                          onClick={(e) => e.stopPropagation()}
                          style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', background: 'transparent', border: 'none', borderBottom: '1px solid var(--border-color)', outline: 'none', width: '100%', padding: '2px 0' }} 
                        />
                        <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>{level.units.length} Модул • Барои кушодан ё пӯшидан дар болои он клик кунед</p>
                      </div>
                    </div>
                    {isLevelExpanded ? <ChevronDown size={24} color="var(--primary)" /> : <ChevronRight size={24} color="var(--text-muted)" />}
                  </div>

                  {/* Level Content (Units) */}
                  {isLevelExpanded && (
                    <div style={{ padding: '0 24px 24px 24px', borderTop: '1px solid rgba(0, 212, 192, 0.1)' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '16px 0' }}>
                        <button 
                          onClick={(e) => { e.stopPropagation(); addUnit(level.id); }}
                          style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--primary)', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '8px', fontSize: '14px', fontWeight: 600, cursor: 'pointer', boxShadow: '0 4px 10px rgba(0,212,192,0.2)' }}
                        >
                          <Plus size={16} /> Модули нав (Unit)
                        </button>
                      </div>

                      {level.units.length === 0 && (
                        <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
                          <BookOpen size={40} style={{ opacity: 0.2, marginBottom: '12px' }} />
                          <p>Дар ин сатҳ ҳанӯз ягон модул нест.</p>
                        </div>
                      )}

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {level.units.map((unit, uIdx) => {
                          const isUnitExpanded = expandedUnitId === unit.id;
                          
                          return (
                            <div key={unit.id} style={{ background: 'var(--bg-main)', border: isUnitExpanded ? '1px solid var(--primary)' : '1px solid var(--border-color)', borderRadius: '12px', overflow: 'hidden' }}>
                              {/* Unit Header */}
                              <div 
                                onClick={(e) => { e.stopPropagation(); setExpandedUnitId(isUnitExpanded ? null : unit.id); }}
                                style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', background: isUnitExpanded ? 'rgba(0, 212, 192, 0.03)' : 'transparent' }}
                              >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--primary)', flexShrink: 0 }} />
                                  <input 
                                    type="text" 
                                    value={unit.name} 
                                    onChange={(e) => updateUnitName(level.id, unit.id, e.target.value)}
                                    onClick={(e) => e.stopPropagation()}
                                    style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', background: 'transparent', border: 'none', borderBottom: '1px dashed var(--border-color)', outline: 'none', width: '100%' }}
                                  />
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                  <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{unit.lessons.length} Дарс</span>
                                  {isUnitExpanded ? <ChevronDown size={20} color="var(--primary)" /> : <ChevronRight size={20} color="var(--text-muted)" />}
                                </div>
                              </div>

                              {/* Unit Content (Lessons & Words) */}
                              {isUnitExpanded && (
                                <div style={{ padding: '20px', borderTop: '1px solid var(--border-color)', background: 'var(--bg-elevated)' }}>
                                  
                                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                    <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Мундариҷаи дарсҳо ба таври интерактивӣ дар апп пайдо мешаванд.</p>
                                    <button 
                                      onClick={() => addLesson(level.id, unit.id)}
                                      style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'transparent', color: 'var(--primary)', border: '1px solid var(--primary)', padding: '6px 12px', borderRadius: '6px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
                                    >
                                      <Plus size={14} /> Дарс илова кунед
                                    </button>
                                  </div>

                                  <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                                    {unit.lessons.map((lesson, lsIdx) => (
                                      <div key={lesson.id} style={{ background: 'var(--bg-main)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '10px', padding: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.2)' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
                                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, marginRight: '16px' }}>
                                            <BookOpen size={16} color="#F5A623" style={{ flexShrink: 0 }} />
                                            <input 
                                              type="text" 
                                              value={lesson.name} 
                                              onChange={(e) => updateLessonName(level.id, unit.id, lesson.id, e.target.value)}
                                              style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', background: 'transparent', border: 'none', borderBottom: '1px dashed var(--border-color)', outline: 'none', width: '100%' }}
                                            />
                                          </div>
                                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <button 
                                              onClick={downloadDemoCsv}
                                              title="Шаблони CSV-ро боргирӣ кунед"
                                              style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'transparent', color: '#64748b', border: '1px solid #cbd5e1', padding: '6px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}
                                            >
                                              <Download size={14} /> Шаблон
                                            </button>
                                            <label style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(56, 189, 248, 0.1)', color: '#38BDF8', border: '1px solid rgba(56, 189, 248, 0.2)', padding: '6px 12px', borderRadius: '20px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
                                              <Upload size={14} /> CSV
                                              <input type="file" accept=".csv" style={{ display: 'none' }} onChange={(e) => handleCsvUpload(level.id, unit.id, lesson.id, e)} />
                                            </label>
                                            <button 
                                              onClick={() => addWord(level.id, unit.id, lesson.id)}
                                              style={{ display: 'flex', alignItems: 'center', gap: '4px', background: '#10B981', color: '#fff', border: 'none', padding: '6px 16px', borderRadius: '20px', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}
                                            >
                                              <Plus size={14} /> Калима
                                            </button>
                                          </div>
                                        </div>

                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                          {lesson.words.length === 0 && <p style={{ fontSize: '13px', color: 'var(--text-muted)', fontStyle: 'italic', textAlign: 'center', padding: '10px' }}>Дар ин дарс калима нест. "Калима" ро пахш кунед.</p>}
                                          
                                          {lesson.words.map((word, wIdx) => (
                                            <div key={word.id} style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 1fr 1fr 1fr 40px', gap: '10px', alignItems: 'center', background: 'var(--bg-elevated)', padding: '8px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                                              <input 
                                                type="text" placeholder="Калима (Original)" value={word.originalWord}
                                                onChange={e => updateWord(level.id, unit.id, lesson.id, word.id, 'originalWord', e.target.value)}
                                                style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', fontSize: '14px', outline: 'none', padding: '4px 8px' }}
                                              />
                                              <input 
                                                type="text" placeholder="Тарҷума (Tajik)" value={word.translation}
                                                onChange={e => updateWord(level.id, unit.id, lesson.id, word.id, 'translation', e.target.value)}
                                                style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', fontSize: '14px', outline: 'none', padding: '4px 8px', borderLeft: '1px solid var(--border-color)' }}
                                              />
                                              <input 
                                                type="text" placeholder="Транскриптсия" value={word.transcription}
                                                onChange={e => updateWord(level.id, unit.id, lesson.id, word.id, 'transcription', e.target.value)}
                                                style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', fontSize: '13px', outline: 'none', padding: '4px 8px', borderLeft: '1px solid var(--border-color)' }}
                                              />
                                              <input 
                                                type="text" placeholder="Талаффуз (Тоҷ)" value={word.pronunciation}
                                                onChange={e => updateWord(level.id, unit.id, lesson.id, word.id, 'pronunciation', e.target.value)}
                                                style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', fontSize: '13px', outline: 'none', padding: '4px 8px', borderLeft: '1px solid var(--border-color)' }}
                                              />
                                              <input 
                                                type="text" placeholder="Эмоҷи/Расм" value={word.emoji}
                                                onChange={e => updateWord(level.id, unit.id, lesson.id, word.id, 'emoji', e.target.value)}
                                                style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', fontSize: '13px', outline: 'none', padding: '4px 8px', borderLeft: '1px solid var(--border-color)' }}
                                              />
                                              <button onClick={() => removeWord(level.id, unit.id, lesson.id, word.id)} style={{ background: 'rgba(239,68,68,0.1)', border: 'none', color: '#ef4444', width: '32px', height: '32px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <Trash2 size={16} />
                                              </button>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '32px', padding: '24px', background: 'var(--bg-elevated)', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
            <button 
              onClick={() => setStep(1)}
              style={{ padding: '14px 28px', borderRadius: '12px', color: 'var(--text-primary)', fontSize: '15px', fontWeight: 700, background: 'var(--bg-main)', border: '1px solid var(--border-color)', cursor: 'pointer', transition: 'all 0.2s' }}
            >
              Ба қафо
            </button>
            <button 
              className="gradient-btn"
              onClick={() => setStep(3)}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', padding: '14px 32px', borderRadius: '12px', color: '#fff', fontSize: '16px', fontWeight: 700, border: 'none', cursor: 'pointer', boxShadow: '0 8px 20px rgba(0,212,192,0.3)' }}
            >
              Пешнамоиш ва Нашр <ArrowRight size={18} />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: Preview */}
      {step === 3 && (
        <div className="fade-up">
          <div className="glass-card" style={{ padding: '48px 32px', textAlign: 'center', marginBottom: '24px', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '100px', background: 'linear-gradient(180deg, rgba(0,212,192,0.1) 0%, transparent 100%)' }} />
            
            <div style={{ fontSize: '64px', marginBottom: '16px', textShadow: '0 10px 20px rgba(0,0,0,0.2)' }}>{flagUrl || '🌍'}</div>
            <h2 style={{ fontSize: '32px', fontWeight: 900, color: 'var(--text-primary)', marginBottom: '12px', letterSpacing: '-1px' }}>{languageName}</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '16px', maxWidth: '600px', margin: '0 auto', lineHeight: 1.6 }}>{description || 'Забони нав омодаи нашр аст.'}</p>
            
            <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', marginTop: '40px' }}>
              <div style={{ background: 'var(--bg-main)', padding: '20px 32px', borderRadius: '16px', border: '1px solid var(--border-color)', boxShadow: '0 8px 16px rgba(0,0,0,0.2)' }}>
                <div style={{ fontSize: '32px', fontWeight: 900, color: 'var(--primary)', marginBottom: '4px' }}>{levels.length}</div>
                <div style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>Сатҳҳо</div>
              </div>
              <div style={{ background: 'var(--bg-main)', padding: '20px 32px', borderRadius: '16px', border: '1px solid var(--border-color)', boxShadow: '0 8px 16px rgba(0,0,0,0.2)' }}>
                <div style={{ fontSize: '32px', fontWeight: 900, color: '#10B981', marginBottom: '4px' }}>
                  {levels.reduce((sum, l) => sum + l.units.length, 0)}
                </div>
                <div style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>Модулҳо</div>
              </div>
              <div style={{ background: 'var(--bg-main)', padding: '20px 32px', borderRadius: '16px', border: '1px solid var(--border-color)', boxShadow: '0 8px 16px rgba(0,0,0,0.2)' }}>
                <div style={{ fontSize: '32px', fontWeight: 900, color: '#F5A623', marginBottom: '4px' }}>{totalWordsCount}</div>
                <div style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>Калимаҳо</div>
              </div>
            </div>
          </div>

          <div style={{ background: 'rgba(56, 189, 248, 0.05)', border: '1px solid rgba(56, 189, 248, 0.2)', padding: '24px', borderRadius: '16px', display: 'flex', gap: '20px', alignItems: 'flex-start', marginBottom: '32px' }}>
            <div style={{ width: 48, height: 48, borderRadius: '12px', background: 'rgba(56, 189, 248, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <LayoutTemplate size={24} color="#38BDF8" />
            </div>
            <div>
              <h4 style={{ color: 'var(--text-primary)', fontSize: '16px', fontWeight: 700, marginBottom: '8px' }}>Омода барои Аппи Мобилӣ</h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.6 }}>
                Пас аз пахши тугмаи "Нашр кардан", ин сохтор ба таври худкор ба базаи маълумотҳои RamzBook пайваст мешавад. <b style={{ color: '#38BDF8' }}>{levels.length} сатҳ</b> дар апп пайдо мешаванд ва ҳамаи калимаҳо барои <b style={{ color: '#38BDF8' }}>дарсҳои интерактивӣ</b> фавран омода мегарданд.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '24px', background: 'var(--bg-elevated)', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
            <button 
              onClick={() => setStep(2)}
              disabled={isSubmitting}
              style={{ padding: '14px 28px', borderRadius: '12px', color: 'var(--text-primary)', fontSize: '15px', fontWeight: 700, background: 'var(--bg-main)', border: '1px solid var(--border-color)', cursor: 'pointer' }}
            >
              Ба қафо (Таҳрир)
            </button>
            <button 
              className="gradient-btn"
              onClick={handlePublish}
              disabled={isSubmitting}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', padding: '14px 40px', borderRadius: '12px', color: '#fff', fontSize: '16px', fontWeight: 800, border: 'none', cursor: isSubmitting ? 'not-allowed' : 'pointer', opacity: isSubmitting ? 0.7 : 1, boxShadow: '0 8px 20px rgba(0,212,192,0.4)' }}
            >
              {isSubmitting ? (
                <>Нашр шуда истодааст...</>
              ) : (
                <><Save size={20} /> НАШР КАРДАН</>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
