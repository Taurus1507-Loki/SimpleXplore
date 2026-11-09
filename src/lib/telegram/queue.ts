import { db } from '@/lib/db';
import { processTelegramPost, type TelegramChannelPost } from './service';

export interface QueueRunResult {
  processed: number;
  failed: number;
  remaining: boolean;
}

function isChannelPost(value: unknown): value is TelegramChannelPost {
  const v = value as TelegramChannelPost | null;
  return !!v && typeof v === 'object' && typeof v.message_id === 'number' && !!v.chat && v.chat.id !== undefined;
}

/**
 * Work through queued Telegram updates until the queue is empty or the time budget runs out.
 * Safe to run concurrently (updates are leased atomically). Imports are always saved as drafts.
 */
export async function processTelegramQueue(options: { batchSize?: number; timeBudgetMs?: number } = {}): Promise<QueueRunResult> {
  const batchSize = options.batchSize ?? 5;
  const deadline = Date.now() + (options.timeBudgetMs ?? 20_000);
  let processed = 0;
  let failed = 0;

  while (Date.now() < deadline) {
    const batch = await db.leaseTelegramUpdates(batchSize);
    if (batch.length === 0) return { processed, failed, remaining: false };

    for (const item of batch) {
      if (!isChannelPost(item.payload)) {
        await db.completeTelegramUpdate(item.update_id, { ok: false, error: 'Stored update has no channel post', attempts: Infinity });
        failed++;
        continue;
      }
      try {
        // Per-link extraction errors are recorded as failed imports inside processTelegramPost;
        // only infrastructure errors (e.g. database down) reach the catch and are retried.
        await processTelegramPost(item.payload, item.update_id, item.is_edited);
        await db.completeTelegramUpdate(item.update_id, { ok: true });
        processed++;
      } catch (err) {
        const error = err instanceof Error ? err.message : String(err);
        console.error(`Telegram update ${item.update_id} failed (attempt ${item.attempts}):`, error);
        await db.completeTelegramUpdate(item.update_id, { ok: false, error, attempts: item.attempts });
        failed++;
      }
    }
  }
  return { processed, failed, remaining: true };
}

/**
 * Keep work running after the HTTP response has been sent.
 * On Vercel this uses the platform's `waitUntil` (the same hook `@vercel/functions` reads);
 * on a normal Node server (`next start`, dev) the process stays alive, so a detached promise is enough.
 */
export function runAfterResponse(task: () => Promise<unknown>): void {
  const promise = task().catch((err) => console.error('Background task failed:', err));
  const ctx = (globalThis as Record<symbol, unknown>)[Symbol.for('@vercel/request-context')] as
    | { get?: () => { waitUntil?: (p: Promise<unknown>) => void } | undefined }
    | undefined;
  ctx?.get?.()?.waitUntil?.(promise);
}
