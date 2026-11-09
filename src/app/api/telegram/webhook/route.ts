import { NextRequest, NextResponse } from 'next/server';
import { TelegramWebhookUpdate, extractUrlsFromMessage, processTelegramPost } from '@/lib/telegram/service';
import { safeEqual } from '@/lib/admin-session';
import { db } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    // 1. Verify Telegram Webhook Secret Token
    const configuredSecret = process.env.TELEGRAM_WEBHOOK_SECRET;
    const incomingSecret = req.headers.get('x-telegram-bot-api-secret-token');

    // Fail closed: without a configured secret anyone could inject "posts".
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
      // Nothing is imported for other update types, so there is nothing to de-duplicate.
      return NextResponse.json({ ok: true, status: 'ignored_unsupported_update_type' });
    }
    const isEdited = !payload.channel_post;
    const messageText = post.text || post.caption || null;

    // 2. Idempotency: the UNIQUE update_id in telegram_updates (in-memory set in demo mode)
    //    guarantees each update is processed at most once, across restarts and instances.
    const claim = await db.claimTelegramUpdate({
      update_id: payload.update_id,
      channel_id: String(post.chat.id),
      message_id: post.message_id,
      message_text: messageText,
      original_urls: extractUrlsFromMessage(messageText),
    });
    if (!claim.claimed) {
      return NextResponse.json({ ok: true, message: 'Update already processed' });
    }

    // 3. Process the channel post. Imports are always saved as pending drafts.
    try {
      await processTelegramPost(post, payload.update_id, isEdited);
    } catch (err) {
      await db.setTelegramUpdateStatus(payload.update_id, 'failed');
      throw err;
    }
    await db.setTelegramUpdateStatus(payload.update_id, 'processed');

    return NextResponse.json({
      ok: true,
      status: isEdited ? 'processed_edited_channel_post' : 'processed_channel_post',
    });
  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : String(error);
    console.error('Error handling Telegram webhook:', errMsg);
    // Return 200 to acknowledge update and avoid Telegram retry floods
    return NextResponse.json({ ok: false, error: errMsg }, { status: 200 });
  }
}
