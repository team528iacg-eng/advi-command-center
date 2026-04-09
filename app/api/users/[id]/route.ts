import { NextRequest, NextResponse } from 'next/server';
import { connectDB, isDBEnabled } from '@/lib/mongodb';
import { UserModel } from '@/lib/models/UserModel';

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const patch = await req.json();
  if (isDBEnabled) {
    try {
      await connectDB();
      const updated = await UserModel.findOneAndUpdate({ id: params.id }, { $set: patch }, { new: true }).lean();
      return NextResponse.json({ user: updated });
    } catch (err) {
      console.error('[users PUT] DB error:', err);
    }
  }
  return NextResponse.json({ id: params.id, patch });
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  if (isDBEnabled) {
    try {
      await connectDB();
      await UserModel.deleteOne({ id: params.id });
      return NextResponse.json({ deleted: params.id });
    } catch (err) {
      console.error('[users DELETE] DB error:', err);
    }
  }
  return NextResponse.json({ deleted: params.id });
}
