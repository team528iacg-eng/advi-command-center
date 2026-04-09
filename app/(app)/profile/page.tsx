'use client';
import { useState } from 'react';
import { useStore } from '@/lib/store';
import { User, STATUSES } from '@/lib/data';

const ROLES = ['Admin', 'Director', 'Producer', 'Sound Designer', 'Editor', 'Member'];
const PALETTE = [
  { color: '#7C3AED', bg: '#EDE9FE' }, { color: '#059669', bg: '#D1FAE5' },
  { color: '#D97706', bg: '#FEF3C7' }, { color: '#2563EB', bg: '#DBEAFE' },
  { color: '#DB2777', bg: '#FCE7F3' }, { color: '#0EA5E9', bg: '#E0F2FE' },
];

export default function ProfilePage() {
  const { user, users, tasks, updateUser, removeUser, addUser } = useStore();
  const [tab, setTab] = useState<'profile' | 'team'>('profile');
  const [name, setName] = useState(user?.name ?? '');
  const [saved, setSaved] = useState(false);
  // Add member form
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState('Member');
  const [newPwd, setNewPwd] = useState('');

  if (!user) return null;

  const saveProfile = () => {
    const trimmed = name.trim();
    if (trimmed) updateUser(user.id, { name: trimmed });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleRoleChange = (uid: string, role: string) => {
    updateUser(uid, { role, isAdmin: role === 'Admin' });
  };

  const handleAddMember = () => {
    if (!newName.trim() || !newEmail.trim()) return;
    const id = 'u' + Date.now();
    const initials = newName.trim().split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase();
    const pal = PALETTE[users.length % PALETTE.length];
    addUser({
      id, name: newName.trim(), role: newRole,
      email: newEmail.trim(), password: newPwd || 'pass123',
      initials, color: pal.color, bg: pal.bg, isAdmin: newRole === 'Admin',
    });
    setShowAdd(false); setNewName(''); setNewEmail(''); setNewRole('Member'); setNewPwd('');
  };

  const myTasks = tasks.filter(t => t.assignees.includes(user.id));
  const done   = myTasks.filter(t => t.status === 'done').length;
  const active = myTasks.filter(t => t.status !== 'done').length;

  return (
    <div className="scr">
      <h2 style={{ fontSize: 18, fontWeight: 800, color: 'var(--tx)', marginBottom: 20 }}>Profile &amp; Settings</h2>
      <div style={{ display: 'flex', gap: 1, background: 'var(--bg)', borderRadius: 8, padding: 3, marginBottom: 24, width: 'fit-content' }}>
        {(['profile', 'team'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} style={{ padding: '6px 18px', borderRadius: 6, border: 'none', background: tab === t ? '#fff' : 'transparent', color: tab === t ? 'var(--tx)' : 'var(--tx3)', fontSize: 12, fontWeight: 600, cursor: 'pointer', boxShadow: tab === t ? '0 1px 3px rgba(0,0,0,.08)' : 'none', fontFamily: 'inherit' }}>
            {t === 'profile' ? 'My Profile' : user.isAdmin ? 'Team & Admin' : 'Team'}
          </button>
        ))}
      </div>

      {tab === 'profile' && (
        <div className="prof-grid">
          <div className="prof-card">
            <div className="av" style={{ width: 72, height: 72, fontSize: 26, background: user.bg, color: user.color }}>{user.initials}</div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--tx)' }}>{user.name}</div>
              <div style={{ fontSize: 12, color: 'var(--tx3)', marginTop: 2 }}>{user.email}</div>
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
                  <input className="finp" value={name} onChange={e => setName(e.target.value)} onKeyDown={e => e.key === 'Enter' && saveProfile()} />
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
              <div className="ch"><span className="ct">My Tasks</span><span style={{ fontSize: 11, color: 'var(--tx3)' }}>{myTasks.length} assigned</span></div>
              <div style={{ padding: '0 0 8px' }}>
                {myTasks.length === 0 && <div style={{ padding: '16px 20px', fontSize: 12, color: 'var(--tx4)' }}>No tasks assigned yet.</div>}
                {myTasks.slice(0, 8).map(t => {
                  const st = STATUSES.find(s => s.id === t.status);
                  return (
                    <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 20px', borderBottom: '1px solid var(--bd2)' }}>
                      <span style={{ width: 8, height: 8, borderRadius: '50%', background: st?.color, flexShrink: 0 }} />
                      <span style={{ flex: 1, fontSize: 13, color: 'var(--tx)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.title}</span>
                      <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 5, background: st?.bg, color: st?.color }}>{st?.label}</span>
                      {t.due && <span style={{ fontSize: 10, color: 'var(--tx4)' }}>{t.due.slice(5)}</span>}
                    </div>
                  );
                })}
                {myTasks.length > 8 && <div style={{ padding: '8px 20px', fontSize: 11, color: 'var(--tx4)' }}>+ {myTasks.length - 8} more</div>}
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === 'team' && (
        <div>
          {user.isAdmin && (
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
              <button onClick={() => setShowAdd(true)} style={{ padding: '8px 16px', borderRadius: 7, border: 'none', background: 'var(--ac)', color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                + Add Member
              </button>
            </div>
          )}

          <div className="card">
            <div className="ch">
              <span className="ct">Team Members</span>
              <span style={{ fontSize: 11, color: 'var(--tx3)' }}>{users.length} members</span>
            </div>
            {users.map(u => {
              const uTasks = tasks.filter(t => t.assignees.includes(u.id));
              const uActive = uTasks.filter(t => t.status !== 'done').length;
              const isSelf = u.id === user.id;
              return (
                <div key={u.id} className="team-row" style={{ alignItems: 'center' }}>
                  <div className="av" style={{ width: 36, height: 36, fontSize: 12, background: u.bg, color: u.color }}>{u.initials}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--tx)' }}>{u.name}{isSelf && <span style={{ fontSize: 10, color: 'var(--tx4)', fontWeight: 400, marginLeft: 6 }}>(you)</span>}</div>
                    <div style={{ fontSize: 11, color: 'var(--tx3)' }}>{u.email}</div>
                  </div>

                  {user.isAdmin ? (
                    <select
                      value={u.role}
                      onChange={e => handleRoleChange(u.id, e.target.value)}
                      style={{ padding: '4px 8px', borderRadius: 6, border: '1.5px solid var(--bd2)', background: u.bg, color: u.color, fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', outline: 'none' }}
                    >
                      {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                  ) : (
                    <span className="role-bdg" style={{ background: u.bg, color: u.color }}>{u.role}</span>
                  )}

                  <span style={{ fontSize: 11, color: 'var(--tx3)', minWidth: 80, textAlign: 'right' }}>{uActive} active</span>
                  <div className="online" style={{ margin: '0 0 0 8px' }} />

                  {user.isAdmin && !isSelf && (
                    <button
                      onClick={() => removeUser(u.id)}
                      title="Remove user"
                      style={{ width: 24, height: 24, borderRadius: 6, border: '1.5px solid var(--bd2)', background: 'transparent', color: 'var(--tx4)', fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1, marginLeft: 4, flexShrink: 0 }}
                    >
                      ×
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Add Member Modal */}
      {showAdd && (
        <div className="overlay on" onClick={e => e.target === e.currentTarget && setShowAdd(false)}>
          <div className="modal" style={{ maxWidth: 360 }}>
            <div className="mh">
              <span className="mttl">Add Team Member</span>
              <button className="mcl" onClick={() => setShowAdd(false)}>×</button>
            </div>
            <div className="fld">
              <label className="flbl">Full Name *</label>
              <input className="finp" placeholder="Jane Smith" value={newName} onChange={e => setNewName(e.target.value)} />
            </div>
            <div className="fld">
              <label className="flbl">Email *</label>
              <input className="finp" placeholder="jane@advi.studio" type="email" value={newEmail} onChange={e => setNewEmail(e.target.value)} />
            </div>
            <div className="fld">
              <label className="flbl">Role</label>
              <select className="finp" value={newRole} onChange={e => setNewRole(e.target.value)} style={{ cursor: 'pointer' }}>
                {ROLES.map(r => <option key={r}>{r}</option>)}
              </select>
            </div>
            <div className="fld">
              <label className="flbl">Password</label>
              <input className="finp" placeholder="Default: pass123" type="password" value={newPwd} onChange={e => setNewPwd(e.target.value)} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 8 }}>
              <button onClick={() => setShowAdd(false)} style={{ padding: '8px 16px', borderRadius: 7, border: '1.5px solid var(--bd2)', background: 'var(--sf)', color: 'var(--tx2)', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>Cancel</button>
              <button onClick={handleAddMember} disabled={!newName.trim() || !newEmail.trim()} style={{ padding: '8px 16px', borderRadius: 7, border: 'none', background: newName.trim() && newEmail.trim() ? 'var(--ac)' : 'var(--bd)', color: '#fff', fontSize: 13, fontWeight: 600, cursor: newName.trim() && newEmail.trim() ? 'pointer' : 'default', fontFamily: 'inherit' }}>
                Add Member
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
