import { NextRequest, NextResponse } from 'next/server';
import { TelegramWebhookUpdate, extractUrlsFromMessage } from '@/lib/telegram/service';
import { processTelegramQueue, runAfterResponse } from '@/lib/telegram/queue';
import { safeEqual } from '@/lib/admin-session';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const maxDuration = 60; // background extraction may continue after the reply

/**
 * Telegram webhook: verify → record the update in the queue → reply immediately.
 * Link resolution and page extraction run afterwards (see lib/telegram/queue.ts),
 * so Telegram never waits on slow retailer sites.
 */
export async function POST(req: NextRequest) {
  try {
    // 1. Verify Telegram Webhook Secret Token (fail closed if not configured).
    const configuredSecret = process.env.TELEGRAM_WEBHOOK_SECRET;
    const incomingSecret = req.headers.get('x-telegram-bot-api-secret-token');
    if (!configuredSecret) {
      console.error('TELEGRAM_WEBHOOK_SECRET is not configured; rejecting webhook call.');
      return NextResponse.json({ error: 'Webhook not configured' }, { status: 503 });
    }
    if (!incomingSecret || !safeEqual(incomingSecret, configuredSecret)) {
      console.warn('Unauthorized Telegram webhook attempt: secret token mismatch');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = (await req.json()) as TelegramWebhookUpdate;
    if (!payload || !payload.update_id) {
      return NextResponse.json({ error: 'Invalid update payload' }, { status: 400 });
    }

    const post = payload.channel_post ?? payload.edited_channel_post;
    if (!post) {
      return NextResponse.json({ ok: true, status: 'ignored_unsupported_update_type' });
    }
    const isEdited = !payload.channel_post;
    const messageText = post.text || post.caption || null;

    // 2. Idempotency + queue: the UNIQUE update_id means each update is recorded once.
    const claim = await db.claimTelegramUpdate({
      update_id: payload.update_id,
      channel_id: String(post.chat.id),
      message_id: post.message_id,
      message_text: messageText,
      original_urls: extractUrlsFromMessage(messageText),
      payload: post,
      is_edited: isEdited,
    });
    if (!claim.claimed) {
      return NextResponse.json({ ok: true, message: 'Update already received' });
    }

    // 3. Extract in the background, after Telegram has its reply.
    runAfterResponse(() => processTelegramQueue({ timeBudgetMs: 50_000 }));

    return NextResponse.json({ ok: true, status: isEdited ? 'queued_edited_channel_post' : 'queued_channel_post' });
  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : String(error);
    console.error('Error handling Telegram webhook:', errMsg);
    // Non-2xx makes Telegram retry delivery; the update_id check keeps retries idempotent.
    return NextResponse.json({ ok: false, error: 'Temporary error' }, { status: 500 });
  }
}
