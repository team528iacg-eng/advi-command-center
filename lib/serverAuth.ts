import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import type { Session } from 'next-auth';

export async function getSession(): Promise<Session | null> {
  return getServerSession(authOptions);
}

export async function requireAuth(): Promise<Session> {
  const session = await getSession();
  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }
  return session;
}

export async function isAdmin(): Promise<boolean> {
  const session = await getSession();
  return session?.user?.role === 'admin';
}

export async function isDirector(): Promise<boolean> {
  const session = await getSession();
  const role = session?.user?.role;
  return role === 'admin' || role === 'director';
}
