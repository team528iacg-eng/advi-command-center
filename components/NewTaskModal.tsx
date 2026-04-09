'use client';
import { useState } from 'react';
import { useStore } from '@/lib/store';
import { LISTS, USERS, Task } from '@/lib/data';

export default function NewTaskModal({ onClose, defaultSpaceId }: { onClose: () => void; defaultSpaceId?: string }) {
  const { user, addTask, selectedSpaceId } = useStore();
  const effectiveSpaceId = defaultSpaceId ?? selectedSpaceId ?? '528';
  const [title, setTitle] = useState('');
  const [list, setList] = useState('l1');
  const [priority, setPriority] = useState('normal');
  const [due, setDue] = useState('2026-03-20');
  const [status, setStatus] = useState('todo');
  const [est, setEst] = useState(60);
  const [desc, setDesc] = useState('');
  const [assignees, setAssignees] = useState<string[]>(user ? [user.id] : []);

  const toggle = (id: string) => setAssignees(a => a.includes(id) ? a.filter(x => x !== id) : [...a, id]);

  const create = () => {
    if (!title.trim()) return;
    const task: Task = {
      id: 't' + Date.now(),
      title: title.trim(), list, spaceId: effectiveSpaceId, status, priority,
      assignees, due, est, logged: 0, description: desc,
      subtasks: [], comments: [], tags: [],
      createdAt: new Date().toISOString(),
    };
    addTask(task);
    onClose();
  };

  return (
    <div className="overlay on" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="mh">
          <span className="mttl">Create New Task</span>
          <button className="mcl" onClick={onClose}>×</button>
        </div>
        <div className="fld">
          <label className="flbl">Title</label>
          <input className="finp" placeholder="What needs to be done?" value={title} onChange={e => setTitle(e.target.value)} onKeyDown={e => e.key === 'Enter' && create()} autoFocus />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div className="fld">
            <label className="flbl">List</label>
            <select className="finp" value={list} onChange={e => setList(e.target.value)}>
              {LISTS.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
            </select>
          </div>
          <div className="fld">
            <label className="flbl">Priority</label>
            <select className="finp" value={priority} onChange={e => setPriority(e.target.value)}>
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="normal">Normal</option>
              <option value="low">Low</option>
            </select>
          </div>
          <div className="fld">
            <label className="flbl">Due Date</label>
            <input type="date" className="finp" value={due} onChange={e => setDue(e.target.value)} />
          </div>
          <div className="fld">
            <label className="flbl">Status</label>
            <select className="finp" value={status} onChange={e => setStatus(e.target.value)}>
              <option value="todo">To Do</option>
              <option value="in_progress">In Progress</option>
              <option value="review">In Review</option>
            </select>
          </div>
          <div className="fld">
            <label className="flbl">Time Est. (min)</label>
            <input type="number" className="finp" value={est} onChange={e => setEst(Number(e.target.value))} />
          </div>
        </div>
        <div className="fld">
          <label className="flbl">Assignees</label>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', padding: '8px 10px', border: '1.5px solid var(--bd)', borderRadius: 8, minHeight: 42, alignItems: 'center' }}>
            {USERS.map(u => (
              <button key={u.id} onClick={() => toggle(u.id)} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '3px 9px 3px 4px', borderRadius: 20, cursor: 'pointer', fontSize: 11, fontWeight: 600, border: '1.5px solid', borderColor: assignees.includes(u.id) ? u.color : 'var(--bd2)', background: assignees.includes(u.id) ? u.bg : 'var(--bg)', color: assignees.includes(u.id) ? u.color : 'var(--tx3)', fontFamily: 'inherit' }}>
                <div className="av" style={{ width: 18, height: 18, fontSize: 8, background: u.bg, color: u.color }}>{u.initials}</div>
                {u.name.split(' ')[0]}
              </button>
            ))}
          </div>
        </div>
        <div className="fld">
          <label className="flbl">Description</label>
          <textarea className="fta" placeholder="Optional…" value={desc} onChange={e => setDesc(e.target.value)} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 8 }}>
          <button onClick={onClose} style={{ padding: '8px 16px', borderRadius: 7, border: '1.5px solid var(--bd2)', background: 'var(--sf)', color: 'var(--tx2)', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>Cancel</button>
          <button onClick={create} style={{ padding: '8px 16px', borderRadius: 7, border: 'none', background: 'var(--ac)', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>Create Task</button>
        </div>
      </div>
    </div>
  );
}
