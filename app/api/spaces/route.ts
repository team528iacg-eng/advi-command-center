import { NextRequest, NextResponse } from 'next/server';
import { SPACES } from '@/lib/data';
import { connectDB, isDBEnabled } from '@/lib/mongodb';
import { SpaceModel } from '@/lib/models/SpaceModel';

export async function GET() {
  if (isDBEnabled) {
    try {
      await connectDB();
      const count = await SpaceModel.countDocuments();
      if (count === 0) await SpaceModel.insertMany(SPACES);
      const spaces = await SpaceModel.find().lean();
      return NextResponse.json({ spaces });
    } catch (err) {
      console.error('[spaces GET] DB error:', err);
    }
  }
  return NextResponse.json({ spaces: SPACEP });
}

export async function POST(req: NextRequest) {
  const space = await req.json();
  if (isDBEnabled) {
    try {
      await connectDB();
      await SpaceModel.findOneAndUpdate({ id: space.id }, space, { upsert: true, new: true });
      return NextResponse.json({ space, created: true });
    } catch (err) {
      console.error('[spaces POST] DB error:', err);
    }
  }
  return NextResponse.json({ space, created: true });
}

export async function PUT(req: NextRequest) {
  const { id, ...patch } = await req.json();
  if (isDBEnabled) {
    try {
      await connectDB();
      const updated = await SpaceModel.findOneAndUpdate({ id }, { $set: patch }, { new: true }).lean();
      return NextResponse.json({ space: updated });
    } catch (err) {
      console.error('[spaces PUT] DB error:', err);
    }
  }
  return NextResponse.json({ id, patch });
}
