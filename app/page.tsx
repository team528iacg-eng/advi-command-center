'use client';
import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const result = await signIn('credentials', { email, password, redirect: false });
    if (result?.error) {
      setError('Invalid email or password');
      setLoading(false);
    } else {
      router.push('/dashboard');
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0a0a0a', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ width: '100%', maxWidth: '400px', padding: '2rem', backgroundColor: '#111', borderRadius: '12px', border: '1px solid #222' }}>
        <h1 style={{ color: '#fff', fontSize: '1.5rem', textAlign: 'center', marginBottom: '0.5rem' }}>Advi Command Center</h1>
        <p style={{ color: '#666', textAlign: 'center', marginBottom: '2rem', fontSize: '0.875rem' }}>Sign in to your account</p>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ color: '#aaa', fontSize: '0.875rem', display: 'block', marginBottom: '0.4rem' }}>Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="you@advi.studio"
              style={{ width: '100%', padding: '0.75rem', backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '8px', color: '#fff', fontSize: '1rem', boxSizing: 'border-box' }} />
          </div>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ color: '#aaa', fontSize: '0.875rem', display: 'block', marginBottom: '0.4rem' }}>Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="password"
              style={{ width: '100%', padding: '0.75rem', backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '8px', color: '#fff', fontSize: '1rem', boxSizing: 'border-box' }} />
          </div>
          {error && <div style={{ color: '#ff6b6b', backgroundColor: '#2a0a0a', padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.875rem' }}>{error}</div>}
          <button type="submit" disabled={loading}
            style={{ width: '100%', padding: '0.75rem', backgroundColor: '#6366f1', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '1rem', fontWeight: 600, cursor: 'pointer' }}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        <div style={{ marginTop: '1.5rem', padding: '0.75rem', backgroundColor: '#0d0d0d', borderRadius: '8px', border: '1px solid #1a1a1a' }}>
          <p style={{ color: '#555', fontSize: '0.7rem', margin: '0 0 0.3rem 0' }}>Test: hemanth@advi.studio / hk123</p>
          <p style={{ color: '#555', fontSize: '0.7rem', margin: 0 }}>vivek@advi.studio / vm123</p>
        </div>
      </div>
    </div>
  );
}