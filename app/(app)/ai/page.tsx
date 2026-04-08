'use client';
import { useState, useRef, useEffect } from 'react';
import { useStore } from '@/lib/store';
import { USERS, LISTS, STATUSES } from '@/lib/data';

type Msg = { role: 'user' | 'assistant'; text: string };

export default function AIPage() {
  const { user, tasks, updateTask, addTask } = useStore();
  const [msgs, setMsgs] = useState<Msg[]>([
    { role: 'assistant', text: "Hi! I'm your Advi AI — I have full context of your tasks, sprints, team, and docs. Ask me anything.\n\nTip: Try questions like \"What's my next task?\", \"Which tasks are overdue?\", or commands like \"Mark [task] as done\"." }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const msgsRef = useRef<HTMLDivElement>(null);

  useEffect(() => { if (msgsRef.current) msgsRef.current.scrollTop = msgsRef.current.scrollHeight; }, [msgs]);

  if (!user) return null;

  const taskSummary = tasks.map(t => {
    const st = STATUSES.find(s => s.id === t.status);
    const lt = LISTS.find(l => l.id === t.list);
    const assignees = t.assignees.map(id => USERS.find(u => u.id === id)?.name).join(', ');
    return `- [${t.id}] "${t.title}" | Status: ${st?.label} | List: ${lt?.name} | Assignees: ${assignees} | Due: ${t.due}`;
  }).join('\n');

  const systemPrompt = `You are Advi AI, the intelligent assistant for Advi Command Center — a project management platform for a creative studio.

Current user: ${user.name} (${user.role})
Today: ${new Date().toLocaleDateString()}

Current tasks:
${taskSummary}

Team members:
${USERS.map(u => `- ${u.name} (${u.role})`).join('\n')}

You can:
- Answer questions about tasks, deadlines, team workload
- Suggest what to work on next
- Identify overdue or at-risk tasks
- Give sprint status summaries
- Help prioritize work

When the user asks to create a task, respond with a brief confirmation and the details you'd create.
Keep responses concise and actionable. Use bullet points for lists. Be encouraging and professional.`;

  const send = async (q?: string) => {
    const text = (q ?? input).trim();
    if (!text) return;
    const newMsgs = [...msgs, { role: 'user' as const, text }];
    setMsgs(newMsgs);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMsgs, system: systemPrompt }),
      });
      const data = await res.json();
      setMsgs(m => [...m, { role: 'assistant', text: data.reply ?? 'Sorry, I could not process that.' }]);
    } catch {
      setMsgs(m => [...m, { role: 'assistant', text: 'Sorry, I encountered an error. Please try again.' }]);
    }
    setLoading(false);
  };

  const quickQuestions = ["What's my next task?", "Which tasks are overdue?", "Sprint 3 progress?", "Who is overloaded?"];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
      <div style={{ padding: '14px 20px', borderBottom: '1.5px solid var(--bd)', background: 'var(--sf)', flexShrink: 0 }}>
        <h2 style={{ fontSize: 15, fontWeight: 700, color: 'var(--tx)' }}>AI Assistant</h2>
        <p style={{ fontSize: 11, color: 'var(--tx3)' }}>Task-aware · Claude Sonnet · 🎙 Voice commands supported</p>
      </div>
      <div className="ai-msgs" ref={msgsRef}>
        {msgs.map((m, i) => (
          <div key={i} className={`ai-msg ${m.role === 'user' ? 'me' : ''}`}>
            {m.role === 'assistant' && <div className="ai-av" style={{ background: '#EDE9FE', color: '#7C3AED' }}>AI</div>}
            <div className={`bubble ${m.role === 'user' ? 'me' : 'bot'}`} style={{ whiteSpace: 'pre-wrap' }}>{m.text}</div>
            {m.role === 'user' && <div className="ai-av" style={{ background: user.bg, color: user.color }}>{user.initials}</div>}
          </div>
        ))}
        {loading && (
          <div className="ai-msg">
            <div className="ai-av" style={{ background: '#EDE9FE', color: '#7C3AED' }}>AI</div>
            <div className="bubble bot">
              <span className="ldot" style={{ animationDelay: '0ms' }} />
              <span className="ldot" style={{ animationDelay: '150ms', marginLeft: 4 }} />
              <span className="ldot" style={{ animationDelay: '300ms', marginLeft: 4 }} />
            </div>
          </div>
        )}
      </div>
      <div style={{ padding: '12px 20px', borderTop: '1.5px solid var(--bd)', background: 'var(--sf)', flexShrink: 0 }}>
        <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: 10 }}>
          {quickQuestions.map(q => <button key={q} className="qq" onClick={() => send(q)}>{q}</button>)}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <input id="ai-inp" className="finp" style={{ flex: 1 }} placeholder="Ask about tasks, sprints, docs…" value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && send()} />
          <button onClick={() => send()} disabled={loading} style={{ padding: '8px 16px', borderRadius: 7, border: 'none', background: 'var(--ac)', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', opacity: loading ? .5 : 1 }}>↑</button>
        </div>
      </div>
    </div>
  );
}
