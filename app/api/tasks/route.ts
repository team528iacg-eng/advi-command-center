import { NextRequest, NextResponse } from 'next/server';
import { INITIAL_TASKS } from '@/lib/data';
import { connectDB, isDBEnabled } from '@/lib/mongodb';
import { TaskModel } from '@/lib/models/TaskModel';

export async function GET(req: NextRequest) {
  const spaceId = req.nextUrl.searchParams.get('spaceId');
  if (isDBEnabled) {
    try {
      await connectDB();
      const count = await TaskModel.countDocuments();
      if (count === 0) await TaskModel.insertMany(INITIAL_TASKS);
      const filter = spaceId ? { spaceId } : {};
      const tasks = await TaskModel.find(filter).lean();
      return NextResponse.json({ tasks });
    } catch (err) {
      console.error('[tasks GET] DB error:', err);
    }
  }
  const tasks = spaceId ? INITIAL_TASKS.filter(t => t.spaceId === spaceId) : INITIAL_TASKS;
  return NextResponse.json({ tasks });
}

export async function POST(req: NextRequest) {
  const task = await req.json();
  if (isDBEnabled) {
    try {
      await connectDB();
      await TaskModel.findOneAndUpdate({ id: task.id }, task, { upsert: true, new: true });
      return NextResponse.json({ task, created: true });
    } catch (err) {
      console.error('[tasks POST] DB error:', err);
    }
  }
  return NextResponse.json({ task, created: true });
}
