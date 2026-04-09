'use client';
import { useState, useRef, useEffect } from 'react';
import { useStore } from '@/lib/store';
import { USERS, LISTS, STATUSES, PRIORITIES, Task } from '@/lib/data';
import NewTaskModal from '@/components/NewTaskModal';
import TaskDetail from '@/components/TaskDetail';
import { getSocket, joinRoom, leaveRoom } from '@/lib/socket';
import { getSocket, joinRoom, leaveRoom } from '@/lib/socket';

const today = new Date().toISOString().split('T')[0];

function getStatus(id: string) { return STATUSES.find(s => s.id === id); }
function getList(id: string) { return LISTS.find(l => l.id === id); }
function getPriority(id: string) { return PRIORITIES.find(p => p.id === id); }
function getUser(id: string) { return USERS.find(u => u.id === id); }

function StatusBadge({ id, onClick }: { id: string; onClick?: () => void }) {
  const s = getStatus(id);
  return <span className="sbdg" style={{ color: s?.color, background: s?.bg, cursor: onClick ? 'pointer' : 'default' }} onClick={onClick}>{s?.label}</span>;
}

function PriorityDot({ id }: { id: string }) {
  const p = getPriority(id);
  return <span className="pdot" style={{ background: p?.color }} title={p?.label} />;
}

function TaskRow({ task, onClick }: { task: Task; onClick: () => void }) {
  const { updateTask } = useStore();
  const isDone = task.status === 'done';

  return (
    <div className="tr" onClick={onClick}>
      <div onClick={e => e.stopPropagation()} title="Open task to change status">
        <div className={`cbx ${isDone ? 'dc' : ''}`}>{isDone && <span style={{ color: '#fff', fontSize: 9 }}>â</span>}</div>
      </div>
      <div className="ttc">
        <PriorityDot id={task.priority} />
        <span className={`tname ${isDone ? 'done' : ''}`}>{task.title}</span>
        <span style={{ fontSize: 10, fontWeight: 600, padding: '1px 6px', borderRadius: 4, background: getList(task.list)?.color + '20', color: getList(task.list)?.color }}>{getList(task.list)?.name}</span>
      </div>
      <div className="cell">
        <div style={{ display: 'flex', gap: 3 }}>
          {task.assignees.slice(0, 3).map(uid => {
            const u = getUser(uid);
            return u ? <div key={uid} className="av" title={u.name} style={{ width: 20, height: 20, fontSize: 8, background: u.bg, color: u.color }}>{u.initials}</div> : null;
          })}
        </div>
      </div>
      <div className="cell" style={{ color: task.due < today && !isDone ? '#EF4444' : undefined }}>
        {task.due ? new Date(task.due + 'T00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'â'}
      </div>
      <div className="cell" onClick={e => e.stopPropagation()}>
        <StatusBadge id={task.status} />
      </div>
      <div className="cell">{task.logged ? `${task.logged}m` : 'â'}</div>
      <div className="cell">{task.est}m</div>
      <div />
    </div>
  );
}

function BoardView({ tasks, onSelect }: { tasks: Task[]; onSelect: (t: Task) => void }) {
  const { updateTask } = useStore();
  const dragId = useRef('');

  return (
    <div style={{ flex: 1, overflow: 'hidden' }}>
      <div className="board">
        {STATUSES.filter(s => s.id !== 'done' || tasks.some(t => t.status === 'done')).map(st => {
          const cols = tasks.filter(t => t.status === st.id);
          return (
            <div key={st.id} className="bcol" style={{ width: 260 }}
              onDragOver={e => e.preventDefault()}
              onDrop={() => { if (dragId.current) { updateTask(dragId.current, { status: st.id }); dragId.current = ''; } }}
            >
              <div className="bch">
                <div className="sbdg" style={{ color: st.color, background: st.bg }}>{st.label}</div>
                <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--tx3)', marginLeft: 'auto' }}>{cols.length}</span>
              </div>
              <div style={{ padding: '10px 10px 2px', flex: 1, overflowY: 'auto' }}>
                {cols.map(t => (
                  <div key={t.id} className="bcard" onClick={() => onSelect(t)}
                    draggable
                    onDragStart={() => { dragId.current = t.id; }}
                  >
                    <div style={{ fontSize: 11, fontWeight: 600, padding: '1px 6px', borderRadius: 4, background: getList(t.list)?.color + '20', color: getList(t.list)?.color, display: 'inline-block', marginBottom: 6 }}>{getList(t.list)?.name}</div>
                    <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--tx)', marginBottom: 8, lineHeight: 1.4 }}>{t.title}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <PriorityDot id={t.priority} />
                      <span style={{ fontSize: 10, color: 'var(--tx4)', flex: 1 }}>{t.due ? new Date(t.due + 'T00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : ''}</span>
                      <div style={{ display: 'flex', gap: 2 }}>
                        {t.assignees.slice(0, 2).map(uid => { const u = getUser(uid); return u ? <div key={uid} className="av" style={{ width: 18, height: 18, fontSize: 7, background: u.bg, color: u.color }}>{u.initials}</div> : null; })}
                      </div>
                    </div>
                  </div>
                ))}
                <div style={{ height: 8 }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function WorkPage() {
  const { tasks, addTask, updateTask, user } = useStore();
  const selectedSpaceId = useStore(s => s.selectedSpaceId);

  // ââ Real-time: join space room + listen for task_updated ââ
  useEffect(() => {
    if (!selectedSpaceId) return;
    joinRoom(selectedSpaceId);
    const socket = getSocket();
    if (!socket) return;
    const handler = (data: { id: string; patch: Partial<Task>; userId: string }) => {
      // Ignore our own echoes (already applied optimistically)
      if (data.userId === user?.id) return;
      updateTask(data.id, data.patch);
    };
    socket.on('task_updated', handler);
    return () => {
      socket.off('task_updated', handler);
      leaveRoom(selectedSpaceId);
    };
  }, [selectedSpaceId, user?.id]); // eslint-disable-line react-hooks/exhaustive-deps
  const spaceTasks = tasks.filter(t => t.spaceId === selectedSpaceId);
  const [view, setView] = useState<'list' | 'board' | 'cal'>('list');
  const [tab, setTab] = useState<'all' | 'done'>('all');
  const [showNew, setShowNew] = useState(false);
  const [selected, setSelected] = useState<Task | null>(null);

  const visibleTasks = tab === 'done' ? spaceTasks.filter(t => t.status === 'done') : spaceTasks.filter(t => t.status !== 'done');
  const groups = STATUSES.filter(s => visibleTasks.some(t => t.status === s.id));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
      <div className="tb-bar">
        <div className="wktabs">
          <button className={`wktab ${tab === 'all' ? 'on' : ''}`} onClick={() => setTab('all')}>All Tasks</button>
          <button className={`wktab ${tab === 'done' ? 'on' : ''}`} onClick={() => setTab('done')}>
            Completed <span style={{ fontSize: 9, fontWeight: 700, padding: '1px 6px', borderRadius: 8, background: 'var(--bd)', color: 'var(--tx3)' }}>{spaceTasks.filter(t => t.status === 'done').length}</span>
          </button>
        </div>
        <div className="vtabs">
          <button className={`button ${view === 'list' ? 'on' : ''}`} onClick={() => setView('list')}>â¸ List</button>
          <button className={`button ${view === 'board' ? 'on' : ''}`} onClick={() => setView('board')}>â Board</button>
          <button className={`button ${view === 'cal' ? 'on' : ''}`} onClick={() => setView('cal')}>â« Calendar</button>
        </div>
        <button className="tbtn p" style={{ marginLeft: 'auto' }} onClick={() => setShowNew(true)}>+ New Task</button>
      </div>

      {view === 'list' && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div className="lhead">
            <div /><div>Task</div><div>Assignees</div><div>Due</div><div>Status</div><div>Logged</div><div>Est.</div><div />
          </div>
          <div className="tlist">
            {groups.map(st => (
              <div key={st.id}>
                <div className="grph">
                  <div className="sbdg" style={{ color: st.color, background: st.bg }}>{st.label}</div>
                  <span className="grpcnt">{visibleTasks.filter(t => t.status === st.id).length}</span>
                </div>
                {visibleTasks.filter(t => t.status === st.id).map(t => (
                  <TaskRow key={t.id} task={t} onClick={() => setSelected(t)} />
                ))}
              </div>
            ))}
            <div className="addrow" onClick={() => setShowNew(true)}>+ Add task</div>
          </div>
        </div>
      )}

      {view === 'board' && <BoardView tasks={visibleTasks} onSelect={t => setSelected(t)} />}

      {view === 'cal' && (
        <div style={{ flex: 1, overflowY: 'auto', padding: 20 }}>
          <CalendarView tasks={visibleTasks} onSelect={t => setSelected(t)} />
        </div>
      )}

      {showNew && <NewTaskModal onClose={() => setShowNew(false)} defaultSpaceId={selectedSpaceId} />}
      {selected && <TaskDetail task={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}

function CalendarView({ tasks, onSelect }: { tasks: Task[]; onSelect: (t: Task) => void }) {
  const now = new Date();
  const year = now.getFullYear(); const month = now.getMonth();
  const first = new Date(year, month, 1).getDay();
  const days = new Date(year, month + 1, 0).getDate();
  const cells = Array.from({ length: 42 }, (_, i) => {
    const d = i - first + 1;
    return d >= 1 && d <= days ? d : null;
  });

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h3 style={{ fontSize: 16, fontWeight: 700 }}>{now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</h3>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 1, background: 'var(--bd)', borderRadius: 12, overflow: 'hidden', border: '1.5px solid var(--bd)' }}>
        {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => (
          <div key={d} style={{ background: 'var(--bg)', padding: '8px 0', textAlign: 'center', fontSize: 10, fontWeight: 700, color: 'var(--tx3)', letterSpacing: '.1em' }}>{d}</div>
        ))}
        {cells.map((d, i) => {
          const dateStr = d ? `${year}-${String(month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}` : '';
          const dayTasks = d ? tasks.filter(t => t.due === dateStr) : [];
          const isToday = dateStr === today;
          return (
            <div key={i} style={{ background: isToday ? '#EDE9FE' : 'var(--sf)', minHeight: 88, padding: '6px 8px' }}>
              {d && <div style={{ fontSize: 12, fontWeight: isToday ? 800 : 400, color: isToday ? '#7C3AED' : 'var(--tx3)', marginBottom: 4 }}>{d}</div>}
              {dayTasks.map(t => {
                const st = getStatus(t.status);
                return <div key={t.id} className="cal-task" style={{ background: st?.bg, color: st?.color, cursor: 'pointer' }} onClick={() => onSelect(t)}>{t.title}</div>;
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}
