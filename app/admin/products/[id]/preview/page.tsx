'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft, BookOpen, Edit2, Type, FileSpreadsheet,
  ListChecks, BookMarked, Lightbulb, Star, Eye,
} from 'lucide-react';

interface VocabWord {
  emoji?: string; word?: string; originalWord?: string;
  trans_TJ?: string; trans_EN?: string; translation?: string;
  example?: string; exampleTranslation?: string;
}
interface QuizItem {
  question: string; options: string[];
  correctIndex?: number; correctAnswerIndex?: number;
}
interface ModuleData {
  id: string; title: string; isPremium: boolean;
  vocabulary: VocabWord[]; quizzes: QuizItem[];
}
interface AlphabetItem {
  letter: string; transcription: string; explanation: string;
}
interface ReadingStep {
  title: string; description: string;
}

export default function PreviewBookPage() {
  const params = useParams();
  const id = params.id as string;

  const [book, setBook] = useState<any>(null);
  const [modules, setModules] = useState<ModuleData[]>([]);
  const [alphabet, setAlphabet] = useState<AlphabetItem[]>([]);
  const [readingSteps, setReadingSteps] = useState<ReadingStep[]>([]);
  const [proTip, setProTip] = useState<{ title: string; body: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/admin/books/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch book');
        return res.json();
      })
      .then((data) => {
        setBook(data);
        if (data.modulesData && Array.isArray(data.modulesData)) {
          setModules(data.modulesData);
        }
        if (data.alphabet) {
          try {
            const parsed = typeof data.alphabet === 'string' ? JSON.parse(data.alphabet) : data.alphabet;
            if (Array.isArray(parsed)) setAlphabet(parsed);
          } catch { /* ignore */ }
        }
        if (data.readingSteps) {
          try {
            const parsed = typeof data.readingSteps === 'string' ? JSON.parse(data.readingSteps) : data.readingSteps;
            if (Array.isArray(parsed)) setReadingSteps(parsed);
          } catch { /* ignore */ }
        }
        if (data.proTip) {
          try {
            const parsed = typeof data.proTip === 'string' ? JSON.parse(data.proTip) : data.proTip;
            if (parsed && parsed.title) setProTip(parsed);
          } catch { /* ignore */ }
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => setIsLoading(false));
  }, [id]);

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh', color: 'var(--text-muted)' }}>
        Loading Preview…
      </div>
    );
  }

  if (error || !book) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
        <p style={{ fontSize: '16px', fontWeight: 600, color: 'var(--red)', marginBottom: '8px' }}>⚠️ {error || 'Book not found'}</p>
        <Link href="/admin/products" style={{ color: 'var(--accent-from)', textDecoration: 'underline' }}>← Back to list</Link>
      </div>
    );
  }

  const totalWords = modules.reduce((sum, m) => sum + (m.vocabulary?.length || 0), 0);
  const totalQuizzes = modules.reduce((sum, m) => sum + (m.quizzes?.length || 0), 0);

  return (
    <div>
      {/* Header */}
      <div className="fade-up" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px', gap: '16px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <Link href="/admin/products" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 36, height: 36, borderRadius: '9px', background: 'var(--bg-elevated)', border: '1px solid var(--bg-border)', color: 'var(--text-secondary)', textDecoration: 'none' }}>
            <ArrowLeft size={16} />
          </Link>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)' }}>Book Preview</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '2px' }}>Read-only view of all content</p>
          </div>
        </div>
        <Link href={`/admin/products/${id}`} className="gradient-btn" style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', padding: '10px 20px', borderRadius: '9px', color: '#fff', fontSize: '13px', fontWeight: 600, textDecoration: 'none' }}>
          <Edit2 size={14} /> Edit Book
        </Link>
      </div>

      {/* Book Hero Card */}
      <div className="glass-card fade-up" style={{ padding: '28px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
          {/* Cover */}
          <div style={{ width: 140, height: 190, borderRadius: '14px', overflow: 'hidden', flexShrink: 0, background: 'var(--bg-primary)', border: '1px solid var(--bg-border)' }}>
            {book.coverUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={book.coverUrl} alt={book.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <BookOpen size={40} color="var(--text-muted)" />
              </div>
            )}
          </div>

          {/* Metadata */}
          <div style={{ flex: 1, minWidth: '240px' }}>
            <h2 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>{book.title}</h2>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '16px' }}>{book.author}</p>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '16px' }}>
              {book.category && (
                <span style={{ fontSize: '12px', fontWeight: 600, padding: '4px 12px', borderRadius: '99px', background: 'rgba(99,102,241,0.12)', color: '#818cf8', border: '1px solid rgba(99,102,241,0.25)' }}>
                  {book.category}
                </span>
              )}
              <span style={{ fontSize: '12px', fontWeight: 700, padding: '4px 12px', borderRadius: '99px', background: book.isFree ? 'rgba(16,185,129,0.12)' : 'rgba(245,158,11,0.12)', color: book.isFree ? '#10b981' : '#f59e0b' }}>
                {book.isFree ? 'Free' : 'Paid'}
              </span>
              <span style={{ fontSize: '12px', fontWeight: 600, padding: '4px 12px', borderRadius: '99px', background: book.isActive ? 'rgba(16,185,129,0.12)' : 'rgba(245,158,11,0.12)', color: book.isActive ? '#10b981' : '#f59e0b' }}>
                {book.isActive ? 'Published' : 'Draft'}
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: 600, padding: '4px 12px', borderRadius: '99px', background: 'rgba(251,191,36,0.12)', color: '#f59e0b' }}>
                <Star size={11} fill="#f59e0b" strokeWidth={0} /> {book.rating?.toFixed(1) || '4.5'}
              </span>
            </div>

            {/* Stats */}
            <div style={{ display: 'flex', gap: '20px', fontSize: '13px', color: 'var(--text-secondary)' }}>
              <span><strong style={{ color: 'var(--text-primary)' }}>{modules.length}</strong> modules</span>
              <span><strong style={{ color: 'var(--text-primary)' }}>{totalWords}</strong> words</span>
              <span><strong style={{ color: 'var(--text-primary)' }}>{totalQuizzes}</strong> quizzes</span>
              <span><strong style={{ color: 'var(--text-primary)' }}>{alphabet.length}</strong> letters</span>
            </div>

            {book.description && (
              <p style={{ marginTop: '16px', fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>{book.description}</p>
            )}
          </div>
        </div>
      </div>

      {/* Preface */}
      {book.preface && (
        <div className="glass-card fade-up" style={{ padding: '24px', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <BookOpen size={18} color="#8b5cf6" />
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>Preface</h3>
          </div>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.7', whiteSpace: 'pre-wrap' }}>{book.preface}</p>
        </div>
      )}

      {/* Reading Guide */}
      {readingSteps.length > 0 && (
        <div className="glass-card fade-up" style={{ padding: '24px', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
            <BookMarked size={18} color="#2D8C94" />
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>Тарзи омӯзиш ({readingSteps.length} steps)</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {readingSteps.map((step, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', padding: '14px', borderRadius: '12px', background: 'var(--bg-elevated)', border: '1px solid var(--bg-border)' }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent-from), var(--accent-to))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 800, color: '#fff', flexShrink: 0 }}>
                  {i + 1}
                </div>
                <div>
                  <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>{step.title}</p>
                  <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.5' }}>{step.description}</p>
                </div>
              </div>
            ))}
          </div>

          {proTip && (
            <div style={{ marginTop: '20px', padding: '16px', background: 'linear-gradient(135deg, #FFF8ED, #FFF1D6)', borderRadius: '12px', border: '1.5px solid rgba(236, 163, 54, 0.3)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <Lightbulb size={16} color="#ECA336" />
                <span style={{ fontSize: '13px', fontWeight: 700, color: '#9C6A1A' }}>{proTip.title}</span>
              </div>
              <p style={{ fontSize: '13px', color: '#9C6A1A', lineHeight: '1.5' }}>{proTip.body}</p>
            </div>
          )}
        </div>
      )}

      {/* Alphabet */}
      {alphabet.length > 0 && (
        <div className="glass-card fade-up" style={{ padding: '24px', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
            <Type size={18} color="#f59e0b" />
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>Alphabet ({alphabet.length} letters)</h3>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--bg-border)' }}>
                  <th style={{ padding: '10px 16px', textAlign: 'left', fontWeight: 700, color: 'var(--text-muted)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Letter</th>
                  <th style={{ padding: '10px 16px', textAlign: 'left', fontWeight: 700, color: 'var(--text-muted)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Transcription</th>
                  <th style={{ padding: '10px 16px', textAlign: 'left', fontWeight: 700, color: 'var(--text-muted)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Rule</th>
                </tr>
              </thead>
              <tbody>
                {alphabet.map((item, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--bg-border)' }}>
                    <td style={{ padding: '12px 16px', fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)' }}>{item.letter}</td>
                    <td style={{ padding: '12px 16px', color: 'var(--accent-from)', fontWeight: 600 }}>{item.transcription}</td>
                    <td style={{ padding: '12px 16px', color: 'var(--text-secondary)' }}>{item.explanation}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modules */}
      {modules.length > 0 && (
        <div className="glass-card fade-up" style={{ padding: '24px', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
            <FileSpreadsheet size={18} color="#10b981" />
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>Modules ({modules.length})</h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {modules.map((mod, idx) => (
              <div key={mod.id || idx} style={{ background: 'var(--bg-elevated)', border: '1px solid var(--bg-border)', borderRadius: '14px', overflow: 'hidden' }}>
                {/* Module Header */}
                <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--bg-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ background: 'var(--bg-primary)', border: '1px solid var(--bg-border)', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '8px', fontWeight: 'bold', fontSize: '14px', color: 'var(--text-secondary)' }}>{idx + 1}</span>
                    <span style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>{mod.title}</span>
                  </div>
                  <span style={{ fontSize: '12px', fontWeight: 700, padding: '3px 10px', borderRadius: '99px', background: mod.isPremium ? 'rgba(245,158,11,0.12)' : 'rgba(16,185,129,0.12)', color: mod.isPremium ? '#f59e0b' : '#10b981' }}>
                    {mod.isPremium ? 'Premium' : 'Free'}
                  </span>
                </div>

                <div style={{ padding: '20px' }}>
                  {/* Vocabulary */}
                  {mod.vocabulary && mod.vocabulary.length > 0 && (
                    <div style={{ marginBottom: '20px' }}>
                      <h4 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <BookOpen size={14} color="#10b981" /> Vocabulary ({mod.vocabulary.length} words)
                      </h4>
                      <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                          <thead>
                            <tr style={{ borderBottom: '1px solid var(--bg-border)' }}>
                              <th style={{ padding: '8px', textAlign: 'left', color: 'var(--text-muted)', fontSize: '11px' }}>EM</th>
                              <th style={{ padding: '8px', textAlign: 'left', color: 'var(--text-muted)', fontSize: '11px' }}>Word</th>
                              <th style={{ padding: '8px', textAlign: 'left', color: 'var(--text-muted)', fontSize: '11px' }}>Translation</th>
                              <th style={{ padding: '8px', textAlign: 'left', color: 'var(--text-muted)', fontSize: '11px' }}>Example</th>
                            </tr>
                          </thead>
                          <tbody>
                            {mod.vocabulary.map((v, vi) => (
                              <tr key={vi} style={{ borderBottom: '1px solid var(--bg-border)' }}>
                                <td style={{ padding: '8px', fontSize: '16px' }}>{v.emoji || '💬'}</td>
                                <td style={{ padding: '8px', fontWeight: 600, color: 'var(--text-primary)' }}>{v.word || v.originalWord || '—'}</td>
                                <td style={{ padding: '8px', color: 'var(--text-secondary)' }}>{v.translation || '—'}</td>
                                <td style={{ padding: '8px', color: 'var(--text-muted)', fontStyle: 'italic' }}>{v.example || '—'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Quizzes */}
                  {mod.quizzes && mod.quizzes.length > 0 && (
                    <div>
                      <h4 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <ListChecks size={14} color="#ef4444" /> Quizzes ({mod.quizzes.length} questions)
                      </h4>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {mod.quizzes.map((q, qi) => {
                          const correctIdx = q.correctIndex ?? q.correctAnswerIndex ?? 0;
                          return (
                            <div key={qi} style={{ padding: '14px', borderRadius: '10px', background: 'var(--bg-primary)', border: '1px solid var(--bg-border)' }}>
                              <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '10px' }}>
                                Q{qi + 1}: {q.question}
                              </p>
                              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                                {(q.options || []).map((opt, oi) => (
                                  <div key={oi} style={{ padding: '6px 12px', borderRadius: '8px', fontSize: '12px', border: oi === correctIdx ? '2px solid #10b981' : '1px solid var(--bg-border)', background: oi === correctIdx ? 'rgba(16,185,129,0.08)' : 'transparent', color: oi === correctIdx ? '#10b981' : 'var(--text-secondary)', fontWeight: oi === correctIdx ? 700 : 400 }}>
                                    {String.fromCharCode(65 + oi)}) {opt}
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {(!mod.vocabulary || mod.vocabulary.length === 0) && (!mod.quizzes || mod.quizzes.length === 0) && (
                    <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px', padding: '20px 0' }}>This module has no content yet.</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {modules.length === 0 && alphabet.length === 0 && !book.preface && (
        <div className="glass-card fade-up" style={{ padding: '60px 20px', textAlign: 'center' }}>
          <Eye size={40} color="var(--text-muted)" style={{ marginBottom: '12px', opacity: 0.3 }} />
          <p style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>No content added yet</p>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Add modules, alphabet, or a preface in the Edit page.</p>
        </div>
      )}
    </div>
  );
}
