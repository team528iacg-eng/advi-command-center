'use client';
import { useState } from 'react';
import { useStore } from '@/lib/store';
import { Task, USERS, LISTS, STATUSES, PRIORITIES } from '@/lib/data';

export default function TaskDetail({ task, onClose }: { task: Task; onClose: () => void }) {
  const { user, updateTask } = useStore();
  const [title, setTitle] = useState(task.title);
  const [desc, setDesc] = useState(task.description);
  const [newSub, setNewSub] = useState('');
  const [comment, setComment] = useState('');

  if (!user) return null;

  const save = (patch: Partial<Task>) => updateTask(task.id, patch);

  const addSub = () => {
    if (!newSub.trim()) return;
    save({ subtasks: [...task.subtasks, { id: 's' + Date.now(), title: newSub.trim(), done: false }] });
    setNewSub('');
  };

  const toggleSub = (id: string) =>
    save({ subtasks: task.subtasks.map(s => s.id === id ? { ...s, done: !s.done } : s) });

  const addComment = () => {
    if (!comment.trim()) return;
    save({ comments: [...task.comments, { id: 'c' + Date.now(), user: user.id, text: comment.trim(), at: new Date().toISOString() }] });
    setComment('');
  };

  const st = STATUSES.find(s => s.id === task.status);
  const lt = LISTS.find(l => l.id === task.list);
  const pr = PRIORITIES.find(p => p.id === task.priority);

  return (
    <div className="so on">
      <div className="so-bg" onClick={onClose} />
      <div className="so-panel">
        <div className="so-h">
          <button className="bbtn" onClick={onClose}>←</button>
          <span style={{ fontSize: 11, color: 'var(--tx3)' }}>{lt?.name}</span>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
            <select value={task.status} onChange={e => save({ status: e.target.value })} style={{ fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 6, border: '1.5px solid var(--bd)', cursor: 'pointer', fontFamily: 'inherit', color: st?.color, background: st?.bg }}>
              {STATUSES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
            </select>
          </div>
        </div>
        <div className="so-body">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
            <span className="sbdg" style={{ color: st?.color, background: st?.bg }}>{st?.label}</span>
            <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 4, background: pr?.color + '20', color: pr?.color }}>{pr?.label}</span>
          </div>
          <input value={title} onChange={e => setTitle(e.target.value)} onBlur={() => save({ title })} style={{ width: '100%', fontSize: 20, fontWeight: 700, background: 'transparent', border: 'none', borderBottom: '1.5px solid var(--bd)', borderRadius: 0, padding: '0 0 14px', marginBottom: 20, outline: 'none', fontFamily: 'inherit', color: 'var(--tx)' }} />
          <div className="mg">
            <span className="ml">List</span><span style={{ fontSize: 12, fontWeight: 600, color: lt?.color }}>{lt?.name}</span>
            <span className="ml">Priority</span>
            <select value={task.priority} onChange={e => save({ priority: e.target.value })} style={{ fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 6, border: '1.5px solid var(--bd)', cursor: 'pointer', fontFamily: 'inherit', color: pr?.color, background: pr?.color ? pr.color + '18' : 'var(--sf)' }}>
              {PRIORITIES.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
            </select>
            <span className="ml">Assignees</span>
            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
              {USERS.map(u => {
                const assigned = task.assignees.includes(u.id);
                return (
                  <button key={u.id} onClick={() => save({ assignees: assigned ? task.assignees.filter(x => x !== u.id) : [...task.assignees, u.id] })}
                    title={u.name}
                    style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '2px 8px 2px 3px', borderRadius: 20, border: `1.5px solid ${assigned ? u.color : 'var(--bd2)'}`, background: assigned ? u.bg : 'var(--bg)', color: assigned ? u.color : 'var(--tx3)', fontSize: 10, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                    <div className="av" style={{ width: 18, height: 18, fontSize: 7, background: u.bg, color: u.color }}>{u.initials}</div>
                    {u.name.split(' ')[0]}
                  </button>
                );
              })}
            </div>
            <span className="ml">Due Date</span>
            <input type="date" value={task.due ?? ''} onChange={e => save({ due: e.target.value })} style={{ fontSize: 12, fontWeight: 600, color: 'var(--tx2)', padding: '3px 8px', borderRadius: 6, border: '1.5px solid var(--bd)', background: 'var(--bg)', fontFamily: 'inherit', cursor: 'pointer' }} />
            <span className="ml">Estimate</span><span style={{ fontSize: 12, color: 'var(--tx2)' }}>{task.est}min</span>
            <span className="ml">Logged</span><span style={{ fontSize: 12, color: 'var(--tx2)' }}>{task.logged}min</span>
          </div>
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--tx3)', marginBottom: 8, letterSpacing: '.06em', textTransform: 'uppercase' }}>Description</div>
            <textarea className="fta" value={desc} onChange={e => setDesc(e.target.value)} onBlur={() => save({ description: desc })} placeholder="Add a description…" style={{ minHeight: 80 }} />
          </div>
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--tx3)', marginBottom: 10, letterSpacing: '.06em', textTransform: 'uppercase' }}>
              Subtasks ({task.subtasks.filter(s => s.done).length}/{task.subtasks.length})
            </div>
            {task.subtasks.map(s => (
              <div key={s.id} className="sub-row">
                <div className={`sub-cbx ${s.done ? 'ds' : ''}`} onClick={() => toggleSub(s.id)}>
                  {s.done && <span style={{ color: '#fff', fontSize: 10 }}>✓</span>}
                </div>
                <span style={{ fontSize: 13, color: s.done ? 'var(--tx4)' : 'var(--tx)', textDecoration: s.done ? 'line-through' : 'none', flex: 1 }}>{s.title}</span>
              </div>
            ))}
            <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
              <input className="finp" style={{ flex: 1, padding: '6px 10px', fontSize: 12 }} placeholder="Add subtask…" value={newSub} onChange={e => setNewSub(e.target.value)} onKeyDown={e => e.key === 'Enter' && addSub()} />
              <button onClick={addSub} style={{ padding: '5px 12px', borderRadius: 7, border: 'none', background: 'var(--ac)', color: '#fff', fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>Add</button>
            </div>
          </div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--tx3)', marginBottom: 12, letterSpacing: '.06em', textTransform: 'uppercase' }}>Activity</div>
            {task.comments.map(c => {
              const u = USERS.find(x => x.id === c.user);
              return (
                <div key={c.id} style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
                  <div className="av" style={{ width: 26, height: 26, fontSize: 9, background: u?.bg, color: u?.color, flexShrink: 0, marginTop: 2 }}>{u?.initials}</div>
                  <div style={{ flex: 1, background: 'var(--bg)', borderRadius: 8, padding: '10px 12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--tx)' }}>{u?.name}</span>
                      <span style={{ fontSize: 10, color: 'var(--tx4)' }}>{new Date(c.at).toLocaleDateString()}</span>
                    </div>
                    <p style={{ fontSize: 12, color: 'var(--tx2)', lineHeight: 1.6 }}>{c.text}</p>
                  </div>
                </div>
              );
            })}
            <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
              <div className="av" style={{ width: 26, height: 26, fontSize: 9, flexShrink: 0, background: user.bg, color: user.color }}>{user.initials}</div>
              <div style={{ flex: 1 }}>
                <textarea className="cmt-inp" placeholder="Write a comment…" rows={2} value={comment} onChange={e => setComment(e.target.value)} />
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 6 }}>
                  <button onClick={addComment} style={{ padding: '5px 12px', borderRadius: 7, border: 'none', background: 'var(--ac)', color: '#fff', fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>Comment</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
