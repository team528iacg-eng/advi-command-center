import { NextRequest, NextResponse } from 'next/server';
import { INITIAL_TASKS } from '@/lib/data';

// In a real app this would be a database. For now serves initial data.
export async function GET() {
  return NextResponse.json({ tasks: INITIAL_TASKS });
}

export async function POST(req: NextRequest) {
  const task = await req.json();
  return NextResponse.json({ task, created: true });
}
