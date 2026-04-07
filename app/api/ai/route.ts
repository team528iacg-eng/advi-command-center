import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { aiLimiter, getClientIP, rateLimitResponse } from '@/lib/rateLimit';

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });

  const ip = getClientIP(req);
  const limit = aiLimiter.check(ip);
  if (!limit.ok) return rateLimitResponse(limit);

  const { prompt, context } = await req.json().catch(() => ({}));
  if (!prompt) return NextResponse.json({ ok: false, error: 'prompt required' }, { status: 400 });

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return NextResponse.json({ ok: false, error: 'AI not configured' }, { status: 503 });

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'x-api-key': apiKey, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-3-haiku-20240307',
        max_tokens: 1024,
        system: 'You are Advi, an AI assistant for a creative studio. Help with task management, project planning, and team collaboration. Be concise and actionable.',
        messages: [{ role: 'user', content: context ? `Context: ${context}\n\n${prompt}` : prompt }],
      }),
    });
    const data = await res.json();
    const text = data.content?.[0]?.text ?? '';
    return NextResponse.json({ ok: true, data: { text, model: data.model } });
  } catch (e) {
    return NextResponse.json({ ok: false, error: 'AI request failed' }, { status: 500 });
  }
}
