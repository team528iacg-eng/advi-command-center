'use client';
import { useState } from 'react';
import { useStore } from '@/lib/store';
import { USERS, STATUSES } from '@/lib/data';

const today = new Date().toISOString().split('T')[0];

export default function MonitorPage() {
  const { user, tasks } = useStore();
  const [scanning, setScanning] = useState(false);
  const [lastScan, setLastScan] = useState<Date | null>(null);

  if (!user) return null;

  if (!user.isAdmin) {
    return (
      <div className="scr">
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, padding: 60, textAlign: 'center' }}>
          <div style={{ fontSize: 48 }}>🔒</div>
          <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--tx)' }}>Admin Only</div>
          <div style={{ fontSize: 13, color: 'var(--tx3)' }}>Workflow Monitor requires <strong>view_monitor</strong> permission.<br />Log in as Hemanth (Admin) to access this page.</div>
        </div>
      </div>
    );
  }

  const overdue = tasks.filter(t => t.due < today && t.status !== 'done');
  const pending = tasks.filter(t => t.status === 'pending_approval');
  const inProgress = tasks.filter(t => t.status === 'in_progress');
  const blocked = tasks.filter(t => t.status === 'review' && t.due < today);

  const issues = [
    ...overdue.map(t => ({ type: 'error', icon: '🔴', title: `Overdue: ${t.title}`, desc: `Due ${t.due} · ${USERS.find(u=>u.id===t.assignees[0])?.name}` })),
    ...blocked.map(t => ({ type: 'warn', icon: '🟡', title: `Blocked in Review: ${t.title}`, desc: `Needs approval from Admin` })),
    ...pending.map(t => ({ type: 'warn', icon: '🟠', title: `Pending Approval: ${t.title}`, desc: `Waiting on decision` })),
  ];

  const runScan = () => {
    setScanning(true);
    setTimeout(() => { setScanning(false); setLastScan(new Date()); }, 2000);
  };

  const stats = [
    { label: 'Total Tasks', value: tasks.length, color: '#7C3AED' },
    { label: 'Overdue',     value: overdue.length, color: '#EF4444' },
    { label: 'Blocked',     value: blocked.length + pending.length, color: '#F97316' },
    { label: 'On Track',    value: inProgress.filter(t => t.due >= today).length, color: '#059669' },
  ];

  return (
    <div className="scr">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 20 }}>
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 800, color: 'var(--tx)', marginBottom: 4 }}>Workflow Monitor</h2>
          <p style={{ fontSize: 13, color: 'var(--tx3)' }}>AI-powered detection of delays, blockers, and workflow issues.{lastScan && ` Last scan: ${lastScan.toLocaleTimeString()}`}</p>
        </div>
        <button onClick={runScan} disabled={scanning} style={{ padding: '5px 12px', borderRadius: 7, border: 'none', background: 'var(--ac)', color: '#fff', fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', opacity: scanning ? .6 : 1 }}>
          {scanning ? '⟳ Scanning…' : '⟳ Run Scan'}
        </button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 20 }}>
        {stats.map(s => (
          <div key={s.label} className="sc">
            <div style={{ fontSize: 26, fontWeight: 800, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--tx)', marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>
      <div className="mon-grid">
        <div className="mon-card">
          <div className="ch"><span className="ct">Detected Issues</span><span className="live"><span className="livdot" />Live</span></div>
          {issues.length === 0 && <div style={{ padding: 24, textAlign: 'center', color: 'var(--tx4)', fontSize: 13 }}>✅ No issues detected</div>}
          {issues.map((iss, i) => (
            <div key={i} className="iss-row">
              <div style={{ fontSize: 18, flexShrink: 0 }}>{iss.icon}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--tx)', marginBottom: 2 }}>{iss.title}</div>
                <div style={{ fontSize: 11, color: 'var(--tx3)' }}>{iss.desc}</div>
              </div>
            </div>
          ))}
        </div>
        <div className="mon-card">
          <div className="ch"><span className="ct">Configuration</span></div>
          {[
            { label: 'Overdue threshold', value: '1 day', on: true },
            { label: 'Auto-escalation', value: 'Enabled', on: true },
            { label: 'Slack alerts', value: 'Disabled', on: false },
            { label: 'AI analysis', value: 'Claude Sonnet', on: true },
            { label: 'Scan interval', value: 'Every 15 min', on: true },
          ].map(cfg => (
            <div key={cfg.label} style={{ display: 'flex', alignItems: 'center', padding: '12px 18px', borderBottom: '1px solid var(--bd)', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 12, color: 'var(--tx2)' }}>{cfg.label}</span>
              <span style={{ fontSize: 11, fontWeight: 700, color: cfg.on ? '#059669' : 'var(--tx4)', background: cfg.on ? '#D1FAE5' : 'var(--bg)', padding: '2px 8px', borderRadius: 4 }}>{cfg.value}</span>
            </div>
          ))}
        </div>
      </div>
      <div style={{ marginTop: 16 }} className="card">
        <div className="ch"><span className="ct">Team Overview</span></div>
        {USERS.map(u => {
          const userTasks = tasks.filter(t => t.assignees.includes(u.id));
          const done = userTasks.filter(t => t.status === 'done').length;
          const active = userTasks.filter(t => t.status !== 'done').length;
          const pct = userTasks.length > 0 ? Math.round((done / userTasks.length) * 100) : 0;
          return (
            <div key={u.id} className="wrow">
              <div className="av" style={{ width: 32, height: 32, fontSize: 11, background: u.bg, color: u.color }}>{u.initials}</div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <div>
                    <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--tx)' }}>{u.name}</span>
                    <span style={{ fontSize: 10, color: 'var(--tx4)', marginLeft: 6 }}>{u.role}</span>
                  </div>
                  <span style={{ fontSize: 11, color: 'var(--tx3)' }}>{done}/{userTasks.length} done · {active} active</span>
                </div>
                <div className="prbar">
                  <div style={{ width: `${pct}%`, height: '100%', background: u.color, borderRadius: 5 }} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
