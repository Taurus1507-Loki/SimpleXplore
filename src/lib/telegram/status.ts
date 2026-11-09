import { db } from '@/lib/db';
import { getSiteUrl } from '@/lib/seo';

export interface TelegramStatus {
  tokenConfigured: boolean;
  secretConfigured: boolean;
  /** Result of Telegram's getWebhookInfo; null when the token isn't set or Telegram couldn't be reached. */
  webhook: { url: string; pointsHere: boolean; pendingUpdates: number; lastError: string | null } | null;
  webhookCheckError: string | null;
  postsReceived: number;
  queue: { pending: number; failed: number };
  expectedWebhookUrl: string;
}

function realToken(): string | null {
  const t = process.env.TELEGRAM_BOT_TOKEN?.trim();
  if (!t || !/^\d{5,}:[A-Za-z0-9_-]{30,}$/.test(t) || t.includes('ABCdef')) return null;
  return t;
}

/** Connection health for Admin → Website Settings. The bot token never leaves the server. */
export async function getTelegramStatus(): Promise<TelegramStatus> {
  const token = realToken();
  const secret = process.env.TELEGRAM_WEBHOOK_SECRET?.trim() ?? '';
  const expectedWebhookUrl = `${getSiteUrl()}/api/telegram/webhook`;
  const [postsReceived, queue] = await Promise.all([db.getTelegramPostCount(), db.getTelegramQueueStats()]);

  let webhook: TelegramStatus['webhook'] = null;
  let webhookCheckError: string | null = null;
  if (token) {
    try {
      const res = await fetch(`https://api.telegram.org/bot${token}/getWebhookInfo`, {
        cache: 'no-store',
        signal: AbortSignal.timeout(5000),
      });
      const data = await res.json();
      if (data.ok) {
        const info = data.result ?? {};
        webhook = {
          url: info.url ?? '',
          pointsHere: info.url === expectedWebhookUrl,
          pendingUpdates: Number(info.pending_update_count ?? 0),
          lastError: info.last_error_message ?? null,
        };
      } else {
        webhookCheckError = data.description || 'Telegram rejected the bot token.';
      }
    } catch {
      webhookCheckError = 'Couldn’t reach Telegram to check the webhook.';
    }
  }

  return {
    tokenConfigured: Boolean(token),
    secretConfigured: secret.length >= 16 && !/your-|super_secret_webhook_random_token_12345/.test(secret),
    webhook,
    webhookCheckError,
    postsReceived,
    queue,
    expectedWebhookUrl,
  };
}
