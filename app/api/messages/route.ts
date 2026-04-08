import { NextRequest, NextResponse } from 'next/server';
import { INITIAL_MESSAGES } from '@/lib/data';

export async function GET() {
  return NextResponse.json({ messages: INITIAL_MESSAGES });
}

export async function POST(req: NextRequest) {
  const msg = await req.json();
  return NextResponse.json({ message: msg, sent: true });
}
