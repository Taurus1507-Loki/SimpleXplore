import { NextRequest, NextResponse } from 'next/server';
import { TelegramWebhookUpdate, processTelegramPost } from '@/lib/telegram/service';

// In-memory set of processed update IDs to ensure strict idempotency
const processedUpdateIds = new Set<number>();

export async function POST(req: NextRequest) {
  try {
    // 1. Verify Telegram Webhook Secret Token
    const configuredSecret = process.env.TELEGRAM_WEBHOOK_SECRET;
    const incomingSecret = req.headers.get('x-telegram-bot-api-secret-token');

    if (configuredSecret && incomingSecret !== configuredSecret) {
      console.warn('Unauthorized Telegram webhook attempt: secret token mismatch');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = (await req.json()) as TelegramWebhookUpdate;

    if (!payload || !payload.update_id) {
      return NextResponse.json({ error: 'Invalid update payload' }, { status: 400 });
    }

    // 2. Idempotency Check: Prevent duplicate processing
    if (processedUpdateIds.has(payload.update_id)) {
      return NextResponse.json({ ok: true, message: 'Update already processed' });
    }
    processedUpdateIds.add(payload.update_id);
    if (processedUpdateIds.size > 10000) {
      // Keep memory bounded
      const oldest = Array.from(processedUpdateIds).slice(0, 5000);
      oldest.forEach(id => processedUpdateIds.delete(id));
    }

    // 3. Process new channel post
    if (payload.channel_post) {
      await processTelegramPost(payload.channel_post, payload.update_id, false);
      return NextResponse.json({ ok: true, status: 'processed_channel_post' });
    }

    // 4. Process edited channel post
    if (payload.edited_channel_post) {
      await processTelegramPost(payload.edited_channel_post, payload.update_id, true);
      return NextResponse.json({ ok: true, status: 'processed_edited_channel_post' });
    }

    return NextResponse.json({ ok: true, status: 'ignored_unsupported_update_type' });
  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : String(error);
    console.error('Error handling Telegram webhook:', errMsg);
    // Return 200 to acknowledge update and avoid Telegram retry floods
    return NextResponse.json({ ok: false, error: errMsg }, { status: 200 });
  }
}

