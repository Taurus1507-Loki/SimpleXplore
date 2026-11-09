import React from 'react';
import Link from 'next/link';
import { Settings, Send, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';
import { db } from '@/lib/db';
import { getTelegramStatus } from '@/lib/telegram/status';
import SettingsClient from './SettingsClient';

export const dynamic = 'force-dynamic';

function Row({ ok, warn, label, detail }: { ok: boolean; warn?: boolean; label: string; detail: React.ReactNode }) {
  const Icon = ok ? CheckCircle2 : warn ? AlertTriangle : XCircle;
  const color = ok ? 'text-emerald-600' : warn ? 'text-amber-600' : 'text-red-600';
  return (
    <li className="flex items-start gap-3 py-2.5">
      <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${color}`} aria-hidden="true" />
      <div>
        <p className="text-xs font-semibold text-copy-primary">
          {label} <span className="sr-only">{ok ? '(ok)' : warn ? '(warning)' : '(not ready)'}</span>
        </p>
        <p className="text-[11px] text-copy-secondary">{detail}</p>
      </div>
    </li>
  );
}

export default async function AdminSettingsPage() {
  const [settings, tg] = await Promise.all([db.getSettings(), getTelegramStatus()]);
  const connected = tg.tokenConfigured && tg.secretConfigured && !!tg.webhook?.pointsHere;

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-copy-primary flex items-center gap-2.5">
          <Settings className="w-7 h-7 text-brand-600" />
          Website Settings
        </h1>
        <p className="text-xs text-copy-secondary mt-1">Branding, homepage, contact details and disclosures — saved changes apply to the live website.</p>
      </div>

      {/* Telegram integration status */}
      <section aria-labelledby="tg-status" className="max-w-4xl rounded-3xl border border-surface-border bg-white p-6 shadow-soft-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 id="tg-status" className="flex items-center gap-2 text-base font-bold font-display text-copy-primary">
            <Send className="h-4 w-4 text-brand-600" aria-hidden="true" /> Telegram integration
          </h2>
          <span
            className={`rounded-full px-3 py-1 text-xs font-bold ${
              connected ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
            }`}
          >
            {connected ? 'Connected' : 'Not connected yet'}
          </span>
        </div>
        <ul className="mt-3 divide-y divide-surface-border/60">
          <Row
            ok={tg.tokenConfigured}
            label="Bot token"
            detail={tg.tokenConfigured ? 'Set on the server (never shown in the browser).' : 'Add TELEGRAM_BOT_TOKEN from @BotFather to the server environment.'}
          />
          <Row
            ok={tg.secretConfigured}
            label="Webhook secret"
            detail={tg.secretConfigured ? 'Set — fake requests are rejected.' : 'Set TELEGRAM_WEBHOOK_SECRET to a long random value.'}
          />
          <Row
            ok={!!tg.webhook?.pointsHere}
            warn={!!tg.webhook && !tg.webhook.pointsHere}
            label="Webhook"
            detail={
              !tg.tokenConfigured
                ? 'Needs the bot token first.'
                : tg.webhookCheckError
                  ? tg.webhookCheckError
                  : tg.webhook?.pointsHere
                    ? <>Registered to this site{tg.webhook.lastError ? <> · last Telegram error: {tg.webhook.lastError}</> : null}</>
                    : tg.webhook?.url
                      ? <>Points to a different address ({tg.webhook.url}). Re-register from the <Link href="/admin/telegram" className="text-brand-700 underline">Telegram page</Link>.</>
                      : <>Not registered. Deploy the site, then click “Auto-Register Webhook” on the <Link href="/admin/telegram" className="text-brand-700 underline">Telegram page</Link>.</>
            }
          />
          <Row
            ok={tg.queue.failed === 0}
            warn={tg.queue.pending > 0}
            label="Posts received"
            detail={`${tg.postsReceived} so far · ${tg.queue.pending} waiting · ${tg.queue.failed} failed after retries`}
          />
        </ul>
        {!tg.webhook?.pointsHere && (
          <p className="mt-2 text-[11px] text-copy-muted">Expected webhook address: <code className="font-mono">{tg.expectedWebhookUrl}</code></p>
        )}
      </section>

      <SettingsClient initialSettings={settings} />
    </div>
  );
}
