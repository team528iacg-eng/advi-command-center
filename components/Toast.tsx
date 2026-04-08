'use client';
import { useState, useCallback } from 'react';

export type ToastItem = { id: string; icon: string; msg: string; color: string };

export function useToast() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const addToast = useCallback((icon: string, msg: string, color = '#059669') => {
    const id = Math.random().toString(36).slice(2);
    setToasts(t => [...t, { id, icon, msg, color }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3500);
  }, []);
  return { toasts, addToast };
}

export default function Toast({ toasts }: { toasts: ToastItem[] }) {
  return (
    <div className="toasts">
      {toasts.map(t => (
        <div key={t.id} className="toast">
          <div className="td" style={{ background: t.color }} />
          <span style={{ fontSize: 14 }}>{t.icon}</span>
          <span>{t.msg}</span>
        </div>
      ))}
    </div>
  );
}
