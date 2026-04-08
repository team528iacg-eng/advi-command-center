'use client';
import { useState } from 'react';
import { useStore } from '@/lib/store';
import { USERS, LISTS, Task } from '@/lib/data';

type GenTask = { title: string; assignee: string; est: number; priority: string; description: string };

export default function AIGenPage() {
  const { user, addTask } = useStore();
  const [project, setProject] = useState('🎬 528 Film');
  const [goal, setGoal] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [date, setDate] = useState('2026-03-23');
  const [loading, setLoading] = useState(false);
  const [genTasks, setGenTasks] = useState<GenTask[]>([]);
  const [saved, setSaved] = useState(false);

  if (!user) return null;

  const toggleUser = (id: string) => setSelectedUsers(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);

  const generate = async () => {
    if (!goal.trim()) return;
    setLoading(true);
    setGenTasks([]);
    setSaved(false);

    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system: 'You are a project management AI. Generate structured tasks from a goal. Respond ONLY with valid JSON array of tasks. No preamble or explanation.',
          messages: [{
            role: 'user',
            text: `Project: ${project}\nGoal: ${goal}\nTeam: ${(selectedUsers.length ? selectedUsers : USERS.map(u=>u.id)).map(id => USERS.find(u=>u.id===id)?.name).join(', ')}\nDeadline: ${date}\n\nGenerate 4-6 tasks as JSON array with fields: title, assignee (person name), est (minutes), priority (urgent/high/normal/low), description`
          }],
        }),
      });
      const data = await res.json();
      const text = data.reply ?? '[]';
      const clean = text.replace(/```json|```/g, '').trim();
      const parsed = JSON.parse(clean);
      setGenTasks(Array.isArray(parsed) ? parsed : []);
    } catch {
      setGenTasks([
        { title: 'Define project scope and deliverables', assignee: 'Hemanth Kumar', est: 60, priority: 'high', description: 'Document the full scope for ' + project },
        { title: 'Create timeline and milestone plan', assignee: 'Priya R', est: 90, priority: 'normal', description: 'Map out key milestones to meet the deadline' },
        { title: 'Assign resources and brief team', assignee: 'Vivek M', est: 45, priority: 'normal', description: 'Brief all team members on their responsibilities' },
        { title: 'Execute primary deliverable', assignee: 'Deeptham S', est: 180, priority: 'urgent', description: goal.slice(0, 100) },
      ]);
    }
    setLoading(false);
  };

  const saveAll = () => {
    const listId = project.includes('528') ? 'l1' : project.includes('Render') ? 'l3' : 'l5';
    genTasks.forEach(t => {
      const uid = USERS.find(u => u.name.toLowerCase().includes(t.assignee.toLowerCase().split(' ')[0]))?.id ?? 'hk';
      addTask({
        id: 'g' + Date.now() + Math.random(),
        title: t.title, list: listId, status: 'todo', priority: t.priority,
        assignees: [uid], due: date, est: t.est, logged: 0,
        description: t.description, subtasks: [], comments: [], tags: [],
        createdAt: new Date().toISOString(),
      } as Task);
    });
    setSaved(true);
  };

  const prColors: Record<string, string> = { urgent: '#EF4444', high: '#F97316', normal: '#3B82F6', low: '#9CA3AF' };

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: 20 }}>
      <h2 style={{ fontSize: 18, fontWeight: 800, color: 'var(--tx)', marginBottom: 4 }}>⚡ AI Task Generator</h2>
      <p style={{ fontSize: 13, color: 'var(--tx3)', marginBottom: 20 }}>Describe a goal — Claude will generate structured, assigned tasks automatically.</p>
      <div className="gen-grid">
        <div className="gen-form">
          <div className="fld">
            <label className="flbl">Project</label>
            <select className="finp" value={project} onChange={e => setProject(e.target.value)}>
              <option>🎬 528 Film</option><option>⚡ RenderZero</option><option>🧪 AI Experience Lab</option>
            </select>
          </div>
          <div className="fld">
            <label className="flbl">Goal / Objective</label>
            <textarea className="fta" style={{ minHeight: 80 }} placeholder="e.g. Launch the prologue with narrator, colour grade and spatial audio…" value={goal} onChange={e => setGoal(e.target.value)} />
          </div>
          <div className="fld">
            <label className="flbl">Team Members</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, padding: '8px 10px', border: '1.5px solid var(--bd)', borderRadius: 8, minHeight: 42, alignItems: 'center' }}>
              {USERS.map(u => (
                <button key={u.id} onClick={() => toggleUser(u.id)} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '3px 9px 3px 4px', borderRadius: 20, cursor: 'pointer', fontSize: 11, fontWeight: 600, border: '1.5px solid', borderColor: selectedUsers.includes(u.id) ? u.color : 'var(--bd2)', background: selectedUsers.includes(u.id) ? u.bg : 'transparent', color: selectedUsers.includes(u.id) ? u.color : 'var(--tx3)', fontFamily: 'inherit' }}>
                  <div className="av" style={{ width: 18, height: 18, fontSize: 7, background: u.bg, color: u.color }}>{u.initials}</div>
                  {u.name.split(' ')[0]}
                </button>
              ))}
            </div>
          </div>
          <div className="fld">
            <label className="flbl">Deadline</label>
            <input type="date" className="finp" value={date} onChange={e => setDate(e.target.value)} />
          </div>
          <button className="gen-btn" disabled={loading || !goal.trim()} onClick={generate}>
            {loading ? <><span className="ldot" /><span className="ldot" style={{ marginLeft: 4 }} /><span className="ldot" style={{ marginLeft: 4 }} /></> : '⚡ Generate Tasks'}
          </button>
        </div>
        <div className="gen-out">
          <div className="ch"><span className="ct">Generated Tasks</span>{genTasks.length > 0 && <span style={{ fontSize: 11, color: '#059669', fontWeight: 700 }}>✓ {genTasks.length} tasks ready</span>}</div>
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {genTasks.length === 0 && !loading && (
              <div style={{ padding: '50px 20px', textAlign: 'center', color: 'var(--tx4)', fontSize: 13 }}>
                <div style={{ fontSize: 32, marginBottom: 10 }}>⚡</div>Fill the form and click Generate.
              </div>
            )}
            {loading && Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="gen-row" style={{ opacity: .5 }}>
                <span className="ldot" style={{ animationDelay: `${i * 150}ms` }} />
                <div style={{ flex: 1, height: 14, background: 'var(--bd)', borderRadius: 4, animation: 'pulse 1.5s infinite' }} />
              </div>
            ))}
            {genTasks.map((t, i) => {
              const u = USERS.find(u => u.name.toLowerCase().includes(t.assignee.toLowerCase().split(' ')[0]));
              return (
                <div key={i} className="gen-row">
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--tx)' }}>{t.title}</span>
                      <span style={{ fontSize: 9, fontWeight: 700, padding: '1px 6px', borderRadius: 4, background: prColors[t.priority] + '20', color: prColors[t.priority] }}>{t.priority}</span>
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--tx3)' }}>{t.description}</div>
                    <div style={{ display: 'flex', gap: 8, marginTop: 4, fontSize: 10, color: 'var(--tx4)' }}>
                      <span>👤 {t.assignee}</span><span>⏱ {t.est}min</span>
                    </div>
                  </div>
                  {u && <div className="av" style={{ width: 24, height: 24, fontSize: 9, background: u.bg, color: u.color, flexShrink: 0 }}>{u.initials}</div>}
                </div>
              );
            })}
          </div>
          {genTasks.length > 0 && (
            <div style={{ padding: '12px 18px', borderTop: '1.5px solid var(--bd)' }}>
              {saved ? (
                <div style={{ textAlign: 'center', color: '#059669', fontWeight: 700, fontSize: 13 }}>✅ Tasks saved to workspace!</div>
              ) : (
                <button className="gen-btn" onClick={saveAll}>Save Tasks to Workspace</button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
