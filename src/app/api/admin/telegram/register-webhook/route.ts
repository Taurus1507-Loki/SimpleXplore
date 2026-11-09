import { requireAdminApi } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const denied = await requireAdminApi();
  if (denied) return denied;

  try {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const secret = process.env.TELEGRAM_WEBHOOK_SECRET;
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

    if (!token || token.includes('dummy')) {
      return NextResponse.json({
        success: false,
        error: 'TELEGRAM_BOT_TOKEN is not configured with a valid token in environment variables.',
      });
    }

    const webhookUrl = `${siteUrl}/api/telegram/webhook`;

    const telegramApiUrl = `https://api.telegram.org/bot${token}/setWebhook`;
    const response = await fetch(telegramApiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        url: webhookUrl,
        secret_token: secret,
        allowed_updates: ['channel_post', 'edited_channel_post'],
      }),
    });

    const data = await response.json();

    if (data.ok) {
      return NextResponse.json({
        success: true,
        message: `Telegram Webhook registered successfully for ${webhookUrl}!`,
        data,
      });
    } else {
      return NextResponse.json({
        success: false,
        error: data.description || 'Telegram API returned an error.',
        data,
      });
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

