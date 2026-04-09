import { NextRequest, NextResponse } from 'next/server';
import { INITIAL_MESSAGES } from '@/lib/data';
import { connectDB, isDBEnabled } from '@/lib/mongodb';
import { MessageModel } from '@/lib/models/MessageModel';

export async function GET(req: NextRequest) {
  const conversationId = req.nextUrl.searchParams.get('conversationId');
  if (isDBEnabled) {
    try {
      await connectDB();
      const count = await MessageModel.countDocuments();
      if (count === 0) await MessageModel.insertMany(INITIAL_MESSAGES);
      const filter = conversationId ? { conversationId } : {};
      const messages = await MessageModel.find(filter).lean();
      return NextResponse.json({ messages });
    } catch (err) {
      console.error('[messages GET] DB error:', err);
    }
  }
  return NextResponse.json({ messages: INITIAL_MESSAGES });
}

export async function POST(req: NextRequest) {
  const msg = await req.json();
  if (isDBEnabled) {
    try {
      await connectDB();
      await MessageModel.findOneAndUpdate({ id: msg.id }, msg, { upsert: true, new: true });
      return NextResponse.json({ message: msg, sent: true });
    } catch (err) {
      console.error('[messages POST] DB error:', err);
    }
  }
  return NextResponse.json({ message: msg, sent: true });
}
