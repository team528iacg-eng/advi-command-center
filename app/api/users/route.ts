import { NextRequest, NextResponse } from 'next/server';
import { USERS } from '@/lib/data';
import { connectDB, isDBEnabled } from '@/lib/mongodb';
import { UserModel } from '@/lib/models/UserModel';

export async function GET() {
  if (isDBEnabled) {
    try {
      await connectDB();
      const count = await UserModel.countDocuments();
      if (count === 0) await UserModel.insertMany(USERS);
      const users = await UserModel.find().lean();
      return NextResponse.json({ users });
    } catch (err) {
      console.error('[users GET] DB error:', err);
    }
  }
  return NextResponse.json({ users: USERS });
}

export async function POST(req: NextRequest) {
  const user = await req.json();
  if (isDBEnabled) {
    try {
      await connectDB();
      await UserModel.findOneAndUpdate({ id: user.id }, user, { upsert: true, new: true });
      return NextResponse.json({ user, created: true });
    } catch (err) {
      console.error('[users POST] DB error:', err);
    }
  }
  return NextResponse.json({ user, created: true });
}
