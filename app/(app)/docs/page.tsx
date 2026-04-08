'use client';
import { useState } from 'react';
import { DOCS } from '@/lib/data';

export default function DocsPage() {
  const [search, setSearch] = useState('');
  const filtered = DOCS.filter(d =>
    d.title.toLowerCase().includes(search.toLowerCase()) ||
    d.type.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="scr">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 20, flexWrap: 'wrap', gap: 10 }}>
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 800, color: 'var(--tx)', marginBottom: 3 }}>Docs &amp; Knowledge</h2>
          <p style={{ fontSize: 12, color: 'var(--tx3)' }}>RAG-indexed library powering your AI assistant</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <input className="finp" style={{ width: 180 }} placeholder="Search…" value={search} onChange={e => setSearch(e.target.value)} />
          <button style={{ padding: '5px 12px', borderRadius: 7, border: 'none', background: 'var(--ac)', color: '#fff', fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>+ Upload</button>
        </div>
      </div>
      <div className="docs-grid">
        {filtered.map(doc => (
          <div key={doc.id} className="dcard">
            <div style={{ width: 44, height: 44, borderRadius: 10, background: 'var(--acl)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>{doc.icon}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--tx)', marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{doc.title}</div>
              <div style={{ fontSize: 11, color: 'var(--tx3)', marginBottom: 8 }}>{doc.type} · {doc.size} · Updated {doc.updated}</div>
              <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                {doc.tags.map(t => (
                  <span key={t} style={{ fontSize: 9, fontWeight: 700, padding: '2px 7px', borderRadius: 4, background: 'var(--bd)', color: 'var(--tx3)' }}>{t}</span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
      {filtered.length === 0 && (
        <div style={{ textAlign: 'center', padding: 60, color: 'var(--tx4)' }}>
          <div style={{ fontSize: 32, marginBottom: 10 }}>📄</div>
          No documents found for &ldquo;{search}&rdquo;
        </div>
      )}
    </div>
  );
}
