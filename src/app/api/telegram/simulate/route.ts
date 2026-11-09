import { requireAdminApi } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';
import { processTelegramPost } from '@/lib/telegram/service';

export async function POST(req: NextRequest) {
  const denied = await requireAdminApi();
  if (denied) return denied;

  try {
    const { messageText, channelName = 'SimpleXplore Deals Channel' } = await req.json();

    if (!messageText || typeof messageText !== 'string') {
      return NextResponse.json({ error: 'Message text is required' }, { status: 400 });
    }

    const simulatedPost = {
      message_id: Math.floor(Math.random() * 90000) + 10000,
      chat: {
        id: -100123456789,
        title: channelName,
      },
      date: Math.floor(Date.now() / 1000),
      text: messageText,
    };

    const simulatedUpdateId = Math.floor(Math.random() * 900000) + 100000;
    const imports = await processTelegramPost(simulatedPost, simulatedUpdateId, false);

    return NextResponse.json({
      success: true,
      message: `Extracted ${imports.length} link(s) as draft(s). Pending admin review.`,
      imports,
    });
  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ success: false, error: errMsg }, { status: 500 });
  }
}

