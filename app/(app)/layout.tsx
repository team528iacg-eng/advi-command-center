'use client';
import { useEffect, useState, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useStore } from '@/lib/store';
import { USERS, STATUSES } from '@/lib/data';
import NewTaskModal from '@/components/NewTaskModal';
import Toast, { useToast } from '@/components/Toast';

const NAV = [
  { href: '/dashboard', label: 'Dashboard', icon: '⊞', id: 'home' },
  { href: '/work',      label: 'My Work',   icon: '◎', id: 'work' },
  { href: '/inbox',     label: 'Inbox',     icon: '✉', id: 'inbox', badge: true },
];
const INTEL = [
  { href: '/ai-gen',   label: 'AI Generator', icon: '⚡' },
  { href: '/ai',       label: 'AI Assistant', icon: '✦' },
  { href: '/docs',     label: 'Docs',         icon: '📄' },
  { href: '/monitor',  label: 'Monitor',      icon: '📊' },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout, tasks, messages } = useStore();
  const [showNewTask, setShowNewTask] = useState(false);
  const { toasts, addToast } = useToast();

  useEffect(() => {
    if (!user) router.push('/login');
  }, [user, router]);

  if (!user) return null;

  const unread = messages.filter(m => m.to === user.id).length;
  const myTasks = tasks.filter(t => t.assignees.includes(user.id) && t.status !== 'done').length;
  const pending = tasks.filter(t => t.status === 'pending_approval');

  const doSignOut = () => { logout(); router.push('/login'); };

  return (
    <div className="app-shell">
      {/* Sidebar */}
      <aside className="sb">
        <div className="sbh">
          <div className="ws">
            <div className="wsl">A</div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--tx)' }}>Advi Studio</div>
              <div style={{ fontSize: 10, color: 'var(--tx4)' }}>Business Plan</div>
            </div>
          </div>
        </div>
        <div className="srch" onClick={() => addToast('⌕', '⌘K opens command palette', '#7C3AED')}>
          <span>⌕</span><span style={{ flex: 1 }}>Search…</span><span className="kbd">⌘K</span>
        </div>
        <nav>
          {NAV.map(n => (
            <Link key={n.href} href={n.href} style={{ textDecoration: 'none' }}>
              <div className={`ni ${pathname.startsWith(n.href) ? 'on' : ''}`}>
                <span className="ic">{n.icon}</span>
                {n.label}
                {n.id === 'work' && myTasks > 0 && <span className="nbdg">{myTasks}</span>}
                {n.id === 'inbox' && unread > 0 && <span className="nbdg" style={{ background: '#7C3AED', color: '#fff' }}>{unread}</span>}
              </div>
            </Link>
          ))}
          {pending.length > 0 && (
            <Link href="/work" style={{ textDecoration: 'none' }}>
              <div style={{ margin: '4px 0', padding: '6px 9px', borderRadius: 7, background: '#FFF7ED', border: '1.5px solid #FED7AA', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                <span>⏳</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#C2410C', flex: 1 }}>Pending Approval</span>
                <span style={{ fontSize: 9, fontWeight: 700, padding: '1px 6px', borderRadius: 8, background: '#F97316', color: '#fff' }}>{pending.length}</span>
              </div>
            </Link>
          )}
          <div className="ndiv" />
          <div className="nsec">Spaces</div>
          {[
            { id: '528', name: '🎬 528 Film', color: '#7C3AED', count: tasks.filter(t=>['l1','l2'].includes(t.list)).length },
            { id: 'rz',  name: '⚡ RenderZero', color: '#0EA5E9', count: tasks.filter(t=>['l3','l4'].includes(t.list)).length },
            { id: 'lab', name: '🧪 AI Experience Lab', color: '#10B981', count: tasks.filter(t=>t.list==='l5').length },
          ].map(sp => (
            <div key={sp.id} className="sp-row">
              <div className={`sp-item ${pathname.includes(sp.id) ? 'on' : ''}`}>
                <span className="spdot" style={{ background: sp.color }} />
                <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{sp.name}</span>
                <span className="nbdg">{sp.count}</span>
              </div>
            </div>
          ))}
          <div className="ndiv" />
          <div className="nsec">Intelligence</div>
          {INTEL.map(n => (
            <Link key={n.href} href={n.href} style={{ textDecoration: 'none' }}>
              <div className={`ni ${pathname === n.href ? 'on' : ''}`}>
                <span className="ic">{n.icon}</span>{n.label}
              </div>
            </Link>
          ))}
        </nav>
        <div className="sbf">
          <button className="vbtn" onClick={() => addToast('🎙', 'Voice commands require microphone access', '#7C3AED')}>🎙 Voice Command</button>
          <Link href="/profile" style={{ textDecoration: 'none' }}>
            <div className="urow">
              <div className="av" style={{ width: 28, height: 28, fontSize: 11, background: user.bg, color: user.color }}>{user.initials}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--tx)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.name}</div>
                <div style={{ fontSize: 10, color: 'var(--tx3)' }}>{user.role}</div>
              </div>
              <div className="online" />
            </div>
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6 }}>
            <span className="role-bdg" style={{ background: user.bg, color: user.color }}>{user.role}</span>
            <button onClick={doSignOut} style={{ flex: 1, padding: 5, borderRadius: 7, border: '1.5px solid var(--bd)', background: 'transparent', color: 'var(--tx3)', fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>Sign Out</button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="main">
        <div className="topbar">
          <span className="ttl" id="page-title">
            {NAV.concat(INTEL as any).find(n => pathname.startsWith(n.href))?.label ?? 'Advi'}
          </span>
          <span className="live"><span className="livdot" />Live</span>
          <div className="tdiv" />
          <button className="tbtn v" onClick={() => addToast('🎙', 'Voice commands require microphone access', '#7C3AED')}>🎙 Voice</button>
          <button className="tbtn" onClick={() => setShowNewTask(true)}>+ Task</button>
          <Link href="/ai-gen"><button className="tbtn p">⚡ Generate</button></Link>
        </div>
        {children}
      </div>

      {showNewTask && <NewTaskModal onClose={() => setShowNewTask(false)} />}
      <Toast toasts={toasts} />
    </div>
  );
}
