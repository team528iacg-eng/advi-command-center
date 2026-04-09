'use client';
import { useState, useRef, useEffect } from 'react';
import { useStore } from '@/lib/store';
import { USERS, LISTS, STATUSES } from '@/lib/data';
import { parseCommand } from '@/lib/aiCommandParser';

type Msg = { role: 'user' | 'assistant'; text: string };

export default function AIPage() {
  const { user, users, tasks, updateTask, addTask, selectedSpaceId } = useStore();
  const [msgs, setMsgs] = useState<Msg[]>([
    { role: 'assistant', text: "Hi! I'm your Advi AI — I have full context of your tasks, sprints, team, and docs. Ask me anything.\n\nTip: Try questions like \"What's my next task?\", \"Which tasks are overdue?\", or voice commands like \"Create task colour grade scene 5\" or \"Mark GPU cluster setup as done\"." }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const msgsRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

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

Keep responses concise and actionable. Use bullet points for lists. Be encouraging and professional.`;

  const toggleVoice = () => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) {
      setMsgs(m => [...m, { role: 'assistant', text: '🎙 Voice input is not supported in this browser. Please use Chrome or Edge.' }]);
      return;
    }
    if (listening) {
      recognitionRef.current?.stop();
      setListening(false);
      return;
    }
    const rec = new SR();
    recognitionRef.current = rec;
    rec.lang = 'en-US';
    rec.continuous = false;
    rec.interimResults = false;
    rec.onresult = (e: any) => {
      const transcript: string = e.results[0][0].transcript;
      setListening(false);
      send(transcript);
    };
    rec.onerror = () => setListening(false);
    rec.onend = () => setListening(false);
    rec.start();
    setListening(true);
  };

  const send = async (q?: string) => {
    const text = (q ?? input).trim();
    if (!text) return;
    const newMsgs: Msg[] = [...msgs, { role: 'user', text }];
    setMsgs(newMsgs);
    setInput('');

    // ── Command parser: intercept task actions before hitting Claude API ──
    const cmd = parseCommand(text, tasks, users.length ? users : USERS);

    if (cmd.action === 'create_task' && cmd.title) {
      const newTask = {
        id: 't' + Date.now(),
        title: cmd.title,
        list: 'l1',
        spaceId: cmd.spaceId ?? selectedSpaceId ?? '528',
        status: 'todo',
        priority: cmd.priority ?? 'normal',
        assignees: cmd.assignees ?? [],
        due: cmd.dueDate ?? '',
        est: 60,
        logged: 0,
        description: '',
        subtasks: [],
        comments: [],
        tags: [],
        createdAt: new Date().toISOString(),
      };
      addTask(newTask);
      const who = (cmd.assignees ?? []).map(id => users.find(u => u.id === id)?.name ?? id).filter(Boolean).join(', ');
      const reply = [
        `✅ Task created: "${cmd.title}"`,
        `• Priority: ${cmd.priority ?? 'normal'}`,
        who ? `• Assigned to: ${who}` : `• Assignees: none`,
        cmd.dueDate ? `• Due: ${cmd.dueDate}` : `• Due: not set`,
      ].join('\n');
      setMsgs(m => [...m, { role: 'assistant', text: reply }]);
      return;
    }

    if (cmd.action === 'update_task' && cmd.taskId && cmd.status) {
      updateTask(cmd.taskId, { status: cmd.status });
      const label = STATUSES.find(s => s.id === cmd.status)?.label ?? cmd.status;
      setMsgs(m => [...m, { role: 'assistant', text: `✅ Updated "${cmd.title}" → ${label}` }]);
      return;
    }

    if (cmd.action === 'assign_task' && cmd.taskId && cmd.assignees?.length) {
      const existing = tasks.find(t => t.id === cmd.taskId)?.assignees ?? [];
      const merged = [...new Set([...existing, ...cmd.assignees])];
      updateTask(cmd.taskId, { assignees: merged });
      const names = cmd.assignees.map(id => users.find(u => u.id === id)?.name ?? id).join(', ');
      setMsgs(m => [...m, { role: 'assistant', text: `✅ Assigned "${cmd.title}" to ${names}` }]);
      return;
    }

    // ── No command matched — forward to Claude API ──
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
        <b�b style={{ fontSize: 15, fontWeight: 700, color: 'var(--tx)' }}>AI Assistant</h2>
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
          <input
            id="ai-inp"
            className="finp"
            style={{ flex: 1 }}
            placeholder="Ask about tasks, sprints, docs… or say a command"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && send()}
          />
          <button
            onClick={toggleVoice}
            title={listening ? 'Stop listening' : 'Voice input'}
            style={{
              width: 36, height: 36, borderRadius: 7, border: listening ? 'none' : '1.5px solid var(--bd2)',
              background: listening ? '#7C3AED' : 'transparent', color: listening ? '#fff' : 'var(--tx3)',
              fontSize: 15, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0, fontFamily: 'inherit', outline: 'none',
              boxShadow: listening ? '0 0 0 3px #EDE9FE' : 'none', transition: 'all .2s',
            }}
          >
            🎙
          </button>
          <button
            onClick={() => send()}
            disabled={loading}
            style={{ padding: '8px 16px', borderRadius: 7, border: 'none', background: 'var(--ac)', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', opacity: loading ? .5 : 1 }}
          >
             ↑
          </button>
        </div>
      </div>
    </div>
  );
}
