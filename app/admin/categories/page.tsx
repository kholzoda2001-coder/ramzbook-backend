'use client';

import { useState, useEffect } from 'react';
import { PlusCircle, Save, Trash2, Edit2, AlertCircle } from 'lucide-react';

export default function CategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState<string | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [color, setColor] = useState('');
  const [icon, setIcon] = useState('');
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/categories');
      const data = await res.json();
      if (Array.isArray(data)) setCategories(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    
    const payload = { name, slug, color, icon, isActive };
    const method = isEditing ? 'PUT' : 'POST';
    const url = isEditing ? `/api/admin/categories/${isEditing}` : '/api/admin/categories';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        const err = await res.json();
        alert(err.error || 'Failed to save');
        return;
      }
      resetForm();
      fetchCategories();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this category?')) return;
    try {
      await fetch(`/api/admin/categories/${id}`, { method: 'DELETE' });
      fetchCategories();
    } catch (e) {
      console.error(e);
    }
  };

  const editMode = (cat: any) => {
    setIsEditing(cat.id);
    setName(cat.name);
    setSlug(cat.slug || '');
    setColor(cat.color || '');
    setIcon(cat.icon || '');
    setIsActive(cat.isActive);
  };

  const resetForm = () => {
    setIsEditing(null);
    setName('');
    setSlug('');
    setColor('');
    setIcon('');
    setIsActive(true);
  };

  return (
    <div>
      <div className="fade-up" style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '26px', fontWeight: 700, color: 'var(--text-primary)' }}>Categories</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '4px' }}>
          Manage your application's book categories.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) 2fr', gap: '24px' }}>
        
        {/* Form Container */}
        <div className="glass-card fade-up" style={{ padding: '24px', height: 'fit-content' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '20px' }}>
            {isEditing ? 'Edit Category' : 'Add New Category'}
          </h2>
          <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>Category Name *</label>
              <input className="input-field" value={name} onChange={e => { setName(e.target.value); if(!isEditing) setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-')); }} placeholder="e.g. History" required />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>Slug</label>
              <input className="input-field" value={slug} onChange={e => setSlug(e.target.value)} placeholder="e.g. history" />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>Color (Hex code)</label>
              <input className="input-field" value={color} onChange={e => setColor(e.target.value)} placeholder="e.g. #FEF3C7" />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>Icon (Lucide name)</label>
              <input className="input-field" value={icon} onChange={e => setIcon(e.target.value)} placeholder="e.g. hourglass" />
            </div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}>
              <input type="checkbox" checked={isActive} onChange={e => setIsActive(e.target.checked)} style={{ width: 16, height: 16 }} />
              Active (Visible in Mobile App)
            </label>
            <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
              <button type="submit" className="gradient-btn" style={{ flex: 1, padding: '10px', borderRadius: '8px', color: '#fff', fontWeight: 600, border: 'none', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px' }}>
                <Save size={16} /> {isEditing ? 'Update' : 'Create'}
              </button>
              {isEditing && (
                <button type="button" onClick={resetForm} style={{ padding: '10px', borderRadius: '8px', background: 'var(--bg-elevated)', border: '1px solid var(--bg-border)', cursor: 'pointer', fontWeight: 600 }}>Cancel</button>
              )}
            </div>
          </form>
        </div>

        {/* List Container */}
        <div className="glass-card fade-up" style={{ padding: '0', overflow: 'hidden' }}>
          {loading ? (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>Loading...</div>
          ) : categories.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>No categories found.</div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead style={{ background: 'rgba(0,0,0,0.02)', borderBottom: '1px solid var(--bg-border)' }}>
                <tr>
                  <th style={{ padding: '16px', textAlign: 'left', color: 'var(--text-secondary)' }}>Name</th>
                  <th style={{ padding: '16px', textAlign: 'left', color: 'var(--text-secondary)' }}>Products</th>
                  <th style={{ padding: '16px', textAlign: 'center', color: 'var(--text-secondary)' }}>Status</th>
                  <th style={{ padding: '16px', textAlign: 'right', color: 'var(--text-secondary)' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((cat) => (
                  <tr key={cat.id} style={{ borderBottom: '1px solid var(--bg-border)' }}>
                    <td style={{ padding: '16px' }}>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{cat.name}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>/{cat.slug}</div>
                    </td>
                    <td style={{ padding: '16px', color: 'var(--text-secondary)' }}>
                      {cat._count?.products || 0} books
                    </td>
                    <td style={{ padding: '16px', textAlign: 'center' }}>
                      <span style={{ display: 'inline-block', padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 600, background: cat.isActive ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', color: cat.isActive ? '#10b981' : '#ef4444' }}>
                        {cat.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td style={{ padding: '16px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                        <button onClick={() => editMode(cat)} style={{ background: 'transparent', border: 'none', color: 'var(--accent-from)', cursor: 'pointer' }}><Edit2 size={16} /></button>
                        <button onClick={() => handleDelete(cat.id)} style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer' }}><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
