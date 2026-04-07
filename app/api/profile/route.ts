import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { getSupabaseAdmin } from '@/lib/supabaseClient';
import { validateProfilePayload } from '@/lib/validation';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = getSupabaseAdmin() as any;
  const { data: user } = await db.from('users').select('id, name, email, role, created_at').eq('id', session.user.id).single();
  const { data: profile } = await db.from('profiles').select('*').eq('user_id', session.user.id).single();
  return NextResponse.json({ ok: true, data: { user, profile } });
}

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  const body = await req.json().catch(() => null);
  const validation = validateProfilePayload(body);
  if (!validation.ok) return NextResponse.json({ ok: false, error: validation.errors.join(', ') }, { status: 400 });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = getSupabaseAdmin() as any;
  const { data, error } = await db.from('profiles').upsert({ user_id: session.user.id, ...validation.data, updated_at: new Date().toISOString() }).select('*').single();
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, data });
}
