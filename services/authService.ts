import bcrypt from 'bcryptjs';
import { getSupabaseAdmin } from '@/lib/supabaseClient';
import { ROLE_AVATAR, getInitials } from '@/lib/roleConfig';

export interface AuthUser {
  id: string; name: string; email: string; role: string;
  initials: string; avatarBg: string; avatarColor: string;
}

export async function validateCredentials(email: string, password: string): Promise<AuthUser | null> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = getSupabaseAdmin() as any;
  const { data: user, error } = await db.from('users').select('id, name, email, role, password_hash').eq('email', email.toLowerCase().trim()).single();
  if (error || !user) { await bcrypt.compare(password, '$2a$12$dummyhashtopreventtimingattack0000000000000000000'); return null; }
  if (!user.password_hash) return null;
  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) return null;
  const avatar = ROLE_AVATAR[user.role] ?? ROLE_AVATAR.member;
  return { id: user.id, name: user.name, email: user.email, role: user.role, initials: getInitials(user.name), avatarBg: avatar.bg, avatarColor: avatar.color };
}

export async function findOrCreateGoogleUser(email: string, name: string): Promise<AuthUser> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = getSupabaseAdmin() as any;
  const { data: existing } = await db.from('users').select('id, name, email, role').eq('email', email.toLowerCase().trim()).single();
  if (existing) {
    const avatar = ROLE_AVATAR[existing.role] ?? ROLE_AVATAR.member;
    return { id: existing.id, name: existing.name, email: existing.email, role: existing.role, initials: getInitials(existing.name), avatarBg: avatar.bg, avatarColor: avatar.color };
  }
  const { data: created, error } = await db.from('users').insert({ name: name ?? email.split('@')[0], email: email.toLowerCase().trim(), role: 'member' }).select('id, name, email, role').single();
  if (error || !created) throw new Error('Failed to create Google user: ' + error?.message);
  await db.from('profiles').insert({ user_id: created.id });
  const avatar = ROLE_AVATAR.member;
  return { id: created.id, name: created.name, email: created.email, role: created.role, initials: getInitials(created.name), avatarBg: avatar.bg, avatarColor: avatar.color };
}

export async function getUserForSession(userId: string): Promise<AuthUser | null> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = getSupabaseAdmin() as any;
  const { data: user, error } = await db.from('users').select('id, name, email, role').eq('id', userId).single();
  if (error || !user) return null;
  const avatar = ROLE_AVATAR[user.role] ?? ROLE_AVATAR.member;
  return { id: user.id, name: user.name, email: user.email, role: user.role, initials: getInitials(user.name), avatarBg: avatar.bg, avatarColor: avatar.color };
}

export async function hashPassword(plaintext: string): Promise<string> {
  return bcrypt.hash(plaintext, 12);
}
