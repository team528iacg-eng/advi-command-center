'use client';
import { useState, useEffect, useRef } from 'react';
import { useStore } from '@/lib/store';
import { USERS, Conversation, Message } from '@/lib/data';
import { getSocket, joinRoom, leaveRoom } from '@/lib/socket';

export default function InboxPage() {
  const { user, messages, sendMessage, conversations, lastRead, createConversation, markRead } = useStore();
  const [activePeer, setActivePeer] = useState<string | null>(null);
  const [text, setText] = useState('');
  const [tab, setTab] = useState<'dm' | 'group'>('dm');
  const [showNew, setShowNew] = useState(false);
  const [newMembers, setNewMembers] = useState<string[]>([]);
  const [newName, setNewName] = useState('');
  const msgsRef = useRef<HTMLDivElement>(null);

  if (!user) return null;

  // Helper: canonical DM conversation ID
  const getDmId = (a: string, b: string) => `dm_${[a, b].sort().join('_')}`;

  // Conversations this user belongs to
  const userConvos = conversations.filter(c => c.members.includes(user.id));
  const displayList = userConvos
    .filter(c => c.type === tab)
    .map(conv => {
      // Get thread (new messages with conversationId + legacy from/to DMs)
      const thread = messages.filter(m => {
        if (m.conversationId === conv.id) return true;
        if (conv.type === 'dm' && !m.conversationId) {
          const peerId = conv.members.find(id => id !== user.id);
          return (m.from === user.id && m.to === peerId) || (m.from === peerId && m.to === user.id);
        }
        return false;
      }).sort((a, b) => a.at.localeCompare(b.at));

      const last = thread[thread.length - 1];
      const lr = lastRead[conv.id] ?? '';
      const unreadCount = thread.filter(m => m.from !== user.id && m.at > lr).length;
      const peer = conv.type === 'dm' ? USERS.find(u => u.id === conv.members.find(id => id !== user.id)) : null;
      return { conv, peer, last, unreadCount };
    })
    .sort((a, b) => (b.last?.at ?? b.conv.createdAt).localeCompare(a.last?.at ?? a.conv.createdAt));

  // Active conversation
  const activeConvId = activePeer ?? displayList[0]?.conv.id;
  const activeConv = conversations.find(c => c.id === activeConvId);
  const activePeer2 = activeConv?.type === 'dm' ? USERS.find(u => u.id === activeConv.members.find(id => id !== user.id)) : null;

  // Thread for active conversation
  const thread = !activeConv ? [] : messages.filter(m => {
    if (m.conversationId === activeConvId) return true;
    if (activeConv.type === 'dm' && !m.conversationId) {
      const peerId = activeConv.members.find(id => id !== user.id);
      return (m.from === user.id && m.to === peerId) || (m.from === peerId && m.to === user.id);
    }
    return false;
  }).sort((a, b) => a.at.localeCompare(b.at));

  useEffect(() => {
    if (msgsRef.current) msgsRef.current.scrollTop = msgsRef.current.scrollHeight;
  }, [thread.length]);

  // ── Real-time: join active conversation room + listen for message_sent ──
  useEffect(() => {
    if (!activeConvId) return;
    joinRoom(activeConvId);
    const socket = getSocket();
    if (!socket) return;
    const handler = (data: { message: Message; userId: string }) => {
      // Ignore our own echoes (already applied optimistically)
      if (data.userId === user?.id) return;
      useStore.getState().sendMessage(data.message);
    };
    socket.on('message_sent', handler);
    return () => {
      socket.off('message_sent', handler);
      leaveRoom(activeConvId);
    };
  }, [activeConvId, user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const openConversation = (convId: string) => {
    setActivePeer(convId);
    markRead(convId);
  };

  const send = () => {
    if (!text.trim() || !activeConvId || !activeConv) return;
    const peerId = activeConv.type === 'dm' ? activeConv.members.find(id => id !== user.id) : undefined;
    sendMessage({
      id: 'm' + Date.now(),
      from: user.id,
      to: peerId ?? activeConvId,
      conversationId: activeConvId,
      text: text.trim(),
      at: new Date().toISOString(),
    });
    markRead(activeConvId);
    setText('');
  };

  const createNew = () => {
    if (newMembers.length === 0) return;
    const isGroup = newMembers.length > 1;
    const members = [user.id, ...newMembers];
    const id = isGroup ? `grp_${Date.now()}` : getDmId(user.id, newMembers[0]);
    // If DM already exists, just open it
    if (!isGroup && conversations.find(c => c.id === id)) {
      openConversation(id); setTab('dm'); setShowNew(false); setNewMembers([]); return;
    }
    const name = isGroup
      ? (newName || members.map(id => USERS.find(u => u.id === id)?.name.split(' ')[0]).join(', '))
      : '';
    createConversation({ id, name, type: isGroup ? 'group' : 'dm', members, createdAt: new Date().toISOString() });
    openConversation(id);
    setTab(isGroup ? 'group' : 'dm');
    setShowNew(false); setNewMembers([]); setNewName('');
  };

  const chatName = activeConv?.type === 'group' ? activeConv.name : activePeer2?.name;
  const chatSub  = activeConv?.type === 'group'
    ? `${activeConv.members.length} members`
    : `${activePeer2?.role} · 🟢 online`;

  return (
    <div className="inbox-wrap">
      {/* Conversation list */}
      <div className="ilist">
        <div className="ich">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <span style={{ fontSize: 14, fontWeight: 800, color: 'var(--tx)' }}>Inbox</span>
            <button onClick={() => setShowNew(true)} style={{ width: 28, height: 28, borderRadius: 7, border: '1.5px solid var(--bd)', background: 'transparent', cursor: 'pointer', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--tx3)' }}>✏</button>
          </div>
          <div style={{ display: 'flex', gap: 1, background: 'var(--bg)', borderRadius: 8, padding: 3 }}>
            <button onClick={() => setTab('dm')} style={{ flex: 1, padding: 5, borderRadius: 6, border: 'none', background: tab === 'dm' ? '#fff' : 'transparent', color: tab === 'dm' ? 'var(--tx)' : 'var(--tx3)', fontSize: 12, fontWeight: 600, cursor: 'pointer', boxShadow: tab === 'dm' ? '0 1px 3px rgba(0,0,0,.08)' : 'none' }}>Messages</button>
            <button onClick={() => setTab('group')} style={{ flex: 1, padding: 5, borderRadius: 6, border: 'none', background: tab === 'group' ? '#fff' : 'transparent', color: tab === 'group' ? 'var(--tx)' : 'var(--tx3)', fontSize: 12, fontWeight: 600, cursor: 'pointer', boxShadow: tab === 'group' ? '0 1px 3px rgba(0,0,0,.08)' : 'none' }}>Groups</button>
          </div>
        </div>
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {displayList.map(({ conv, peer, last, unreadCount }) => {
            const initials = conv.type === 'group'
              ? conv.name.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase()
              : peer?.initials;
            const bg    = conv.type === 'group' ? '#7C3AED' : peer?.bg;
            const color = conv.type === 'group' ? '#fff'    : peer?.color;
            const name  = conv.type === 'group' ? conv.name : peer?.name;
            return (
              <div key={conv.id} className={`crow ${activeConvId === conv.id ? 'on' : ''}`} onClick={() => openConversation(conv.id)}>
                <div className="av" style={{ width: 36, height: 36, fontSize: 12, background: bg, color }}>{initials}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--tx)' }}>{name}</span>
                    {last && <span style={{ fontSize: 10, color: 'var(--tx4)' }}>{new Date(last.at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--tx3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{last?.text ?? 'No messages yet'}</div>
                </div>
                {unreadCount > 0 && <div style={{ width: 18, height: 18, borderRadius: '50%', background: '#7C3AED', color: '#fff', fontSize: 9, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{unreadCount}</div>}
              </div>
            );
          })}
          {displayList.length === 0 && (
            <div style={{ padding: '24px 16px', textAlign: 'center', color: 'var(--tx4)', fontSize: 12 }}>
              {tab === 'group' ? 'No group chats yet.' : 'No messages yet.'}<br />
              <span style={{ cursor: 'pointer', color: 'var(--ac)', fontWeight: 600 }} onClick={() => setShowNew(true)}>+ Start one</span>
            </div>
          )}
        </div>
      </div>

      {/* Chat area */}
      <div className="chat-area">
        {activeConv ? (
          <>
            <div className="chat-h">
              <div className="av" style={{ width: 36, height: 36, fontSize: 13, background: activeConv.type === 'group' ? '#7C3AED' : activePeer2?.bg, color: activeConv.type === 'group' ? '#fff' : activePeer2?.color }}>
                {activeConv.type === 'group' ? activeConv.name.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase() : activePeer2?.initials}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--tx)' }}>{chatName}</div>
                <div style={{ fontSize: 11, color: 'var(--tx4)' }}>{chatSub}</div>
              </div>
              <div className="live"><span className="livedot" />Live</div>
            </div>
            <div className="chat-msgs" ref={msgsRef}>
              {thread.length === 0 && (
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--tx4)', fontSize: 13 }}>No messages yet. Say hello!</div>
              )}
              {thread.map(m => {
                const isMe = m.from === user.id;
                const sender = USERS.find(u => u.id === m.from);
                return (
                  <div key={m.id} className={`mrow ${isMe ? 'me' : ''}`}>
                    {!isMe && <div className="av" style={{ width: 28, height: 28, fontSize: 10, background: sender?.bg, color: sender?.color, flexShrink: 0 }}>{sender?.initials}</div>}
                    <div className={`mbbl ${isMe ? 'me' : 'them'}`}>
                      {activeConv.type === 'group' && !isMe && (
                        <div style={{ fontSize: 10, fontWeight: 700, color: sender?.color, marginBottom: 2 }}>{sender?.name}</div>
                      )}
                      {m.text}
                      <div style={{ fontSize: 10, opacity: .6, marginTop: 4, textAlign: isMe ? 'right' : 'left' }}>{new Date(m.at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="chat-inp-row">
              <input className="finp" style={{ flex: 1 }} placeholder={`Message ${chatName}…}] value={text} onChange={e => setText(e.target.value)} onKeyDown={e => e.key === 'Enter' && send()} />
              <button onClick={send} style={{ padding: '8px 16px', borderRadius: 7, border: 'none', background: 'var(--ac)', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>↑</button>
            </div>
          </>
        ) : (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--tx4)' }}>Select a conversation</div>
        )}
      </div>

      {/* New Conversation Modal */}
      {showNew && (
        <div className="overlay on" onClick={e => e.target === e.currentTarget && setShowNew(false)}>
          <div className="modal" style={{ maxWidth: 360 }}>
            <div className="mh">
              <span className="mttl">New Message</span>
              <button className="mcl" onClick={() => setShowNew(false)}>×</button>
            </div>
            <div className="fld">
              <label className="flbl">Select members</label>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', padding: '8px 10px', border: '1.5px solid var(--bd)', borderRadius: 8, minHeight: 42, alignItems: 'center' }}>
                {USERS.filter(u => u.id !== user.id).map(u => {
                  const sel = newMembers.includes(u.id);
                  return (
                    <button key={u.id} onClick={() => setNewMembers(sel ? newMembers.filter(x => x !== u.id) : [...newMembers, u.id])}
                      style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '2px 8px 2px 3px', borderRadius: 20, border: `1.5px solid ${sel ? u.color : 'var(--bd2)'}`, background: sel ? u.bg : 'var(--bg)', color: sel ? u.color : 'var(--tx3)', fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                      <div className="av" style={{ width: 18, height: 18, fontSize: 7, background: u.bg, color: u.color }}>{u.initials}</div>
                      {u.name.split(' ')[0]}
                    </button>
                  );
                })}
              </div>
            </div>
            {newMembers.length > 1 && (
              <div className="fld">
                <label className="flbl">Group name (optional)</label>
                <input className="finp" placeholder="e.g. Design Team" value={newName} onChange={e => setNewName(e.target.value)} />
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 8 }}>
              <button onClick={() => { setShowNew(false); setNewMembers([]); setNewName(''); }} style={{ padding: '8px 16px', borderRadius: 7, border: '1.5px solid var(--bd2)', background: 'var(--sf)', color: 'var(--tx2)', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>Cancel</button>
              <button onClick={createNew} disabled={newMembers.length === 0} style={{ padding: '8px 16px', borderRadius: 7, border: 'none', background: newMembers.length > 0 ? 'var(--ac)' : 'var(--bd)', color: '#fff', fontSize: 13, fontWeight: 600, cursor: newMembers.length > 0 ? 'pointer' : 'default', fontFamily: 'inherit' }}>
                {newMembers.length > 1 ? 'Create Group' : 'Open DM'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
