import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { getSupabaseAdmin } from '@/lib/supabaseClient';
import { validateTaskPayload } from '@/lib/validation';
import { apiLimiter, getClientIP, rateLimitResponse } from '@/lib/rateLimit';

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });

  const ip = getClientIP(req);
  const limit = apiLimiter.check(ip);
  if (!limit.ok) return rateLimitResponse(limit);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = getSupabaseAdmin() as any;
  const { searchParams } = new URL(req.url);
  let query = db.from('tasks').select('*').order('created_at', { ascending: false });
  if (searchParams.get('status')) query = query.eq('status', searchParams.get('status'));
  if (searchParams.get('assigned_to')) query = query.contains('assigned_to', [searchParams.get('assigned_to')]);

  const { data, error } = await query;
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, data });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });

  const body = await req.json().catch(() => null);
  const validation = validateTaskPayload(body);
  if (!validation.ok) return NextResponse.json({ ok: false, error: validation.errors.join(', ') }, { status: 400 });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = getSupabaseAdmin() as any;
  const { data, error } = await db.from('tasks').insert({
    ...validation.data,
    created_by: session.user.id,
    status: (validation.data as any).status ?? 'todo',
    priority: (validation.data as any).priority ?? 'normal',
    time_estimate: (validation.data as any).time_estimate ?? 0,
    time_logged: 0,
    assigned_to: (validation.data as any).assigned_to ?? [],
    tags: (validation.data as any).tags ?? [],
    subtasks: [],
    comments: [],
    completion_approved: false,
  }).select('*').single();
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, data }, { status: 201 });
}
