import { NextRequest, NextResponse } from 'next/server';
import { USERS } from '@/lib/data';

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();
  const user = USERS.find(u => u.email === email && u.password === password);
  if (!user) return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  const { password: _, ...safeUser } = user;
  return NextResponse.json({ user: safeUser });
}
