'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import Papa from 'papaparse';
import {
  ArrowLeft, BookOpen, Save, Eye, Upload, UploadCloud,
  FileText, DollarSign, Type, FileSpreadsheet, ListChecks, PlusCircle, Trash2, Headphones, AlertCircle, CheckCircle2, BookMarked, Lightbulb
} from 'lucide-react';

/* ─── Shared UI Primitives ─── */
function SectionCard({ icon: Icon, title, subtitle, children, accentColor = 'var(--accent-from)' }: {
  icon: React.ElementType; title: string; subtitle?: string; children: React.ReactNode; accentColor?: string;
}) {
  return (
    <div className="glass-card" style={{ padding: '28px', marginBottom: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', marginBottom: '24px', paddingBottom: '20px', borderBottom: '1px solid var(--bg-border)' }}>
        <div style={{ width: 40, height: 40, borderRadius: '10px', background: `${accentColor}22`, border: `1px solid ${accentColor}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Icon size={18} color={accentColor} />
        </div>
        <div>
          <h2 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '2px' }}>{title}</h2>
          {subtitle && <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{subtitle}</p>}
        </div>
      </div>
      {children}
    </div>
  );
}

function FormRow({ children, cols = 1 }: { children: React.ReactNode; cols?: number }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols},1fr)`, gap: '16px', marginBottom: '16px' }}>
      {children}
    </div>
  );
}

function Label({ htmlFor, children, hint }: { htmlFor?: string; children: React.ReactNode; hint?: string }) {
  return (
    <label htmlFor={htmlFor} style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px' }}>
      {children}
      {hint && <span style={{ fontSize: '11px', fontWeight: 400, color: 'var(--text-muted)', marginLeft: '6px' }}>{hint}</span>}
    </label>
  );
}

function Toggle({ id, checked, onChange }: { id: string; checked: boolean; onChange: () => void }) {
  return (
    <button id={id} type="button" role="switch" aria-checked={checked} onClick={onChange}
      style={{ width: 44, height: 24, borderRadius: '99px', background: checked ? 'linear-gradient(135deg, var(--accent-from), var(--accent-to))' : 'var(--bg-border)', border: 'none', cursor: 'pointer', position: 'relative', transition: 'background 0.2s ease', flexShrink: 0 }}>
      <span style={{ position: 'absolute', top: 3, left: checked ? 23 : 3, width: 18, height: 18, borderRadius: '50%', background: '#fff', transition: 'left 0.2s ease', boxShadow: '0 1px 4px rgba(0,0,0,0.3)' }} />
    </button>
  );
}

/* ─── Interfaces ─── */
export interface VocabRow {
  id: string; emoji: string; word: string; trans_TJ: string; trans_EN: string; translation: string; example: string; exampleTranslation: string; audio: File | null;
  transcriptionEn: string; transcriptionTj: string; exampleEn: string; exampleTj: string;
}
export interface QuizDraft {
  id: string; question: string; options: string[]; correctIndex: number;
}
export interface ModuleDraft {
  id: string; title: string; isPremium: boolean; vocabulary: VocabRow[]; quizzes: QuizDraft[];
}
export interface AlphabetDraft {
  id: string; letter: string; transcription: string; explanation: string; audio: File | null;
}
export interface ReadingStepDraft {
  id: string; title: string; description: string;
}

/* ─── Main Page ─── */
export default function EditBookPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  // Basic Metatdata
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [categoryList, setCategoryList] = useState<any[]>([]);

  // Fetch Categories
  import('react').then((React) => {
    React.useEffect(() => {
      fetch('/api/admin/categories').then(r => r.json()).then(data => {
        if (Array.isArray(data)) setCategoryList(data);
      }).catch(console.error);
    }, []);
  });

  // Cover image — we track both the selected File and an object-URL for preview
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string>(''); // local blob URL or existing remote URL
  const [coverUrl, setCoverUrl] = useState('');               // fallback: manual URL
  const [pdfUrl, setPdfUrl] = useState('');
  const [preface, setPreface] = useState('');
  const [guide, setGuide] = useState('');
  
  // Pricing & Status
  const [isFree, setIsFree] = useState(false);
  const [priceSixMonths, setPriceSixMonths] = useState('19');
  const [priceLifetime, setPriceLifetime] = useState('29');
  const [rating, setRating] = useState('4.5');
  const [isActive, setIsActive] = useState(true);

  // Reading Guide Builder States
  const [readingSteps, setReadingSteps] = useState<ReadingStepDraft[]>([
    { id: '1', title: 'Аввал қоидаро хонед', description: 'Шарҳ ва қоидаҳои навиштиеро, ки ба ҳар як дарс замима шудаанд, бодиққат омӯзед.' },
    { id: '2', title: 'Аудиоро гӯш кунед', description: 'Овозро чанд маротиба бишнавед, то ки талаффузи дурустро дар хотир гиред.' },
    { id: '3', title: 'Бо овози баланд такрор кунед', description: 'Гарчанде ки танҳо бошед, бо овози баланд гап занед.' },
    { id: '4', title: 'Калимаҳоро қайд кунед', description: 'Калимаҳое, ки бароятон нав ё душворанд, бо тугмаи "Қайд" ба луғати шахсии худ илова кунед.' },
    { id: '5', title: 'Мунтазам омӯзед', description: 'Забонро дар як рӯз не, балки ҳар рӯз 15-20 дақиқа хонда ёд мегиранд. Такрори ҳаррӯза калиди муваффақият аст.' },
  ]);
  const [proTipTitle, setProTipTitle] = useState('Маслиҳати тиллоӣ');
  const [proTipBody, setProTipBody] = useState('Агар шумо дар ҷои ҷамъиятӣ бошед ва бо овози баланд такрор карда натавонед, ҳатман наушник (гӯшмонак) истифода баред ва дар дили худ такрор кунед.');

  // New Builder States
  const [alphabet, setAlphabet] = useState<AlphabetDraft[]>([]);
  const [modules, setModules] = useState<ModuleDraft[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCoverUploading, setIsCoverUploading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    fetch(`/api/admin/books/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch book data');
        return res.json();
      })
      .then((data) => {
        setTitle(data.title || '');
        setAuthor(data.author || '');
        setDescription(data.description || '');
        if (data.categoryId) {
          setCategoryId(data.categoryId);
        } else if (data.category && categoryList.length > 0) {
          // fallback
          const matched = categoryList.find(c => c.name === data.category);
          if (matched) setCategoryId(matched.id);
        }
        setCoverUrl(data.coverUrl || '');
        if (data.coverUrl) setCoverPreview(data.coverUrl);
        setPdfUrl(data.pdfUrl || '');
        setPreface(data.preface || '');
        setGuide(data.guide || '');
        setIsFree(!!data.isFree);
        if (data.priceSixMonths) setPriceSixMonths(String(data.priceSixMonths));
        if (data.priceLifetime) setPriceLifetime(String(data.priceLifetime));
        if (data.rating) setRating(String(data.rating));
        setIsActive(!!data.isActive);

        if (data.modulesData && Array.isArray(data.modulesData)) {
          setModules(data.modulesData.map((m: any, i: number) => ({
             ...m,
             id: m.id || `mod-${i}`,
             vocabulary: m.vocabulary || [],
             quizzes: m.quizzes || [],
          })));
        }

        if (data.readingSteps) {
          try {
            const parsed = JSON.parse(data.readingSteps);
            if (Array.isArray(parsed) && parsed.length > 0) {
              setReadingSteps(parsed.map((p, i) => ({ ...p, id: `loaded-${i}` })));
            }
          } catch (e) {
            console.error(e);
          }
        }
        
        if (data.proTip) {
          try {
            const pt = JSON.parse(data.proTip);
            setProTipTitle(pt.title || '');
            setProTipBody(pt.body || '');
          } catch (e) {
            console.error(e);
          }
        }
        
        if (data.alphabet) {
          try {
            const parsedAlph = JSON.parse(data.alphabet);
            if (Array.isArray(parsedAlph)) {
              setAlphabet(parsedAlph.map((a, i) => ({ ...a, id: `alph-${i}` })));
            }
          } catch (e) {
            console.error(e);
          }
        }
      })
      .catch((err) => {
        setSubmitError(err.message || 'Unable to load existing book data.');
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [id]);

  /* ─── Handlers ─── */
  const handleSubmit = async (e: React.FormEvent, asDraft = false) => {
    e.preventDefault();
    setSubmitError(null);
    if (!title.trim()) { setSubmitError('Book title is required.'); return; }
    if (!author.trim()) { setSubmitError('Author name is required.'); return; }
    setIsSubmitting(true);

    try {
      const res = await fetch(`/api/admin/books/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(), author: author.trim(), description: description.trim() || null,
          category: categoryList.find(c => c.id === categoryId)?.name || null,
          categoryId: categoryId || null,
          coverUrl: coverUrl.trim() || null, pdfUrl: pdfUrl.trim() || null,
          preface: preface.trim() || null, guide: guide.trim() || null,
          isFree,
          priceSixMonths: isFree ? null : parseFloat(priceSixMonths) || null,
          priceLifetime: isFree ? null : parseFloat(priceLifetime) || null,
          rating: parseFloat(rating) || 4.5, isActive: asDraft ? false : isActive,
          alphabet: alphabet.length > 0 ? alphabet.map(({ id: _, ...rest }) => rest) : null,
          readingSteps: readingSteps.length > 0 ? readingSteps.map(({ id: _, ...rest }) => rest) : [],
          proTip: { title: proTipTitle, body: proTipBody },
          modulesData: modules.map(({ id: _, ...rest }) => rest), 
        }),
      });

      const data = await res.json();
      if (!res.ok) { setSubmitError(data.error ?? 'An unexpected error occurred.'); return; }

      router.push('/admin/products');
      router.refresh();
    } catch {
      setSubmitError('Network error — could not reach the server.');
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ─── Cover Image Handler ─── */
  const handleCoverChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Revoke old preview to avoid memory leaks
    if (coverPreview && coverPreview.startsWith('blob:')) URL.revokeObjectURL(coverPreview);
    
    setCoverFile(file);
    setCoverPreview(URL.createObjectURL(file));
    setSubmitError(null);
    setIsCoverUploading(true);

    try {
      const uploadForm = new FormData();
      uploadForm.append('file', file);
      
      const uploadRes = await fetch('/api/admin/upload', { 
        method: 'POST', 
        body: uploadForm 
      });
      
      if (!uploadRes.ok) {
        const upErr = await uploadRes.json().catch(() => ({}));
        const errorMsg = upErr.error ?? 'Хатогӣ ҳангоми боргузории расм. Эҳтимол ҳаҷми расм хеле калон аст (аз 4MB хурдтар интихоб кунед).';
        setSubmitError(errorMsg);
        alert(errorMsg);
        setCoverUrl(''); // Reset invalid URL string
      } else {
        const { url } = await uploadRes.json();
        setCoverUrl(url); // Save Vercel Blob generic URL
      }
    } catch {
      setSubmitError('Network error during image upload.');
    } finally {
      setIsCoverUploading(false);
    }
  };

  /* ─── Reading Guide Logic ─── */
  const addReadingStep = () => setReadingSteps([...readingSteps, { id: Date.now().toString(), title: '', description: '' }]);
  const removeReadingStep = (id: string) => setReadingSteps(readingSteps.filter(s => s.id !== id));
  const updateReadingStep = (id: string, field: string, value: string) => setReadingSteps(readingSteps.map(s => s.id === id ? { ...s, [field]: value } : s));

  /* ─── Alphabet Logic ─── */
  const addLetter = () => setAlphabet([...alphabet, { id: Date.now().toString(), letter: '', transcription: '', explanation: '', audio: null }]);
  const removeLetter = (id: string) => setAlphabet(alphabet.filter(l => l.id !== id));
  const updateLetter = (id: string, field: string, value: any) => setAlphabet(alphabet.map(l => l.id === id ? { ...l, [field]: value } : l));

  /* ─── Modules & CSV Logic ─── */
  const addModule = () => setModules([...modules, { id: Date.now().toString(), title: `Module ${modules.length + 1}`, isPremium: modules.length > 0, vocabulary: [], quizzes: [] }]);
  const removeModule = (id: string) => setModules(modules.filter(m => m.id !== id));
  const updateModuleField = (id: string, field: string, value: any) => setModules(modules.map(m => m.id === id ? { ...m, [field]: value } : m));
  
  const handleCSVUpload = (moduleId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true, skipEmptyLines: true,
      complete: (results) => {
        const parsedData: VocabRow[] = results.data.map((row: any, index: number) => ({
          id: `${moduleId}-row-${index}-${Date.now()}`,
          emoji: row.Emoji || row.emoji || '💬', word: row.Word || row.word || '',
          trans_TJ: row.Trans_TJ || row.trans_TJ || '', trans_EN: row.Trans_EN || row.trans_EN || '',
          translation: row.Translation || row.translation || '', example: row.Example || row.example || '',
          exampleTranslation: row.ExampleTranslation || row.exampleTranslation || '', audio: null,
          transcriptionEn: row.TranscriptionEn || row.transcriptionEn || '',
          transcriptionTj: row.TranscriptionTj || row.transcriptionTj || '',
          exampleEn: row.ExampleEn || row.exampleEn || '',
          exampleTj: row.ExampleTj || row.exampleTj || '',
        }));
        setModules(modules.map(mod => mod.id === moduleId ? { ...mod, vocabulary: [...mod.vocabulary, ...parsedData] } : mod));
      },
      error: (err) => alert("Хатогӣ ҳангоми хондани файл: " + err.message)
    });
  };
  const addSingleWord = (moduleId: string) => {
    const newWord: VocabRow = { id: `${moduleId}-manual-${Date.now()}`, emoji: '🆕', word: '', trans_TJ: '', trans_EN: '', translation: '', example: '', exampleTranslation: '', audio: null, transcriptionEn: '', transcriptionTj: '', exampleEn: '', exampleTj: '' };
    setModules(modules.map(mod => mod.id === moduleId ? { ...mod, vocabulary: [...mod.vocabulary, newWord] } : mod));
  };

  /* ─── Nested Module Quiz Logic ─── */
  const addModuleQuiz = (moduleId: string) => setModules(modules.map(m => m.id === moduleId ? { ...m, quizzes: [...m.quizzes, { id: Date.now().toString(), question: '', options: ['', '', '', ''], correctIndex: 0 }] } : m));
  const removeModuleQuiz = (moduleId: string, quizId: string) => setModules(modules.map(m => m.id === moduleId ? { ...m, quizzes: m.quizzes.filter(q => q.id !== quizId) } : m));
  const updateModuleQuizField = (moduleId: string, quizId: string, field: string, value: any) => setModules(modules.map(m => m.id === moduleId ? { ...m, quizzes: m.quizzes.map(q => q.id === quizId ? { ...q, [field]: value } : q) } : m));
  const updateModuleQuizOption = (moduleId: string, quizId: string, optIndex: number, value: string) => setModules(modules.map(m => m.id === moduleId ? { ...m, quizzes: m.quizzes.map(q => { if (q.id === quizId) { const newOpts = [...q.options]; newOpts[optIndex] = value; return { ...q, options: newOpts }; } return q; }) } : m));

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh', color: 'var(--text-muted)' }}>
        Loading Book Data...
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* Page Header */}
      <div className="fade-up" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px', gap: '16px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <Link href="/admin/products" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 36, height: 36, borderRadius: '9px', background: 'var(--bg-elevated)', border: '1px solid var(--bg-border)', color: 'var(--text-secondary)', textDecoration: 'none' }}>
            <ArrowLeft size={16} />
          </Link>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)' }}>Edit Book</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '2px' }}>Update existing e-book details</p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {submitError && <p style={{ fontSize: '12px', color: 'var(--red)', maxWidth: '260px' }}>⚠️ {submitError}</p>}
          <button type="button" onClick={(e) => handleSubmit(e, true)} disabled={isSubmitting || isCoverUploading}
            style={{ padding: '10px 18px', borderRadius: '9px', background: 'var(--bg-elevated)', border: '1px solid var(--bg-border)', color: 'var(--text-secondary)', fontSize: '13px', fontWeight: 600, cursor: (isSubmitting || isCoverUploading) ? 'not-allowed' : 'pointer', opacity: (isSubmitting || isCoverUploading) ? 0.6 : 1, display: 'flex', alignItems: 'center', gap: '7px' }}>
            <Save size={14} />{isCoverUploading ? 'Uploading Image…' : isSubmitting ? 'Saving…' : 'Save Draft'}
          </button>
          <button type="submit" className="gradient-btn" disabled={isSubmitting || isCoverUploading}
            style={{ padding: '10px 20px', borderRadius: '9px', color: '#fff', fontSize: '13px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '7px', cursor: (isSubmitting || isCoverUploading) ? 'not-allowed' : 'pointer', opacity: (isSubmitting || isCoverUploading) ? 0.7 : 1 }}>
            <Eye size={14} />{isCoverUploading ? 'Uploading Image…' : isSubmitting ? 'Updating…' : 'Update Book'}
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '20px', alignItems: 'start' }}>
        {/* Left Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Basic Info */}
          <SectionCard icon={BookOpen} title="Basic Information" subtitle="Core details about this book">
            <FormRow>
              <div>
                <Label htmlFor="title">Book Title <span style={{ color: 'var(--red)' }}>*</span></Label>
                <input id="title" className="input-field" placeholder="e.g. Tajik for Beginners" value={title} onChange={(e) => setTitle(e.target.value)} required />
              </div>
            </FormRow>
            <FormRow cols={2}>
              <div>
                <Label htmlFor="author">Author <span style={{ color: 'var(--red)' }}>*</span></Label>
                <input id="author" className="input-field" placeholder="e.g. N. Nazarov" value={author} onChange={(e) => setAuthor(e.target.value)} required />
              </div>
              <div>
                <Label htmlFor="category">Category</Label>
                <select id="category" className="input-field" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
                  <option value="">— Select —</option>
                  {categoryList.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
            </FormRow>
            <FormRow>
              <div>
                <Label htmlFor="description">Description</Label>
                <textarea id="description" className="input-field" placeholder="Write an engaging description…" value={description} onChange={(e) => setDescription(e.target.value)} rows={4} style={{ resize: 'vertical', lineHeight: '1.6' }} />
              </div>
            </FormRow>
            <FormRow>
              <div>
                <Label htmlFor="coverUpload">Cover Image</Label>
                {/* ── Drop zone / file picker ── */}
                <label
                  htmlFor="coverUpload"
                  style={{
                    display: 'flex', alignItems: 'center', gap: '14px',
                    padding: '12px 16px', borderRadius: '12px',
                    border: '2px dashed var(--bg-border)',
                    background: 'var(--bg-elevated)', cursor: 'pointer',
                    transition: 'border-color 0.2s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--accent-from)')}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--bg-border)')}
                >
                  {/* Preview thumbnail */}
                  <div style={{
                    width: 64, height: 80, borderRadius: '10px', flexShrink: 0,
                    overflow: 'hidden', background: 'var(--bg-primary)',
                    border: '1px solid var(--bg-border)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {coverPreview
                      ? <img src={coverPreview} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : <BookOpen size={22} color="var(--text-muted)" />}
                  </div>

                  {/* Label text */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '3px' }}>
                      {coverFile ? coverFile.name : 'Click to update cover image'}
                    </p>
                    <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                      {coverFile
                        ? `${(coverFile.size / 1024).toFixed(0)} KB · ${coverFile.type}`
                        : 'PNG, JPG, WEBP up to 10 MB'}
                    </p>
                  </div>

                  {/* Upload icon badge */}
                  <div style={{
                    width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                    background: 'rgba(45,140,148,0.12)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {isCoverUploading
                      ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent-from)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ animation: 'spin 0.8s linear infinite' }}><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
                      : <Upload size={16} color="var(--accent-from)" />}
                  </div>

                  <input
                    id="coverUpload"
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={handleCoverChange}
                  />
                </label>

                {/* Optional manual URL fallback */}
                {(!coverFile) && (
                  <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>or paste URL:</span>
                    <input
                      className="input-field"
                      placeholder="https://example.com/cover.jpg"
                      value={coverUrl}
                      onChange={e => {
                         setCoverUrl(e.target.value);
                         setCoverPreview(e.target.value);
                      }}
                      style={{ fontSize: '12px', padding: '6px 10px' }}
                    />
                  </div>
                )}

                {(coverFile || coverPreview) && (
                  <button
                    type="button"
                    onClick={() => { setCoverFile(null); if (coverPreview && coverPreview.startsWith('blob:')) URL.revokeObjectURL(coverPreview); setCoverPreview(''); setCoverUrl(''); }}
                    style={{ marginTop: '6px', fontSize: '11px', color: 'var(--red)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                  >
                    ✕ Remove image
                  </button>
                )}
              </div>
            </FormRow>
          </SectionCard>

          {/* Reader Content */}
          <SectionCard icon={FileText} title="Reader Content" subtitle="Preface and reading guide" accentColor="#8b5cf6">
            <FormRow>
              <div>
                <Label htmlFor="preface">Author's Preface</Label>
                <textarea id="preface" className="input-field" rows={3} placeholder="Welcome to the course…" value={preface} onChange={(e) => setPreface(e.target.value)} />
              </div>
            </FormRow>
            <FormRow>
              <div>
                <Label htmlFor="guide">Reading Guide</Label>
                <textarea id="guide" className="input-field" rows={3} placeholder="1. Study 15 mins daily…" value={guide} onChange={(e) => setGuide(e.target.value)} />
              </div>
            </FormRow>
          </SectionCard>

          {/* Reading Guide Builder */}
          <SectionCard icon={BookMarked} title="Тарзи омӯзиш (Reading Guide)" subtitle="Dynamic steps shown before the first lesson" accentColor="#2D8C94">
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '16px', padding: '10px', background: 'var(--bg-primary)', borderRadius: '8px' }}>
              💡 These steps show as the numbered timeline cards in the mobile app's "Тарзи омӯзиш" screen. Default steps are pre-filled.
            </p>

            {/* Steps Builder */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
              {readingSteps.map((step, idx) => (
                <div key={step.id} style={{ position: 'relative', background: 'var(--bg-elevated)', border: '1px solid var(--bg-border)', borderRadius: '12px', padding: '16px', paddingLeft: '52px' }}>
                  {/* Step Number Badge */}
                  <div style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent-from), var(--accent-to))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 800, color: '#fff' }}>
                    {idx + 1}
                  </div>
                  <button type="button" onClick={() => removeReadingStep(step.id)} style={{ position: 'absolute', top: '10px', right: '10px', background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><Trash2 size={14} /></button>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <input
                      type="text"
                      className="input-field"
                      value={step.title}
                      onChange={(e) => updateReadingStep(step.id, 'title', e.target.value)}
                      placeholder="Step title (e.g. Аудиоро гӯш кунед)"
                      style={{ fontWeight: 700 }}
                    />
                    <textarea
                      className="input-field"
                      value={step.description}
                      onChange={(e) => updateReadingStep(step.id, 'description', e.target.value)}
                      placeholder="Explanation shown below the title..."
                      rows={2}
                      style={{ resize: 'vertical', lineHeight: 1.5 }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <button type="button" onClick={addReadingStep} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: '8px', background: 'rgba(45, 140, 148, 0.1)', color: 'var(--accent-from)', border: '1px solid rgba(45, 140, 148, 0.2)', fontSize: '13px', fontWeight: 600, cursor: 'pointer', marginBottom: '28px' }}>
              <PlusCircle size={16} /> Add Step
            </button>

            {/* Pro Tip Box */}
            <div style={{ padding: '20px', background: 'linear-gradient(135deg, #FFF8ED, #FFF1D6)', borderRadius: '14px', border: '1.5px solid rgba(236, 163, 54, 0.3)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                <Lightbulb size={18} color="#ECA336" />
                <span style={{ fontSize: '13px', fontWeight: 700, color: '#9C6A1A' }}>"Маслиҳати тиллоӣ" Box</span>
              </div>
              <FormRow>
                <div>
                  <Label>Pro Tip Title</Label>
                  <input type="text" className="input-field" value={proTipTitle} onChange={(e) => setProTipTitle(e.target.value)} placeholder="Маслиҳати тиллоӣ" />
                </div>
              </FormRow>
              <FormRow>
                <div>
                  <Label>Pro Tip Body</Label>
                  <textarea className="input-field" value={proTipBody} onChange={(e) => setProTipBody(e.target.value)} rows={3} placeholder="The golden tip text shown at the bottom..." style={{ resize: 'vertical', lineHeight: 1.5 }} />
                </div>
              </FormRow>
            </div>
          </SectionCard>

          {/* Alphabet Setup */}
          <SectionCard icon={Type} title="Alphabet & Pronunciation" subtitle="Setup initial phonetic rules" accentColor="#f59e0b">
            <button type="button" onClick={addLetter} style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: '8px', background: 'rgba(245, 158, 11, 0.1)', color: '#d97706', border: '1px solid rgba(245, 158, 11, 0.2)', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
              <PlusCircle size={16} /> Иловаи ҳарф
            </button>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {alphabet.map((item) => (
                <div key={item.id} style={{ position: 'relative', display: 'grid', gridTemplateColumns: 'minmax(60px, 1fr) 2fr 3fr auto', gap: '10px', background: 'var(--bg-elevated)', border: '1px solid var(--bg-border)', padding: '16px', borderRadius: '12px' }}>
                  <button type="button" onClick={() => removeLetter(item.id)} style={{ position: 'absolute', top: '-10px', right: '-10px', background: 'var(--red)', color: '#fff', border: 'none', borderRadius: '50%', width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>✕</button>
                  <div>
                    <Label htmlFor={`letter-${item.id}`}>Letter</Label>
                    <input id={`letter-${item.id}`} className="input-field" placeholder="A a" style={{ textAlign: 'center', fontWeight: 'bold' }} value={item.letter} onChange={(e) => updateLetter(item.id, 'letter', e.target.value)} />
                  </div>
                  <div>
                    <Label htmlFor={`trans-${item.id}`}>Transcription</Label>
                    <input id={`trans-${item.id}`} className="input-field" placeholder="[ a ]" value={item.transcription} onChange={(e) => updateLetter(item.id, 'transcription', e.target.value)} />
                  </div>
                  <div>
                    <Label htmlFor={`rule-${item.id}`}>Rule</Label>
                    <input id={`rule-${item.id}`} className="input-field" placeholder="Pronunciation rule..." value={item.explanation} onChange={(e) => updateLetter(item.id, 'explanation', e.target.value)} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', border: '1px dashed var(--accent-from)', padding: '10px', borderRadius: '8px', height: '42px', color: 'var(--accent-from)', background: 'rgba(45, 140, 148, 0.05)' }}>
                      <Headphones size={16} />
                      <span style={{ fontSize: '12px', fontWeight: 600 }}>{item.audio ? 'Uploaded' : 'Audio'}</span>
                      <input type="file" style={{ display: 'none' }} accept="audio/*" onChange={(e) => { if (e.target.files?.[0]) updateLetter(item.id, 'audio', e.target.files[0]); }} />
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>

          {/* Modules & CSV UI & Nested Quizzes */}
          <SectionCard icon={FileSpreadsheet} title="Modules & Vocabulary" subtitle="Mass import via CSV and define bound Quizzes" accentColor="#10b981">
            <button type="button" onClick={addModule} style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.1)', color: '#059669', border: '1px solid rgba(16, 185, 129, 0.2)', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
              <PlusCircle size={16} /> Add Module
            </button>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
              {modules.map((mod, index) => (
                <div key={mod.id} style={{ background: 'var(--bg-elevated)', border: '1px solid var(--bg-border)', borderRadius: '14px', overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
                  
                  {/* Module Header */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', borderBottom: '1px solid var(--bg-border)', background: 'rgba(255,255,255,0.02)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                      <span style={{ background: 'var(--bg-primary)', border: '1px solid var(--bg-border)', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '8px', fontWeight: 'bold', fontSize: '14px', color: 'var(--text-secondary)' }}>{index + 1}</span>
                      <input type="text" className="input-field" style={{ border: 'none', background: 'transparent', fontSize: '18px', fontWeight: 'bold', padding: 0, boxShadow: 'none' }} value={mod.title} placeholder="Module Title" onChange={(e) => updateModuleField(mod.id, 'title', e.target.value)} />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer', fontWeight: 600, color: mod.isPremium ? '#f59e0b' : '#10b981' }}>
                        {mod.isPremium ? 'Premium' : 'Free'}
                        <Toggle id={`toggle-${mod.id}`} checked={mod.isPremium} onChange={() => updateModuleField(mod.id, 'isPremium', !mod.isPremium)} />
                      </label>
                      <button type="button" onClick={() => removeModule(mod.id)} style={{ color: 'var(--text-muted)', background: 'transparent', border: 'none', cursor: 'pointer' }}><Trash2 size={18} /></button>
                    </div>
                  </div>
                  
                  {/* Vocabulary Section */}
                  <div style={{ padding: '20px' }}>
                    <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <BookOpen size={16} color="#10b981" /> Lesson Vocabulary
                    </h3>
                    {mod.vocabulary.length === 0 ? (
                      <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '140px', border: '2px dashed var(--accent-from)', background: 'rgba(45, 140, 148, 0.05)', borderRadius: '10px', cursor: 'pointer', opacity: 0.8, transition: 'opacity 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.opacity = '1'} onMouseLeave={(e) => e.currentTarget.style.opacity = '0.8'}>
                        <UploadCloud size={32} color="var(--accent-from)" style={{ marginBottom: '8px' }} />
                        <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--accent-from)' }}>Drop CSV File Here</span>
                        <input type="file" style={{ display: 'none' }} accept=".csv" onChange={(e) => handleCSVUpload(mod.id, e)} />
                      </label>
                    ) : (
                      <div style={{ marginBottom: '8px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                           <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>{mod.vocabulary.length} Words Loaded</span>
                           <button type="button" onClick={() => addSingleWord(mod.id)} style={{ fontSize: '12px', fontWeight: 600, color: 'var(--accent-from)', background: 'rgba(45,140,148,0.08)', border: '1px solid rgba(45,140,148,0.2)', borderRadius: '7px', cursor: 'pointer', padding: '5px 12px', display: 'flex', alignItems: 'center', gap: '5px' }}><PlusCircle size={13} /> Add Word</button>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                          {mod.vocabulary.map((vocab, vIdx) => {
                            const upd = (field: keyof VocabRow, val: any) => { const c = [...mod.vocabulary]; (c[vIdx] as any)[field] = val; updateModuleField(mod.id, 'vocabulary', c); };
                            return (
                              <div key={vocab.id} style={{ background: 'var(--bg-primary)', border: '1px solid var(--bg-border)', borderRadius: '12px', overflow: 'hidden', transition: 'border-color 0.2s' }}>
                                {/* Row 1 — Emoji · Word · Translation · Audio · Delete */}
                                <div style={{ display: 'grid', gridTemplateColumns: '48px 1fr 1fr auto auto', gap: '8px', alignItems: 'center', padding: '10px 12px', borderBottom: '1px solid var(--bg-border)', background: 'rgba(255,255,255,0.015)' }}>
                                  <input type="text" value={vocab.emoji} onChange={(e) => upd('emoji', e.target.value)} title="Emoji" style={{ fontSize: '20px', textAlign: 'center', background: 'transparent', border: 'none', outline: 'none', width: '100%' }} />
                                  <input type="text" value={vocab.word} onChange={(e) => upd('word', e.target.value)} placeholder="Word" style={{ background: 'transparent', border: 'none', outline: 'none', fontWeight: 700, fontSize: '14px', color: 'var(--text-primary)', width: '100%' }} />
                                  <input type="text" value={vocab.translation} onChange={(e) => upd('translation', e.target.value)} placeholder="Translation" style={{ background: 'transparent', border: 'none', outline: 'none', fontSize: '13px', color: 'var(--text-secondary)', width: '100%' }} />
                                  {vocab.audio ? (
                                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'rgba(16,185,129,0.1)', color: '#059669', padding: '4px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 600, whiteSpace: 'nowrap' }}><Headphones size={12} /> OK</span>
                                  ) : (
                                    <label style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'rgba(239,68,68,0.1)', color: '#dc2626', padding: '4px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                                      <AlertCircle size={12} /> Audio<input type="file" style={{ display: 'none' }} accept="audio/*" onChange={(e) => { if (e.target.files?.[0]) upd('audio', e.target.files[0]); }} />
                                    </label>
                                  )}
                                  <button type="button" onClick={() => updateModuleField(mod.id, 'vocabulary', mod.vocabulary.filter(v => v.id !== vocab.id))} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}><Trash2 size={14} /></button>
                                </div>
                                {/* Row 2 — Transcriptions */}
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', padding: '8px 12px', borderBottom: '1px solid var(--bg-border)' }}>
                                  <div>
                                    <p style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>Transcription EN</p>
                                    <input type="text" value={vocab.transcriptionEn || ''} onChange={(e) => upd('transcriptionEn', e.target.value)} placeholder="[ ˈfɑːðər ]" className="input-field" style={{ fontSize: '13px', padding: '7px 10px', fontFamily: 'monospace' }} />
                                  </div>
                                  <div>
                                    <p style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>Transcription TJ</p>
                                    <input type="text" value={vocab.transcriptionTj || ''} onChange={(e) => upd('transcriptionTj', e.target.value)} placeholder="[ фазер ]" className="input-field" style={{ fontSize: '13px', padding: '7px 10px', fontFamily: 'monospace' }} />
                                  </div>
                                </div>
                                {/* Row 3 — Examples */}
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', padding: '8px 12px' }}>
                                  <div>
                                    <p style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>Example EN</p>
                                    <input type="text" value={vocab.exampleEn || ''} onChange={(e) => upd('exampleEn', e.target.value)} placeholder="My father is kind." className="input-field" style={{ fontSize: '13px', padding: '7px 10px' }} />
                                  </div>
                                  <div>
                                    <p style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>Example TJ</p>
                                    <input type="text" value={vocab.exampleTj || ''} onChange={(e) => upd('exampleTj', e.target.value)} placeholder="Падари ман меҳрубон аст." className="input-field" style={{ fontSize: '13px', padding: '7px 10px' }} />
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Nested Quizzes Section */}
                    <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '2px dashed var(--bg-border)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                        <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <ListChecks size={16} color="#ef4444" /> End-of-Module Quiz
                        </h3>
                        <button type="button" onClick={() => addModuleQuiz(mod.id)} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', borderRadius: '8px', background: 'rgba(239, 68, 68, 0.1)', color: '#dc2626', border: '1px solid rgba(239, 68, 68, 0.2)', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>
                          <PlusCircle size={14} /> Add Question
                        </button>
                      </div>

                      {mod.quizzes.length === 0 ? (
                        <p style={{ fontSize: '13px', color: 'var(--text-muted)', textAlign: 'center', padding: '16px 0', background: 'var(--bg-primary)', borderRadius: '8px' }}>No quiz questions yet. Add one to test users after this module.</p>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                          {mod.quizzes.map((quiz, qIdx) => (
                            <div key={quiz.id} style={{ background: 'var(--bg-primary)', border: '1px solid var(--bg-border)', padding: '16px', borderRadius: '12px', position: 'relative' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                                <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)' }}>Question {qIdx + 1}</span>
                                <button type="button" onClick={() => removeModuleQuiz(mod.id, quiz.id)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><Trash2 size={16} /></button>
                              </div>
                              <input type="text" className="input-field" value={quiz.question} onChange={(e) => updateModuleQuizField(mod.id, quiz.id, 'question', e.target.value)} placeholder="Type the question text..." style={{ marginBottom: '16px' }} />
                              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                {quiz.options.map((opt, oIdx) => (
                                  <div key={oIdx} style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                                    <button type="button" onClick={() => updateModuleQuizField(mod.id, quiz.id, 'correctIndex', oIdx)} style={{ position: 'absolute', left: '10px', width: '20px', height: '20px', borderRadius: '50%', background: quiz.correctIndex === oIdx ? '#10b981' : 'transparent', border: quiz.correctIndex === oIdx ? 'none' : '2px solid var(--bg-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                                      {quiz.correctIndex === oIdx && <CheckCircle2 size={12} color="#fff" />}
                                    </button>
                                    <input type="text" className="input-field" style={{ paddingLeft: '40px', borderColor: quiz.correctIndex === oIdx ? '#10b981' : 'var(--bg-border)' }} value={opt} onChange={(e) => updateModuleQuizOption(mod.id, quiz.id, oIdx, e.target.value)} placeholder={`Option ${oIdx + 1}`} />
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>
        </div>

        {/* Right Column */}
        <div style={{ position: 'sticky', top: '84px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Pricing & Status */}
          <SectionCard icon={DollarSign} title="Pricing & Status" subtitle="Configure access and visibility" accentColor="#10b981">
            {/* Free toggle */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px', borderRadius: '10px', background: isFree ? 'rgba(16,185,129,0.1)' : 'var(--bg-elevated)', border: isFree ? '1px solid rgba(16,185,129,0.3)' : '1px solid var(--bg-border)', marginBottom: '16px', transition: 'background 0.2s ease, border-color 0.2s ease' }}>
              <div>
                <p style={{ fontSize: '13px', fontWeight: 600, color: isFree ? '#10b981' : 'var(--text-secondary)' }}>Free Access</p>
                <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Available without payment</p>
              </div>
              <Toggle id="free-toggle" checked={isFree} onChange={() => setIsFree(!isFree)} />
            </div>

            {/* Premium Pricing Inputs (Conditional) */}
            {!isFree && (
              <div style={{ padding: '16px', background: 'var(--bg-primary)', borderRadius: '10px', border: '1px solid var(--bg-border)', marginBottom: '20px', animation: 'fadeIn 0.3s ease' }}>
                <FormRow cols={2}>
                  <div>
                    <Label>6-Month (TJS)</Label>
                    <input type="number" min="0" step="1" className="input-field" value={priceSixMonths} onChange={(e) => setPriceSixMonths(e.target.value)} placeholder="19" />
                  </div>
                  <div>
                    <Label>Lifetime (TJS)</Label>
                    <input type="number" min="0" step="1" className="input-field" value={priceLifetime} onChange={(e) => setPriceLifetime(e.target.value)} placeholder="29" />
                  </div>
                </FormRow>
                <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>VIP is global (99 TJS) and fixed.</p>
              </div>
            )}

            {/* Active toggle */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px', borderRadius: '10px', background: isActive ? 'rgba(99,102,241,0.1)' : 'var(--bg-elevated)', border: isActive ? '1px solid rgba(99,102,241,0.3)' : '1px solid var(--bg-border)', marginBottom: '16px' }}>
              <div>
                <p style={{ fontSize: '13px', fontWeight: 600, color: isActive ? 'var(--accent-from)' : 'var(--text-secondary)' }}>Published</p>
                <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Visible in the app catalog</p>
              </div>
              <Toggle id="active-toggle" checked={isActive} onChange={() => setIsActive(!isActive)} />
            </div>

            {/* Rating */}
            <div>
              <Label htmlFor="rating">Rating (1.0 – 5.0)</Label>
              <input id="rating" type="number" min="1" max="5" step="0.1" className="input-field" value={rating} onChange={(e) => setRating(e.target.value)} />
            </div>
          </SectionCard>
        </div>
      </div>
    </form>
  );
}
