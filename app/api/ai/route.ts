import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { messages, system } = await req.json();

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ reply: 'AI is not configured. Please add ANTHROPIC_API_KEY to environment variables.' });
  }

  const formatted = messages.map((m: { role: string; text: string }) => ({
    role: m.role === 'user' ? 'user' : 'assistant',
    content: m.text,
  }));

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        system,
        messages: formatted,
      }),
    });

    const data = await res.json();
    const reply = data.content?.[0]?.text ?? 'No response.';
    return NextResponse.json({ reply });
  } catch (e) {
    return NextResponse.json({ reply: 'Error connecting to AI. Please try again.' });
  }
}
