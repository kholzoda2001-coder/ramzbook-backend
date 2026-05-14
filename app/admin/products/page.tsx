import Link from 'next/link';
import { PlusCircle, BookOpen, AlertTriangle, Globe } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import ProductsTable from './_components/ProductsTable';

export const dynamic = 'force-dynamic';

export default async function ProductsListPage() {
  let books: {
    id: string; title: string; author: string; category: string;
    isFree: boolean; status: string; rating: number;
    coverUrl: string | null; pdfUrl: string | null; createdAt: string;
  }[] = [];
  let dbError: string | null = null;

  try {
    const products = await prisma.product.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true, title: true, author: true, category: true,
        isFree: true, isActive: true, coverUrl: true, pdfUrl: true,
        rating: true, createdAt: true,
      },
    });
    books = products.map((p) => ({
      id: p.id, title: p.title, author: p.author,
      category: p.category ?? '—',
      isFree: p.isFree,
      status: p.isActive ? 'ACTIVE' : 'DRAFT',
      rating: p.rating,
      coverUrl: p.coverUrl,
      pdfUrl: p.pdfUrl,
      createdAt: p.createdAt.toISOString().split('T')[0],
    }));
  } catch (err) {
    console.error('[admin/products] DB error:', err);
    dbError = err instanceof Error ? err.message : 'Unknown database error';
  }

  if (dbError) {
    return (
      <div style={{ padding: '40px 20px', textAlign: 'center', maxWidth: 600, margin: '0 auto' }}>
        <AlertTriangle size={40} color="#ef4444" style={{ marginBottom: 16 }} />
        <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>
          Database Connection Error
        </h2>
        <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 16 }}>
          Could not connect to the database. Please verify that <code>DATABASE_URL</code> is correctly
          set in your Vercel environment variables and that the Hostinger MySQL server allows remote connections.
        </p>
        <code style={{
          display: 'block', fontSize: 12, background: 'rgba(239,68,68,0.08)',
          border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8,
          padding: '12px 16px', color: '#ef4444', wordBreak: 'break-all', textAlign: 'left',
        }}>
          {dbError}
        </code>
      </div>
    );
  }

  return (
    <div>
      <div className="fade-up" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '28px', gap: '16px', flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontSize: '26px', fontWeight: 700, color: 'var(--text-primary)' }}>E-books</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '4px' }}>
            {books.length} book{books.length !== 1 ? 's' : ''} in the database
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <Link
            href="/admin/languages/new"
            className="gradient-btn"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '11px 20px', borderRadius: '10px', color: '#fff', fontSize: '14px', fontWeight: 600, textDecoration: 'none', background: 'linear-gradient(135deg, #4B6BFB, #00D4C0)' }}
          >
            <Globe size={16} />
            Add New Language
          </Link>
          <Link
            href="/admin/products/new"
            className="glass-card"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '11px 20px', borderRadius: '10px', color: 'var(--text-primary)', fontSize: '14px', fontWeight: 600, textDecoration: 'none', border: '1px solid rgba(255,255,255,0.1)' }}
          >
            <PlusCircle size={16} />
            Add New Book
          </Link>
        </div>
      </div>

      {books.length === 0 ? (
        <div className="glass-card fade-up" style={{ padding: '80px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
          <BookOpen size={48} style={{ marginBottom: '16px', opacity: 0.2 }} />
          <p style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px' }}>No e-books yet</p>
          <p style={{ fontSize: '14px', marginBottom: '24px' }}>
            Click &ldquo;Add New Book&rdquo; to publish your first e-book to the live database.
          </p>
          <Link
            href="/admin/products/new"
            className="gradient-btn"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '11px 22px', borderRadius: '10px', color: '#fff', fontSize: '14px', fontWeight: 600, textDecoration: 'none' }}
          >
            <PlusCircle size={16} />
            Add First Book
          </Link>
        </div>
      ) : (
        <ProductsTable books={books} />
      )}
    </div>
  );
}
