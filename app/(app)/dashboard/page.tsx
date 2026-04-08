'use client';
import { useStore } from '@/lib/store';
import { USERS, STATUSES, LISTS, PRIORITIES } from '@/lib/data';

const today = new Date().toISOString().split('T')[0];

function StatCard({ label, value, sub, color }: { label: string; value: string | number; sub: string; color: string }) {
  return (
    <div className="sc">
      <div style={{ fontSize: 22, fontWeight: 800, color }}>{value}</div>
      <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--tx)', marginTop: 2 }}>{label}</div>
      <div style={{ fontSize: 11, color: 'var(--tx3)', marginTop: 2 }}>{sub}</div>
    </div>
  );
}

export default function DashboardPage() {
  const { user, tasks } = useStore();
  if (!user) return null;

  const dueToday = tasks.filter(t => t.due === today && t.status !== 'done');
  const overdue = tasks.filter(t => t.due < today && t.status !== 'done');
  const inProgress = tasks.filter(t => t.status === 'in_progress');
  const done = tasks.filter(t => t.status === 'done');

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  const workload = USERS.map(u => ({
    user: u,
    count: tasks.filter(t => t.assignees.includes(u.id) && t.status !== 'done').length,
    total: tasks.filter(t => t.assignees.includes(u.id)).length,
  }));

  const getStatus = (id: string) => STATUSES.find(s => s.id === id);
  const getList = (id: string) => LISTS.find(l => l.id === id);
  const getPriority = (id: string) => PRIORITIES.find(p => p.id === id);

  const alerts = [
    ...overdue.slice(0, 3).map(t => ({ type: 'error', msg: `${t.title} is overdue`, icon: '🔴' })),
    ...tasks.filter(t => t.status === 'pending_approval').map(t => ({ type: 'warn', msg: `${t.title} needs approval`, icon: '🟡' })),
  ];

  return (
    <div className="scr">
      {tasks.filter(t => t.status === 'pending_approval').length > 0 && (
        <div className="ap" style={{ marginBottom: 20 }}>
          <div className="aph">
            <span style={{ fontSize: 13 }}>⏳</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#C2410C' }}>Pending Approval</span>
            <span style={{ fontSize: 9, fontWeight: 700, padding: '1px 6px', borderRadius: 8, background: '#F97316', color: '#fff', marginLeft: 'auto' }}>{tasks.filter(t => t.status === 'pending_approval').length}</span>
          </div>
          {tasks.filter(t => t.status === 'pending_approval').map(t => (
            <div key={t.id} className="apr">
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--tx)' }}>{t.title}</div>
                <div style={{ fontSize: 11, color: 'var(--tx3)' }}>{getList(t.list)?.name}</div>
              </div>
              <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: '#FEF3C7', color: '#D97706' }}>Pending</span>
            </div>
          ))}
        </div>
      )}

      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--tx)', marginBottom: 4 }}>{greeting}, {user.name.split(' ')[0]} 👋</h2>
        <p style={{ fontSize: 13, color: 'var(--tx3)' }}>
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })} · {dueToday.length} due today · {overdue.length} overdue
        </p>
      </div>

      <div className="sg">
        <StatCard label="In Progress" value={inProgress.length} sub="Active tasks" color="#7C3AED" />
        <StatCard label="Due Today" value={dueToday.length} sub="Need attention" color="#F97316" />
        <StatCard label="Overdue" value={overdue.length} sub="Past deadline" color="#EF4444" />
        <StatCard label="Completed" value={done.length} sub="This sprint" color="#059669" />
      </div>

      <div className="g2">
        <div className="card">
          <div className="ch">
            <span className="ct">Due Today</span>
            <button onClick={() => window.location.href = '/work'} style={{ fontSize: 11, color: '#7C3AED', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, fontFamily: 'inherit' }}>View all →</button>
          </div>
          <div style={{ maxHeight: 260, overflowY: 'auto' }}>
            {dueToday.length === 0 && <div style={{ padding: '24px', textAlign: 'center', color: 'var(--tx4)', fontSize: 13 }}>🎉 Nothing due today</div>}
            {dueToday.map(t => {
              const st = getStatus(t.status);
              return (
                <div key={t.id} className="drow">
                  <div style={{ width: 8, height: 8, borderRadius: 2, background: getList(t.list)?.color, flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--tx)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.title}</div>
                    <div style={{ fontSize: 11, color: 'var(--tx3)' }}>{getList(t.list)?.name}</div>
                  </div>
                  <span className="sbdg" style={{ color: st?.color, background: st?.bg }}>{st?.label}</span>
                </div>
              );
            })}
          </div>
        </div>
        <div className="card">
          <div className="ch"><span className="ct">Active Sprints</span></div>
          {[
            { name: 'Sprint 3 — Prologue', progress: 65, start: 'Mar 10', end: 'Mar 20', color: '#7C3AED' },
            { name: 'Sprint 1 — RenderZero', progress: 40, start: 'Mar 14', end: 'Mar 28', color: '#0EA5E9' },
          ].map(s => (
            <div key={s.name} style={{ padding: '14px 18px', borderBottom: '1px solid var(--bd)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--tx)' }}>{s.name}</div>
                <div style={{ fontSize: 11, fontWeight: 700, color: s.color }}>{s.progress}%</div>
              </div>
              <div className="prbar"><div style={{ width: `${s.progress}%`, height: '100%', background: s.color, borderRadius: 5 }} /></div>
              <div style={{ fontSize: 10, color: 'var(--tx4)', marginTop: 4 }}>{s.start} – {s.end}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="g2">
        <div className="card">
          <div className="ch"><span className="ct">Team Workload</span></div>
          {workload.map(w => (
            <div key={w.user.id} className="wrow">
              <div className="av" style={{ width: 28, height: 28, fontSize: 10, background: w.user.bg, color: w.user.color }}>{w.user.initials}</div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--tx)' }}>{w.user.name.split(' ')[0]}</span>
                  <span style={{ fontSize: 11, color: 'var(--tx3)' }}>{w.count} active</span>
                </div>
                <div className="prbar">
                  <div style={{ width: `${Math.min(100, (w.count / Math.max(1, w.total)) * 100)}%`, height: '100%', background: w.user.color, borderRadius: 5 }} />
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="card">
          <div className="ch"><span className="ct">⚡ AI Monitor Alerts</span><span className="live"><span className="livdot" />Live</span></div>
          {alerts.length === 0 && <div style={{ padding: 24, textAlign: 'center', color: 'var(--tx4)', fontSize: 13 }}>✅ No issues detected</div>}
          {alerts.map((a, i) => (
            <div key={i} className="arow">
              <div style={{ width: 20, height: 20, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, flexShrink: 0, marginTop: 1 }}>{a.icon}</div>
              <div style={{ fontSize: 12, color: 'var(--tx2)' }}>{a.msg}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
