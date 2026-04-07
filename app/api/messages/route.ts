import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { getSupabaseAdmin } from '@/lib/supabaseClient';
import { validateMessagePayload } from '@/lib/validation';

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const conversationId = searchParams.get('conversation_id');
  if (!conversationId) return NextResponse.json({ ok: false, error: 'conversation_id required' }, { status: 400 });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = getSupabaseAdmin() as any;
  const { data, error } = await db.from('messages').select('*, sender:users(id, name, role)').eq('conversation_id', conversationId).order('created_at');
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, data });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  const body = await req.json().catch(() => null);
  const validation = validateMessagePayload(body);
  if (!validation.ok) return NextResponse.json({ ok: false, error: validation.errors.join(', ') }, { status: 400 });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = getSupabaseAdmin() as any;
  const { data, error } = await db.from('messages').insert({ ...validation.data, sender_id: session.user.id }).select('*, sender:users(id, name, role)').single();
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, data }, { status: 201 });
}
