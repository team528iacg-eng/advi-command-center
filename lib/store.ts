'use client';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Task, Message, Space, Conversation, User, INITIAL_TASKS, INITIAL_MESSAGES, INITIAL_CONVERSATIONS, SPACES, USERS } from './data';

// Fire-and-forget API sync — never blocks UI, never throws
const sync = (url: string, method = 'POST', body?: object) => {
  if (typeof window === 'undefined') return;
  fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  }).catch(() => {});
};

interface AppState {
  user: User | null;
  users: User[];
  tasks: Task[];
  messages: Message[];
  spaces: Space[];
  selectedSpaceId: string;
  conversations: Conversation[];
  lastRead: Record<string, string>;
  login: (user: User) => void;
  logout: () => void;
  initializeFromDB: () => Promise<void>;
  addTask: (task: Task) => void;
  updateTask: (id: string, patch: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  sendMessage: (msg: Message) => void;
  setSelectedSpaceId: (id: string) => void;
  createSpace: (name: string) => void;
  renameSpace: (id: string, name: string) => void;
  createConversation: (conv: Conversation) => void;
  markRead: (conversationId: string) => void;
  updateUser: (id: string, patch: Partial<User>) => void;
  removeUser: (id: string) => void;
  addUser: (user: User) => void;
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      user: null,
      users: USERS,
      tasks: INITIAL_TASKS,
      messages: INITIAL_MESSAGES,
      spaces: SPACES,
      conversations: INITIAL_CONVERSATIONS,
      lastRead: {} as Record<string, string>,
      selectedSpaceId: SPACES[0]?.id ?? '528',

      login: (user) => set({ user }),
      logout: () => set({ user: null }),

      // On login, fetch fresh data from DB (if DB is configured)
      // Falls back gracefully — if API returns static data, that's fine too
      initializeFromDB: async () => {
        try {
          const [tasksRes, spacesRes, usersRes, convsRes, msgsRes] = await Promise.allSettled([
            fetch('/api/tasks').then(r => r.json()),
            fetch('/api/spaces').then(r => r.json()),
            fetch('/api/users').then(r => r.json()),
            fetch('/api/conversations').then(r => r.json()),
            fetch('/api/messages').then(r => r.json()),
          ]);
          const updates: Partial<AppState> = {};
          if (tasksRes.status === 'fulfilled' && tasksRes.value.tasks?.length) updates.tasks = tasksRes.value.tasks;
          if (spacesRes.status === 'fulfilled' && spacesRes.value.spaces?.length) updates.spaces = spacesRes.value.spaces;
          if (usersRes.status === 'fulfilled' && usersRes.value.users?.length) updates.users = usersRes.value.users;
          if (convsRes.status === 'fulfilled' && convsRes.value.conversations?.length) updates.conversations = convsRes.value.conversations;
          if (msgsRes.status === 'fulfilled' && msgsRes.value.messages?.length) updates.messages = msgsRes.value.messages;
          if (Object.keys(updates).length > 0) set(updates);
        } catch {
          // Network error — use localStorage data
        }
      },

      addTask: (task) => {
        set((s) => ({ tasks: [...s.tasks, task] }));
        sync('/api/tasks', 'POST', task);
      },
      updateTask: (id, patch) => {
        set((s) => ({ tasks: s.tasks.map((t) => (t.id === id ? { ...t, ...patch } : t)) }));
        sync(`/api/tasks/${id}`, 'PUT', patch);
      },
      deleteTask: (id) => {
        set((s) => ({ tasks: s.tasks.filter((t) => t.id !== id) }));
        sync(`/api/tasks/${id}`, 'DELETE');
      },
      sendMessage: (msg) => {
        set((s) => ({ messages: [...s.messages, msg] }));
        sync('/api/messages', 'POST', msg);
      },
      setSelectedSpaceId: (id) => set({ selectedSpaceId: id }),
      createSpace: (name) => {
        const id = 'sp_' + Date.now();
        const newSpace: Space = { id, name, color: '#6B7280', emoji: 'folder' };
        set((s) => ({ spaces: [...s.spaces, newSpace], selectedSpaceId: id }));
        sync('/api/spaces', 'POST', newSpace);
      },
      renameSpace: (id, name) => {
        set((s) => ({ spaces: s.spaces.map((sp) => (sp.id === id ? { ...sp, name } : sp)) }));
        sync('/api/spaces', 'PUT', { id, name });
      },
      createConversation: (conv) => {
        set((s) => ({ conversations: [...s.conversations.filter(c => c.id !== conv.id), conv] }));
        sync('/api/conversations', 'POST', conv);
      },
      markRead: (conversationId) =>
        set((s) => ({ lastRead: { ...s.lastRead, [conversationId]: new Date().toISOString() } })),
      updateUser: (id, patch) => {
        set((s) => ({
          users: s.users.map((u) => (u.id === id ? { ...u, ...patch } : u)),
          user: s.user?.id === id ? { ...s.user, ...patch } : s.user,
        }));
        sync(`/api/users/${id}`, 'PUT', patch);
      },
      removeUser: (id) => {
        set((s) => ({ users: s.users.filter((u) => u.id !== id) }));
        sync(`/api/users/${id}`, 'DELETE');
      },
      addUser: (user) => {
        set((s) => ({ users: [...s.users, user] }));
        sync('/api/users', 'POST', user);
      },
    }),
    { name: 'advi-store' }
  )
);
