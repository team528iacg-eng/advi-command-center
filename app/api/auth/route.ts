import { NextRequest, NextResponse } from 'next/server';
import { USERS } from '@/lib/data';
import { connectDB, isDBEnabled } from '@/lib/mongodb';
import { UserModel } from '@/lib/models/UserModel';

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();

  if (isDBEnabled) {
    try {
      await connectDB();
      // Seed DB from static users on cold start
      const count = await UserModel.countDocuments();
      if (count === 0) {
        await UserModel.insertMany(USERS);
      }
      const dbUser = await UserModel.findOne({ email, password });
      if (!dbUser) return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
      const { password: _, ...safeUser } = dbUser.toObject();
      return NextResponse.json({ user: safeUser });
    } catch (err) {
      console.error('[auth] DB error, falling back to static:', err);
    }
  }

  // Fallback: static USERS
  const user = USERS.find(u => u.email === email && u.password === password);
  if (!user) return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  const { password: _, ...safeUser } = user;
  return NextResponse.json({ user: safeUser });
}
