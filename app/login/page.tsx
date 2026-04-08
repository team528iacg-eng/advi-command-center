'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/lib/store';
import { authenticate } from '@/lib/auth';
import { USERS } from '@/lib/data';

export default function LoginPage() {
  const router = useRouter();
  const login = useStore(s => s.login);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const doLogin = (e?: string, p?: string) => {
    const u = authenticate(e ?? email, p ?? password);
    if (!u) { setError('Invalid email or password.'); return; }
    login(u);
    router.push('/dashboard');
  };

  const loginAs = (id: string) => {
    const u = USERS.find(x => x.id === id);
    if (u) { login(u); router.push('/dashboard'); }
  };

  return (
    <div className="login-page">
      <div className="login-grid">
        <div style={{ animation: 'fi .5s ease' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 36 }}>
            <div className="wsl" style={{ width: 44, height: 44, borderRadius: 12, fontSize: 22 }}>A</div>
            <div>
              <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--tx)' }}>Advi Command</div>
              <div style={{ fontSize: 11, color: 'var(--tx3)' }}>Creative Technology Studio</div>
            </div>
          </div>
          <h1 style={{ fontSize: 36, fontWeight: 800, color: 'var(--tx)', lineHeight: 1.15, marginBottom: 16 }}>
            Your studio&apos;s<br /><span style={{ color: '#7C3AED' }}>command center</span>
          </h1>
          <p style={{ fontSize: 14, color: 'var(--tx3)', lineHeight: 1.7, marginBottom: 28 }}>
            AI-powered project management with voice commands, sprint planning, and intelligent workflow monitoring.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
            {[
              { icon: '🎙', title: 'Voice Task Creation', desc: 'Speak to add tasks, update status, assign work' },
              { icon: '🎯', title: 'Smart Monitoring', desc: 'Auto-detect delays, overdue work, and sprint issues' },
              { icon: '✦', title: 'AI Assistant', desc: 'Ask questions about your tasks, docs, and team' },
              { icon: '🔐', title: 'NextAuth Authentication', desc: 'Credentials + Google SSO · Role-based access control' },
            ].map(f => (
              <div key={f.title} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <div style={{ width: 34, height: 34, borderRadius: 8, background: '#EDE9FE', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>{f.icon}</div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--tx)', marginBottom: 2 }}>{f.title}</div>
                  <div style={{ fontSize: 12, color: 'var(--tx3)' }}>{f.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="login-card" style={{ animation: 'fi .5s ease .1s both' }}>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--tx)', marginBottom: 6 }}>Sign in</h2>
          <p style={{ fontSize: 13, color: 'var(--tx3)', marginBottom: 20 }}>Enter your credentials to access the workspace.</p>
          <button className="gbtn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
            Continue with Google
          </button>
          <div className="fld">
            <label className="flbl">Email</label>
            <input className="finp" placeholder="you@advi.studio" type="email" value={email} onChange={e => setEmail(e.target.value)} />
          </div>
          <div className="fld">
            <label className="flbl">Password</label>
            <input className="finp" placeholder="••••••" type="password" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === 'Enter' && doLogin()} />
          </div>
          {error && <div style={{ fontSize: 12, color: '#DC2626', marginBottom: 10 }}>{error}</div>}
          <button onClick={() => doLogin()} style={{ width: '100%', padding: 9, borderRadius: 8, border: 'none', background: '#7C3AED', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', marginBottom: 20 }}>
            Sign In
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
            <div style={{ flex: 1, height: 1, background: 'var(--bd)' }} />
            <span style={{ fontSize: 11, color: 'var(--tx4)' }}>or quick access</span>
            <div style={{ flex: 1, height: 1, background: 'var(--bd)' }} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {USERS.map(u => (
              <button key={u.id} className="qcard" onClick={() => loginAs(u.id)}>
                <div className="av" style={{ width: 28, height: 28, background: u.bg, color: u.color, fontSize: 11 }}>{u.initials}</div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--tx)' }}>{u.name.split(' ')[0]}</div>
                  <div style={{ fontSize: 10, color: 'var(--tx3)' }}>{u.role}</div>
                </div>
              </button>
            ))}
          </div>
          <p style={{ fontSize: 10, color: 'var(--tx4)', textAlign: 'center', marginTop: 10 }}>NextAuth Credentials · JWT session · Role-based access</p>
        </div>
      </div>
    </div>
  );
}
