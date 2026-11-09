import { NextRequest, NextResponse } from 'next/server';
import { safeEqual } from '@/lib/admin-session';
import { getAdminSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { processTelegramQueue } from '@/lib/telegram/queue';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

/** Allowed callers: Vercel Cron (Authorization: Bearer CRON_SECRET) or the signed-in admin. */
async function authorized(req: NextRequest): Promise<boolean> {
  const cronSecret = process.env.CRON_SECRET;
  const header = req.headers.get('authorization') ?? '';
  if (cronSecret && cronSecret.length >= 16 && safeEqual(header, `Bearer ${cronSecret}`)) return true;
  return Boolean(await getAdminSession());
}

async function run(req: NextRequest) {
  if (!(await authorized(req))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const result = await processTelegramQueue({ timeBudgetMs: 50_000 });
    const stats = await db.getTelegramQueueStats();
    return NextResponse.json({ ok: true, ...result, queue: stats });
  } catch (e) {
    return NextResponse.json({ ok: false, error: e instanceof Error ? e.message : String(e) }, { status: 500 });
  }
}

/** Safety-net sweep for anything the background run didn't finish (Vercel Cron uses GET). */
export const GET = run;
/** "Process now" button in the admin Telegram page. */
export const POST = run;
