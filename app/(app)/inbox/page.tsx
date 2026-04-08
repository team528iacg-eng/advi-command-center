'use client';
import { useState, useEffect, useRef } from 'react';
import { useStore } from '@/lib/store';
import { USERS, Message } from '@/lib/data';

export default function InboxPage() {
  const { user, messages, sendMessage } = useStore();
  const [activePeer, setActivePeer] = useState<string | null>(null);
  const [text, setText] = useState('');
  const msgsRef = useRef<HTMLDivElement>(null);

  if (!user) return null;

  // Build conversation list: unique peers
  const peers = USERS.filter(u => u.id !== user.id).map(u => {
    const thread = messages.filter(m => (m.from === user.id && m.to === u.id) || (m.from === u.id && m.to === user.id));
    const last = thread[thread.length - 1];
    const unreadCount = thread.filter(m => m.from === u.id && m.to === user.id).length;
    return { user: u, last, unreadCount };
  }).sort((a, b) => (b.last?.at ?? '').localeCompare(a.last?.at ?? ''));

  const activePeerUser = activePeer ? USERS.find(u => u.id === activePeer) : peers[0]?.user;
  const activeId = activePeer ?? peers[0]?.user.id;

  const thread = messages.filter(m =>
    (m.from === user.id && m.to === activeId) ||
    (m.from === activeId && m.to === user.id)
  ).sort((a, b) => a.at.localeCompare(b.at));

  useEffect(() => {
    if (msgsRef.current) msgsRef.current.scrollTop = msgsRef.current.scrollHeight;
  }, [thread.length]);

  const send = () => {
    if (!text.trim() || !activeId) return;
    const msg: Message = {
      id: 'm' + Date.now(),
      from: user.id,
      to: activeId,
      text: text.trim(),
      at: new Date().toISOString(),
    };
    sendMessage(msg);
    setText('');
  };

  const peer = activePeerUser;

  return (
    <div className="inbox-wrap">
      {/* Conversation list */}
      <div className="ilist">
        <div className="ich">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <span style={{ fontSize: 14, fontWeight: 800, color: 'var(--tx)' }}>Inbox</span>
            <button style={{ width: 28, height: 28, borderRadius: 7, border: '1.5px solid var(--bd)', background: 'transparent', cursor: 'pointer', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--tx3)' }}>✏</button>
          </div>
          <div style={{ display: 'flex', gap: 1, background: 'var(--bg)', borderRadius: 8, padding: 3 }}>
            <button style={{ flex: 1, padding: 5, borderRadius: 6, border: 'none', background: '#fff', color: 'var(--tx)', fontSize: 12, fontWeight: 600, cursor: 'pointer', boxShadow: '0 1px 3px rgba(0,0,0,.08)' }}>Messages</button>
            <button style={{ flex: 1, padding: 5, borderRadius: 6, border: 'none', background: 'transparent', color: 'var(--tx3)', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>Groups</button>
          </div>
        </div>
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {peers.map(({ user: u, last, unreadCount }) => (
            <div key={u.id} className={`crow ${activeId === u.id ? 'on' : ''}`} onClick={() => setActivePeer(u.id)}>
              <div className="av" style={{ width: 36, height: 36, fontSize: 12, background: u.bg, color: u.color }}>{u.initials}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--tx)' }}>{u.name}</span>
                  {last && <span style={{ fontSize: 10, color: 'var(--tx4)' }}>{new Date(last.at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>}
                </div>
                <div style={{ fontSize: 12, color: 'var(--tx3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {last?.text ?? 'No messages yet'}
                </div>
              </div>
              {unreadCount > 0 && <div style={{ width: 18, height: 18, borderRadius: '50%', background: '#7C3AED', color: '#fff', fontSize: 9, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{unreadCount}</div>}
            </div>
          ))}
        </div>
      </div>

      {/* Chat area */}
      <div className="chat-area">
        {peer ? (
          <>
            <div className="chat-h">
              <div className="av" style={{ width: 36, height: 36, fontSize: 13, background: peer.bg, color: peer.color }}>{peer.initials}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--tx)' }}>{peer.name}</div>
                <div style={{ fontSize: 11, color: 'var(--tx4)' }}>{peer.role} · 🟢 online</div>
              </div>
              <div className="live"><span className="livdot" />Socket.IO</div>
            </div>
            <div className="chat-msgs" ref={msgsRef}>
              {thread.length === 0 && (
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--tx4)', fontSize: 13 }}>
                  No messages yet. Say hello!
                </div>
              )}
              {thread.map(m => {
                const isMe = m.from === user.id;
                const sender = USERS.find(u => u.id === m.from);
                return (
                  <div key={m.id} className={`mrow ${isMe ? 'me' : ''}`}>
                    {!isMe && <div className="av" style={{ width: 28, height: 28, fontSize: 10, background: sender?.bg, color: sender?.color, flexShrink: 0 }}>{sender?.initials}</div>}
                    <div className={`mbbl ${isMe ? 'me' : 'them'}`}>
                      {m.text}
                      <div style={{ fontSize: 10, opacity: .6, marginTop: 4, textAlign: isMe ? 'right' : 'left' }}>
                        {new Date(m.at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="chat-inp-row">
              <input className="finp" style={{ flex: 1 }} placeholder={`Message ${peer.name}…`} value={text} onChange={e => setText(e.target.value)} onKeyDown={e => e.key === 'Enter' && send()} />
              <button onClick={send} style={{ padding: '8px 16px', borderRadius: 7, border: 'none', background: 'var(--ac)', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>↑</button>
            </div>
          </>
        ) : (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--tx4)' }}>Select a conversation</div>
        )}
      </div>
    </div>
  );
}
