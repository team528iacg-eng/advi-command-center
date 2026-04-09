import { NextRequest, NextResponse } from 'next/server';
import { INITIAL_CONVERSATIONS } from '@/lib/data';
import { connectDB, isDBEnabled } from '@/lib/mongodb';
import { ConversationModel } from '@/lib/models/ConversationModel';

export async function GET() {
  if (isDBEnabled) {
    try {
      await connectDB();
      const count = await ConversationModel.countDocuments();
      if (count === 0) await ConversationModel.insertMany(INITIAL_CONVERSATIONS);
      const conversations = await ConversationModel.find().lean();
      return NextResponse.json({ conversations });
    } catch (err) {
      console.error('[conversations GET] DB error:', err);
    }
  }
  return NextResponse.json({ conversations: INITIAL_CONVERSATIONS });
}

export async function POST(req: NextRequest) {
  const conv = await req.json();
  if (isDBEnabled) {
    try {
      await connectDB();
      await ConversationModel.findOneAndUpdate({ id: conv.id }, conv, { upsert: true, new: true });
      return NextResponse.json({ conversation: conv, created: true });
    } catch (err) {
      console.error('[conversations POST] DB error:', err);
    }
  }
  return NextResponse.json({ conversation: conv, created: true });
}
