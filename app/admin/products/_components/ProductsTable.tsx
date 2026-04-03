'use client';

import Link from 'next/link';
import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search, BookOpen, MoreVertical, Edit2, Trash2,
  Eye, ChevronUp, ChevronDown, Filter, Star,
} from 'lucide-react';

type Book = {
  id: string;
  title: string;
  author: string;
  category: string;
  isFree: boolean;
  status: string;
  rating: number;
  coverUrl: string | null;
  pdfUrl: string | null;
  createdAt: string;
};

type SortKey = 'title' | 'createdAt' | 'rating';

const statusMeta: Record<string, { label: string; color: string; bg: string }> = {
  ACTIVE: { label: 'Active', color: '#10b981', bg: 'rgba(16,185,129,0.12)' },
  DRAFT:  { label: 'Draft',  color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
};

export default function ProductsTable({ books }: { books: Book[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [sortKey, setSortKey] = useState<SortKey>('createdAt');
  const [sortAsc, setSortAsc] = useState(false);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortAsc(!sortAsc);
    else { setSortKey(key); setSortAsc(true); }
  };

  const filtered = books
    .filter((b) => {
      const matchSearch =
        b.title.toLowerCase().includes(search.toLowerCase()) ||
        b.author.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === 'ALL' || b.status === statusFilter;
      return matchSearch && matchStatus;
    })
    .sort((a, b) => {
      let aVal: string | number = a[sortKey];
      let bVal: string | number = b[sortKey];
      if (typeof aVal === 'string') aVal = aVal.toLowerCase();
      if (typeof bVal === 'string') bVal = bVal.toLowerCase();
      if (aVal < bVal) return sortAsc ? -1 : 1;
      if (aVal > bVal) return sortAsc ? 1 : -1;
      return 0;
    });

  const SortIcon = ({ col }: { col: SortKey }) =>
    sortKey === col
      ? sortAsc ? <ChevronUp size={13} /> : <ChevronDown size={13} />
      : <ChevronDown size={13} style={{ opacity: 0.3 }} />;

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this book? This action cannot be undone.')) return;
    setDeletingId(id);
    setOpenMenu(null);
    try {
      const res = await fetch(`/api/admin/books/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed');
      startTransition(() => router.refresh());
    } catch {
      alert('Failed to delete. Please try again.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <>
      {/* Filters */}
      <div className="fade-up delay-1" style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: '1 1 240px' }}>
          <Search size={15} color="var(--text-muted)" style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)' }} />
          <input className="input-field" placeholder="Search by title or author…" value={search} onChange={(e) => setSearch(e.target.value)} style={{ paddingLeft: '38px', height: '40px', fontSize: '13px' }} />
        </div>

        <div style={{ display: 'flex', gap: '4px', background: 'var(--bg-elevated)', border: '1px solid var(--bg-border)', borderRadius: '10px', padding: '3px' }}>
          {['ALL', 'ACTIVE', 'DRAFT'].map((s) => (
            <button key={s} onClick={() => setStatusFilter(s)} style={{ padding: '5px 14px', borderRadius: '7px', fontSize: '12px', fontWeight: 600, border: 'none', cursor: 'pointer', transition: 'background 0.15s ease, color 0.15s ease', background: statusFilter === s ? 'var(--bg-surface)' : 'transparent', color: statusFilter === s ? 'var(--text-primary)' : 'var(--text-muted)', boxShadow: statusFilter === s ? '0 1px 4px rgba(0,0,0,0.25)' : 'none' }}>
              {s === 'ALL' ? 'All' : s.charAt(0) + s.slice(1).toLowerCase()}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-muted)', padding: '0 4px' }}>
          <Filter size={13} /> Click column headers to sort
        </div>
      </div>

      {/* Table */}
      <div className="glass-card fade-up delay-2" style={{ overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--bg-border)' }}>
                {[
                  { label: 'Title & Author', key: 'title' as SortKey },
                  { label: 'Category',       key: null },
                  { label: 'Pricing',        key: null },
                  { label: 'Rating',         key: 'rating' as SortKey },
                  { label: 'Status',         key: null },
                  { label: 'Added',          key: 'createdAt' as SortKey },
                  { label: '',               key: null },
                ].map((col, i) => (
                  <th key={i} onClick={() => col.key && toggleSort(col.key)} style={{ padding: '14px 20px', textAlign: 'left', fontSize: '11px', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--text-muted)', cursor: col.key ? 'pointer' : 'default', userSelect: 'none', whiteSpace: 'nowrap' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      {col.label}
                      {col.key && <SortIcon col={col.key} />}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '14px' }}>
                    <BookOpen size={32} style={{ marginBottom: '12px', opacity: 0.3 }} />
                    <p>No books match your search.</p>
                  </td>
                </tr>
              ) : (
                filtered.map((book, idx) => {
                  const sm = statusMeta[book.status] ?? statusMeta.DRAFT;
                  return (
                    <tr
                      key={book.id}
                      style={{ borderBottom: idx < filtered.length - 1 ? '1px solid var(--bg-border)' : 'none', transition: 'background 0.15s ease', opacity: deletingId === book.id ? 0.4 : 1 }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-elevated)')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      {/* Title + Author */}
                      <td style={{ padding: '16px 20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          {book.coverUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={book.coverUrl} alt={book.title} style={{ width: 38, height: 48, objectFit: 'cover', borderRadius: '8px', flexShrink: 0 }} onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                          ) : (
                            <div style={{ width: 38, height: 38, borderRadius: '10px', flexShrink: 0, background: 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(139,92,246,0.2))', border: '1px solid rgba(99,102,241,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <BookOpen size={16} color="#818cf8" />
                            </div>
                          )}
                          <div>
                            <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '2px' }}>{book.title}</p>
                            <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{book.author}</p>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td style={{ padding: '16px 20px' }}>
                        {book.category !== '—' ? (
                          <span style={{ fontSize: '12px', fontWeight: 600, padding: '3px 10px', borderRadius: '99px', background: 'rgba(99,102,241,0.12)', color: '#818cf8', border: '1px solid rgba(99,102,241,0.25)' }}>
                            {book.category}
                          </span>
                        ) : (
                          <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>—</span>
                        )}
                      </td>

                      {/* Pricing */}
                      <td style={{ padding: '16px 20px' }}>
                        <span style={{ fontSize: '12px', fontWeight: 700, padding: '3px 10px', borderRadius: '99px', background: book.isFree ? 'rgba(16,185,129,0.12)' : 'rgba(245,158,11,0.12)', color: book.isFree ? '#10b981' : '#f59e0b' }}>
                          {book.isFree ? 'Free' : 'Paid'}
                        </span>
                      </td>

                      {/* Rating */}
                      <td style={{ padding: '16px 20px' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '13px', fontWeight: 600, color: 'var(--yellow)' }}>
                          <Star size={13} fill="var(--yellow)" strokeWidth={0} />
                          {book.rating.toFixed(1)}
                        </span>
                      </td>

                      {/* Status */}
                      <td style={{ padding: '16px 20px' }}>
                        <span style={{ fontSize: '11px', fontWeight: 700, padding: '3px 10px', borderRadius: '99px', background: sm.bg, color: sm.color, border: `1px solid ${sm.color}44` }}>
                          {sm.label}
                        </span>
                      </td>

                      {/* Date */}
                      <td style={{ padding: '16px 20px' }}>
                        <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                          {new Date(book.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      </td>

                      {/* Actions */}
                      <td style={{ padding: '16px 20px' }}>
                        <div style={{ position: 'relative' }}>
                          <button onClick={() => setOpenMenu(openMenu === book.id ? null : book.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', padding: '4px', borderRadius: '6px' }}>
                            <MoreVertical size={16} />
                          </button>
                          {openMenu === book.id && (
                            <div style={{ position: 'absolute', right: 0, top: 'calc(100% + 4px)', background: 'var(--bg-surface)', border: '1px solid var(--bg-border)', borderRadius: '10px', padding: '6px', minWidth: '148px', zIndex: 100, boxShadow: '0 8px 24px rgba(0,0,0,0.4)' }}>
                              {[
                                { icon: Eye,   label: 'Preview',   color: 'var(--text-secondary)', onClick: () => setOpenMenu(null) },
                                { icon: Edit2, label: 'Edit Book', color: 'var(--text-secondary)', onClick: () => { setOpenMenu(null); router.push(`/admin/products/${book.id}/edit`); } },
                                { icon: Trash2, label: 'Delete',   color: 'var(--red)',            onClick: () => handleDelete(book.id) },
                              ].map(({ icon: Icon, label, color, onClick }) => (
                                <button key={label} onClick={onClick} style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', padding: '8px 12px', borderRadius: '7px', background: 'none', border: 'none', cursor: 'pointer', color, fontSize: '13px', fontWeight: 500, transition: 'background 0.12s ease', textAlign: 'left' }}
                                  onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-elevated)')}
                                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                                >
                                  <Icon size={14} /> {label}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div style={{ padding: '14px 20px', borderTop: '1px solid var(--bg-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            Showing {filtered.length} of {books.length} result{books.length !== 1 ? 's' : ''}
          </p>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Live data — Hostinger MySQL</p>
        </div>
      </div>
    </>
  );
}
