'use client';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Task, Message, Space, Conversation, User, INITIAL_TASKS, INITIAL_MESSAGES, INITIAL_CONVERSATIONS, SPACES, USERS } from './data';

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
      addTask: (task) => set((s) => ({ tasks: [...s.tasks, task] })),
      updateTask: (id, patch) =>
        set((s) => ({ tasks: s.tasks.map((t) => (t.id === id ? { ...t, ...patch } : t)) })),
      deleteTask: (id) => set((s) => ({ tasks: s.tasks.filter((t) => t.id !== id) })),
      sendMessage: (msg) => set((s) => ({ messages: [...s.messages, msg] })),
      setSelectedSpaceId: (id) => set({ selectedSpaceId: id }),
      createSpace: (name) => {
        const id = 'sp_' + Date.now();
        const newSpace: Space = { id, name, color: '#6B7280', emoji: 'folder' };
        set((s) => ({ spaces: [...s.spaces, newSpace], selectedSpaceId: id }));
      },
      renameSpace: (id, name) =>
        set((s) => ({ spaces: s.spaces.map((sp) => (sp.id === id ? { ...sp, name } : sp)) })),
      createConversation: (conv) =>
        set((s) => ({ conversations: [...s.conversations.filter(c => c.id !== conv.id), conv] })),
      markRead: (conversationId) =>
        set((s) => ({ lastRead: { ...s.lastRead, [conversationId]: new Date().toISOString() } })),
      updateUser: (id, patch) =>
        set((s) => ({
          users: s.users.map((u) => (u.id === id ? { ...u, ...patch } : u)),
          user: s.user?.id === id ? { ...s.user, ...patch } : s.user,
        })),
      removeUser: (id) =>
        set((s) => ({ users: s.users.filter((u) => u.id !== id) })),
      addUser: (user) =>
        set((s) => ({ users: [...s.users, user] })),
    }),
    { name: 'advi-store' }
  )
);
