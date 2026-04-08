'use client';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Task, Message, INITIAL_TASKS, INITIAL_MESSAGES, User, USERS } from './data';

interface AppState {
  user: User | null;
  tasks: Task[];
  messages: Message[];
  login: (user: User) => void;
  logout: () => void;
  addTask: (task: Task) => void;
  updateTask: (id: string, patch: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  sendMessage: (msg: Message) => void;
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      user: null,
      tasks: INITIAL_TASKS,
      messages: INITIAL_MESSAGES,
      login: (user) => set({ user }),
      logout: () => set({ user: null }),
      addTask: (task) => set((s) => ({ tasks: [...s.tasks, task] })),
      updateTask: (id, patch) =>
        set((s) => ({ tasks: s.tasks.map((t) => (t.id === id ? { ...t, ...patch } : t)) })),
      deleteTask: (id) => set((s) => ({ tasks: s.tasks.filter((t) => t.id !== id) })),
      sendMessage: (msg) => set((s) => ({ messages: [...s.messages, msg] })),
    }),
    { name: 'advi-store' }
  )
);
