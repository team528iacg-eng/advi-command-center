import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import type { NextRequest } from 'next/server';

export interface RequestUser { id: string; role: string; name: string; }

export function getRequestUser(req: NextRequest): RequestUser | null {
  const id   = req.headers.get('x-user-id');
  const role = req.headers.get('x-user-role');
  const name = decodeURIComponent(req.headers.get('x-user-name') ?? '');
  if (!id || !role) return null;
  return { id, role, name };
}

export async function getSessionUser() {
  const session = await getServerSession(authOptions);
  return session?.user ?? null;
}

export function requireAuth(req: NextRequest): RequestUser | Response {
  const user = getRequestUser(req);
  if (!user) return Response.json({ ok: false, error: 'Authentication required.', code: 'UNAUTHORIZED' }, { status: 401 });
  return user;
}

export function requireAdmin(req: NextRequest): RequestUser | Response {
  const user = getRequestUser(req);
  if (!user) return Response.json({ ok: false, error: 'Authentication required.', code: 'UNAUTHORIZED' }, { status: 401 });
  if (user.role !== 'admin') return Response.json({ ok: false, error: 'Admin access required.', code: 'FORBIDDEN' }, { status: 403 });
  return user;
}
