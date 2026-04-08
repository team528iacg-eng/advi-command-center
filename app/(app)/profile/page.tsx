'use client';
import { useState } from 'react';
import { useStore } from '@/lib/store';
import { USERS } from '@/lib/data';

export default function ProfilePage() {
  const { user } = useStore();
  const [tab, setTab] = useState<'profile' | 'team'>('profile');
  const [name, setName] = useState(user?.name ?? '');
  const [saved, setSaved] = useState(false);

  if (!user) return null;

  const saveProfile = () => { setSaved(true); setTimeout(() => setSaved(false), 2000); };

  const myTasks = useStore(s => s.tasks.filter(t => t.assignees.includes(user.id)));
  const done = myTasks.filter(t => t.status === 'done').length;
  const active = myTasks.filter(t => t.status !== 'done').length;

  return (
    <div className="scr">
      <h2 style={{ fontSize: 18, fontWeight: 800, color: 'var(--tx)', marginBottom: 20 }}>Profile &amp; Settings</h2>
      <div style={{ display: 'flex', gap: 1, background: 'var(--bg)', borderRadius: 8, padding: 3, marginBottom: 24, width: 'fit-content' }}>
        {(['profile', 'team'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} style={{ padding: '6px 18px', borderRadius: 6, border: 'none', background: tab === t ? '#fff' : 'transparent', color: tab === t ? 'var(--tx)' : 'var(--tx3)', fontSize: 12, fontWeight: 600, cursor: 'pointer', boxShadow: tab === t ? '0 1px 3px rgba(0,0,0,.08)' : 'none', fontFamily: 'inherit' }}>
            {t === 'profile' ? 'My Profile' : 'Team'}
          </button>
        ))}
      </div>

      {tab === 'profile' && (
        <div className="prof-grid">
          <div className="prof-card">
            <div className="av" style={{ width: 72, height: 72, fontSize: 26, background: user.bg, color: user.color }}>{user.initials}</div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--tx)' }}>{user.name}</div>
              <div style={{ fontSize: 12, color: 'var(--tx3)', marginTop: 2 }}>{user.role}</div>
              <span className="role-bdg" style={{ background: user.bg, color: user.color, marginTop: 8, display: 'inline-block' }}>{user.role}</span>
            </div>
            <div style={{ width: '100%', borderTop: '1px solid var(--bd)', paddingTop: 14 }}>
              {[
                { label: 'Tasks Active', value: active },
                { label: 'Tasks Done', value: done },
                { label: 'Total Tasks', value: myTasks.length },
              ].map(s => (
                <div key={s.label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 12 }}>
                  <span style={{ color: 'var(--tx3)' }}>{s.label}</span>
                  <span style={{ fontWeight: 700, color: 'var(--tx)' }}>{s.value}</span>
                </div>
              ))}
            </div>
            <div className="online" style={{ margin: 0 }} />
            <span style={{ fontSize: 11, color: '#059669', fontWeight: 600 }}>Online</span>
          </div>

          <div>
            <div className="card" style={{ marginBottom: 16 }}>
              <div className="ch"><span className="ct">Account Details</span></div>
              <div style={{ padding: 20 }}>
                <div className="fld">
                  <label className="flbl">Display Name</label>
                  <input className="finp" value={name} onChange={e => setName(e.target.value)} />
                </div>
                <div className="fld">
                  <label className="flbl">Email</label>
                  <input className="finp" value={user.email} disabled style={{ opacity: .6 }} />
                </div>
                <div className="fld">
                  <label className="flbl">Role</label>
                  <input className="finp" value={user.role} disabled style={{ opacity: .6 }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button onClick={saveProfile} style={{ padding: '8px 20px', borderRadius: 7, border: 'none', background: saved ? '#059669' : 'var(--ac)', color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', transition: 'background .2s' }}>
                    {saved ? '✓ Saved' : 'Save Changes'}
                  </button>
                </div>
              </div>
            </div>
            <div className="card">
              <div className="ch"><span className="ct">Preferences</span></div>
              <div style={{ padding: 20 }}>
                {[
                  { label: 'Email notifications', on: true },
                  { label: 'Task due reminders', on: true },
                  { label: 'Sprint summary digest', on: false },
                  { label: 'AI suggestions', on: true },
                ].map(pref => (
                  <div key={pref.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                    <span style={{ fontSize: 13, color: 'var(--tx2)' }}>{pref.label}</span>
                    <div style={{ width: 36, height: 20, borderRadius: 10, background: pref.on ? '#7C3AED' : 'var(--bd2)', position: 'relative', cursor: 'pointer', transition: 'background .2s' }}>
                      <div style={{ width: 14, height: 14, borderRadius: '50%', background: '#fff', position: 'absolute', top: 3, left: pref.on ? 19 : 3, transition: 'left .2s' }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === 'team' && (
        <div className="card">
          <div className="ch"><span className="ct">Team Members</span><span style={{ fontSize: 11, color: 'var(--tx3)' }}>{USERS.length} members</span></div>
          {USERS.map(u => {
            const uTasks = useStore.getState().tasks.filter(t => t.assignees.includes(u.id));
            const uActive = uTasks.filter(t => t.status !== 'done').length;
            return (
              <div key={u.id} className="team-row">
                <div className="av" style={{ width: 36, height: 36, fontSize: 12, background: u.bg, color: u.color }}>{u.initials}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--tx)' }}>{u.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--tx3)' }}>{u.email}</div>
                </div>
                <span className="role-bdg" style={{ background: u.bg, color: u.color }}>{u.role}</span>
                <span style={{ fontSize: 11, color: 'var(--tx3)', marginLeft: 12 }}>{uActive} active tasks</span>
                <div className="online" style={{ margin: 0 }} />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
