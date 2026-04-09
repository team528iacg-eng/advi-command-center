import { NextRequest, NextResponse } from 'next/server';
import { connectDB, isDBEnabled } from '@/lib/mongodb';
import { TaskModel } from '@/lib/models/TaskModel';

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const patch = await req.json();
  if (isDBEnabled) {
    try {
      await connectDB();
      const updated = await TaskModel.findOneAndUpdate({ id: params.id }, { $set: patch }, { new: true }).lean();
      return NextResponse.json({ task: updated });
    } catch (err) {
      console.error('[tasks PUT] DB error:', err);
    }
  }
  return NextResponse.json({ id: params.id, patch });
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  if (isDBEnabled) {
    try {
      await connectDB();
      await TaskModel.deleteOne({ id: params.id });
      return NextResponse.json({ deleted: params.id });
    } catch (err) {
      console.error('[tasks DELETE] DB error:', err);
    }
  }
  return NextResponse.json({ deleted: params.id });
}
