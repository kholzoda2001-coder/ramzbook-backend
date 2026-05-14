"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Globe, Flag, AlignLeft, Layers, Plus, Trash2, 
  ChevronDown, ChevronRight, CheckCircle, ArrowRight, Save, LayoutTemplate
} from 'lucide-react';
import Link from 'next/link';

// Types
type Word = {
  id: string;
  originalWord: string;
  translation: string;
  transcription: string;
  pronunciation: string;
  audioUrl: string;
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
  };

  const addUnit = (levelId: string) => {
    setLevels(prev => prev.map(l => {
      if (l.id === levelId) {
        return { ...l, units: [...l.units, { id: genId(), name: `Unit ${l.units.length + 1}`, lessons: [] }] };
      }
      return l;
    }));
  };

  const addLesson = (levelId: string, unitId: string) => {
    setLevels(prev => prev.map(l => {
      if (l.id === levelId) {
        return {
          ...l, units: l.units.map(u => {
            if (u.id === unitId) {
              return { ...u, lessons: [...u.lessons, { id: genId(), name: `Lesson ${u.lessons.length + 1}`, words: [] }] };
            }
            return u;
          })
        };
      }
      return l;
    }));
  };

  const addWord = (levelId: string, unitId: string, lessonId: string) => {
    setLevels(prev => prev.map(l => {
      if (l.id === levelId) {
        return {
          ...l, units: l.units.map(u => {
            if (u.id === unitId) {
              return {
                ...u, lessons: u.lessons.map(ls => {
                  if (ls.id === lessonId) {
                    return {
                      ...ls, words: [...ls.words, { 
                        id: genId(), originalWord: '', translation: '', transcription: '', pronunciation: '', audioUrl: '' 
                      }]
                    };
                  }
                  return ls;
                })
              };
            }
            return u;
          })
        };
      }
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

  // --- Submit ---
  const handlePublish = async () => {
    setIsSubmitting(true);
    setError(null);

    const payload = {
      languageName,
      languageCode,
      flagUrl,
      description,
      levels: levels.map(l => ({
        name: l.name,
        units: l.units.map(u => ({
          name: u.name,
          lessons: u.lessons.map(ls => ({
            name: ls.name,
            words: ls.words.map(w => ({
              originalWord: w.originalWord,
              translation: w.translation,
              transcription: w.transcription,
              pronunciation: w.pronunciation,
              audioUrl: w.audioUrl
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

      if (!res.ok) {
        throw new Error(data.error || 'Failed to create language');
      }

      router.push('/admin/products');
    } catch (err: any) {
      setError(err.message);
      setIsSubmitting(false);
    }
  };

  // --- UI Helpers ---
  const totalWordsCount = levels.reduce((sum, l) => 
    sum + l.units.reduce((usum, u) => 
      usum + u.lessons.reduce((lsum, ls) => lsum + ls.words.length, 0)
    , 0)
  , 0);

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', paddingBottom: '100px' }}>
      <div className="fade-up" style={{ marginBottom: '30px' }}>
        <h1 style={{ fontSize: '26px', fontWeight: 700, color: 'var(--text-primary)' }}>Add New Language</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '4px' }}>
          Create a complete language course roadmap with levels, units, and vocabulary.
        </p>
      </div>

      {/* Stepper */}
      <div className="glass-card" style={{ padding: '20px', marginBottom: '24px', display: 'flex', gap: '16px' }}>
        {[1, 2, 3].map(s => (
          <div key={s} style={{ display: 'flex', alignItems: 'center', opacity: step >= s ? 1 : 0.4 }}>
            <div style={{ 
              width: 32, height: 32, borderRadius: '50%', 
              background: step === s ? 'var(--primary)' : step > s ? '#10B981' : 'var(--bg-elevated)',
              color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 600, fontSize: '14px'
            }}>
              {step > s ? <CheckCircle size={16} /> : s}
            </div>
            <span style={{ marginLeft: '12px', fontWeight: 600, color: 'var(--text-primary)', fontSize: '14px' }}>
              {s === 1 ? 'Basic Info' : s === 2 ? 'Roadmap Builder' : 'Preview & Publish'}
            </span>
            {s !== 3 && <ChevronRight size={16} style={{ marginLeft: '16px', color: 'var(--text-muted)' }} />}
          </div>
        ))}
      </div>

      {error && (
        <div style={{ padding: '16px', background: 'rgba(239,68,68,0.1)', color: '#ef4444', borderRadius: '12px', marginBottom: '24px', border: '1px solid rgba(239,68,68,0.2)' }}>
          {error}
        </div>
      )}

      {/* STEP 1: Basic Info */}
      {step === 1 && (
        <div className="glass-card fade-up" style={{ padding: '32px' }}>
          <div style={{ display: 'grid', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>Language Name</label>
              <div className="input-group">
                <Globe size={18} />
                <input type="text" placeholder="e.g. English, Russian, Tajik" value={languageName} onChange={e => setLanguageName(e.target.value)} />
              </div>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>Language Code</label>
                <div className="input-group">
                  <AlignLeft size={18} />
                  <input type="text" placeholder="e.g. en, ru, tg" value={languageCode} onChange={e => setLanguageCode(e.target.value)} />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>Flag Emoji / URL</label>
                <div className="input-group">
                  <Flag size={18} />
                  <input type="text" placeholder="e.g. 🇺🇸 or https://..." value={flagUrl} onChange={e => setFlagUrl(e.target.value)} />
                </div>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>Description</label>
              <textarea 
                className="input-group" 
                style={{ width: '100%', minHeight: '100px', padding: '12px', background: 'var(--bg-elevated)', border: '1px solid var(--border-color)', borderRadius: '12px', color: 'var(--text-primary)' }}
                placeholder="Brief description of the course..."
                value={description} onChange={e => setDescription(e.target.value)}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>Generate Initial Levels</label>
              <div style={{ display: 'flex', gap: '12px' }}>
                {[1, 3, 5, 7].map(num => (
                  <button 
                    key={num}
                    onClick={() => handleGenerateLevels(num)}
                    style={{ 
                      padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 600,
                      background: levels.length === num ? 'var(--primary)' : 'var(--bg-elevated)',
                      color: levels.length === num ? '#fff' : 'var(--text-secondary)',
                      border: '1px solid', borderColor: levels.length === num ? 'var(--primary)' : 'var(--border-color)'
                    }}
                  >
                    {num} Levels
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '32px' }}>
            <button 
              className="gradient-btn"
              disabled={!languageName || levels.length === 0}
              onClick={() => setStep(2)}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '12px 24px', borderRadius: '12px', color: '#fff', fontSize: '14px', fontWeight: 600, border: 'none', cursor: 'pointer', opacity: (!languageName || levels.length === 0) ? 0.5 : 1 }}
            >
              Continue to Roadmap <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: Roadmap Builder */}
      {step === 2 && (
        <div className="fade-up">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)' }}>Build Roadmap Structure</h2>
            <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Total words: <b style={{ color: 'var(--primary)' }}>{totalWordsCount}</b></div>
          </div>

          {levels.map((level, lIdx) => (
            <div key={level.id} className="glass-card" style={{ padding: '24px', marginBottom: '24px', borderLeft: '4px solid var(--primary)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Layers size={20} color="var(--primary)" />
                  {level.name}
                </h3>
                <button 
                  onClick={() => addUnit(level.id)}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(56, 189, 248, 0.1)', color: 'var(--primary)', border: '1px solid rgba(56, 189, 248, 0.2)', padding: '8px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
                >
                  <Plus size={14} /> Add Unit
                </button>
              </div>

              <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {level.units.length === 0 && <p style={{ color: 'var(--text-muted)', fontSize: '14px', fontStyle: 'italic' }}>No units added yet.</p>}
                
                {level.units.map((unit, uIdx) => (
                  <div key={unit.id} style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                      <h4 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)' }}>{unit.name}</h4>
                      <button 
                        onClick={() => addLesson(level.id, unit.id)}
                        style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'transparent', color: 'var(--text-secondary)', border: '1px solid var(--border-color)', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}
                      >
                        <Plus size={14} /> Add Lesson
                      </button>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {unit.lessons.length === 0 && <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>No lessons added.</p>}

                      {unit.lessons.map((lesson, lsIdx) => (
                        <div key={lesson.id} style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '8px', padding: '16px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                            <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-secondary)' }}>{lesson.name}</span>
                            <button 
                              onClick={() => addWord(level.id, unit.id, lesson.id)}
                              style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'transparent', color: '#10B981', border: 'none', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
                            >
                              <Plus size={14} /> Add Word
                            </button>
                          </div>

                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {lesson.words.map((word, wIdx) => (
                              <div key={word.id} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr 40px', gap: '8px', alignItems: 'center' }}>
                                <input 
                                  type="text" placeholder="Original (e.g. Apple)" value={word.originalWord}
                                  onChange={e => updateWord(level.id, unit.id, lesson.id, word.id, 'originalWord', e.target.value)}
                                  style={{ background: 'var(--bg-main)', border: '1px solid var(--border-color)', padding: '8px 12px', borderRadius: '6px', color: 'var(--text-primary)', fontSize: '13px' }}
                                />
                                <input 
                                  type="text" placeholder="Translation (e.g. Себ)" value={word.translation}
                                  onChange={e => updateWord(level.id, unit.id, lesson.id, word.id, 'translation', e.target.value)}
                                  style={{ background: 'var(--bg-main)', border: '1px solid var(--border-color)', padding: '8px 12px', borderRadius: '6px', color: 'var(--text-primary)', fontSize: '13px' }}
                                />
                                <input 
                                  type="text" placeholder="Transcription" value={word.transcription}
                                  onChange={e => updateWord(level.id, unit.id, lesson.id, word.id, 'transcription', e.target.value)}
                                  style={{ background: 'var(--bg-main)', border: '1px solid var(--border-color)', padding: '8px 12px', borderRadius: '6px', color: 'var(--text-primary)', fontSize: '13px' }}
                                />
                                <input 
                                  type="text" placeholder="Tajik Pronunciation" value={word.pronunciation}
                                  onChange={e => updateWord(level.id, unit.id, lesson.id, word.id, 'pronunciation', e.target.value)}
                                  style={{ background: 'var(--bg-main)', border: '1px solid var(--border-color)', padding: '8px 12px', borderRadius: '6px', color: 'var(--text-primary)', fontSize: '13px' }}
                                />
                                <button onClick={() => removeWord(level.id, unit.id, lesson.id, word.id)} style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '32px' }}>
            <button 
              onClick={() => setStep(1)}
              style={{ padding: '12px 24px', borderRadius: '12px', color: 'var(--text-secondary)', fontSize: '14px', fontWeight: 600, background: 'transparent', border: '1px solid var(--border-color)', cursor: 'pointer' }}
            >
              Back
            </button>
            <button 
              className="gradient-btn"
              onClick={() => setStep(3)}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '12px 24px', borderRadius: '12px', color: '#fff', fontSize: '14px', fontWeight: 600, border: 'none', cursor: 'pointer' }}
            >
              Preview Language <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: Preview */}
      {step === 3 && (
        <div className="fade-up">
          <div className="glass-card" style={{ padding: '32px', textAlign: 'center', marginBottom: '24px' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>{flagUrl || '🌍'}</div>
            <h2 style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px' }}>{languageName}</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '15px', maxWidth: '600px', margin: '0 auto' }}>{description}</p>
            
            <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', marginTop: '24px' }}>
              <div style={{ background: 'var(--bg-elevated)', padding: '16px 24px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--primary)' }}>{levels.length}</div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px' }}>Levels</div>
              </div>
              <div style={{ background: 'var(--bg-elevated)', padding: '16px 24px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                <div style={{ fontSize: '24px', fontWeight: 800, color: '#10B981' }}>
                  {levels.reduce((sum, l) => sum + l.units.length, 0)}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px' }}>Units</div>
              </div>
              <div style={{ background: 'var(--bg-elevated)', padding: '16px 24px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                <div style={{ fontSize: '24px', fontWeight: 800, color: '#F5A623' }}>{totalWordsCount}</div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px' }}>Words</div>
              </div>
            </div>
          </div>

          <div style={{ background: 'rgba(56, 189, 248, 0.05)', border: '1px solid rgba(56, 189, 248, 0.1)', padding: '20px', borderRadius: '12px', display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
            <LayoutTemplate size={24} color="var(--primary)" style={{ flexShrink: 0 }} />
            <div>
              <h4 style={{ color: 'var(--text-primary)', fontSize: '15px', fontWeight: 600, marginBottom: '4px' }}>Ready for the Mobile App</h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '13px', lineHeight: 1.5 }}>
                When you publish, this structure will automatically map to the mobile app's database format. The {levels.length} levels will appear as books inside the "{languageName}" category, and all units and vocabulary will be instantly playable.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '32px' }}>
            <button 
              onClick={() => setStep(2)}
              disabled={isSubmitting}
              style={{ padding: '12px 24px', borderRadius: '12px', color: 'var(--text-secondary)', fontSize: '14px', fontWeight: 600, background: 'transparent', border: '1px solid var(--border-color)', cursor: 'pointer' }}
            >
              Back to Edit
            </button>
            <button 
              className="gradient-btn"
              onClick={handlePublish}
              disabled={isSubmitting}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '12px 32px', borderRadius: '12px', color: '#fff', fontSize: '15px', fontWeight: 700, border: 'none', cursor: isSubmitting ? 'not-allowed' : 'pointer', opacity: isSubmitting ? 0.7 : 1 }}
            >
              {isSubmitting ? (
                <>Publishing...</>
              ) : (
                <><Save size={18} /> Publish Language</>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
