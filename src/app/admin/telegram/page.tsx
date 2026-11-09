'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Send, 
  ShieldCheck, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  Copy, 
  ExternalLink,
  Play
} from 'lucide-react';

export default function AdminTelegramSettingsPage() {
  const [testMessage, setTestMessage] = useState(
    '🔥 Unbelievable deal! Sony WH-1000XM5 Wireless Headphones at ₹26,990 (was ₹34,990). Grab before it expires: https://www.amazon.in/dp/B09XS7JWHH?tag=simplexplore-21'
  );
  const [simulationResult, setSimulationResult] = useState<string | null>(null);
  const [simulating, setSimulating] = useState(false);
  const [copied, setCopied] = useState(false);

  const webhookUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/api/telegram/webhook` 
    : 'https://simplexplore.com/api/telegram/webhook';

  const handleSimulate = async () => {
    setSimulating(true);
    setSimulationResult(null);

    try {
      const res = await fetch('/api/telegram/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messageText: testMessage }),
      });

      const data = await res.json();
      if (data.success) {
        setSimulationResult(`Success! Created ${data.imports?.length || 1} draft(s) under Pending Review. Remember: NO product is published until you approve it.`);
      } else {
        setSimulationResult(`Simulation failed: ${data.error}`);
      }
    } catch {
      setSimulationResult('Network error executing simulation.');
    } finally {
      setSimulating(false);
    }
  };

  const copyWebhook = () => {
    if (typeof navigator !== 'undefined') {
      navigator.clipboard.writeText(webhookUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-copy-primary flex items-center gap-2.5">
          <Send className="w-7 h-7 text-brand-600" />
          Telegram Channel Automation Engine
        </h1>
        <p className="text-xs text-copy-secondary mt-1">
          Configure official Telegram Bot webhooks and test live channel affiliate link extraction
        </p>
      </div>

      {/* Critical Rule Banner */}
      <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 text-amber-900 flex items-start gap-3 shadow-soft-sm">
        <AlertCircle className="w-5 h-5 flex-shrink-0 text-amber-600 mt-0.5" />
        <div className="text-xs space-y-1">
          <strong className="font-bold uppercase tracking-wider block">
            CRITICAL WORKFLOW RULE ENFORCED:
          </strong>
          <p>
            No product imported from Telegram is ever published automatically. Every incoming post is parsed, validated against SSRF attacks, and securely saved as a <strong>DRAFT</strong> in your admin review queue. You have full control to edit, correct prices, and click &quot;Approve &amp; Publish&quot;.
          </p>
        </div>
      </div>

      {/* Setup Guide Card */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-surface-border shadow-soft-sm space-y-6">
        <h2 className="text-lg font-bold font-display text-copy-primary flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-brand-600" />
          How to Connect Your Telegram Channel (3 Steps)
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-xs text-copy-secondary">
          <div className="p-4 rounded-2xl bg-surface-bg border border-surface-border space-y-2">
            <span className="w-6 h-6 rounded-full bg-brand-500 text-white font-bold flex items-center justify-center text-xs">
              1
            </span>
            <h4 className="font-bold text-copy-primary text-sm">Create Bot with @BotFather</h4>
            <p>
              Open Telegram, search for <strong>@BotFather</strong>, send <code>/newbot</code>, and copy your API token to <code>TELEGRAM_BOT_TOKEN</code> in your environment.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-surface-bg border border-surface-border space-y-2">
            <span className="w-6 h-6 rounded-full bg-brand-500 text-white font-bold flex items-center justify-center text-xs">
              2
            </span>
            <h4 className="font-bold text-copy-primary text-sm">Add Bot as Administrator</h4>
            <p>
              In your Telegram deals channel, add your bot as an <strong>Administrator</strong> with permissions to read/post messages.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-surface-bg border border-surface-border space-y-2">
            <span className="w-6 h-6 rounded-full bg-brand-500 text-white font-bold flex items-center justify-center text-xs">
              3
            </span>
            <h4 className="font-bold text-copy-primary text-sm">Register Webhook Endpoint</h4>
            <p>
              Configure Telegram to post updates to your SimpleXplore webhook URL using the official Telegram SetWebhook method.
            </p>
          </div>
        </div>

        {/* Webhook URL bar */}
        <div className="space-y-3 pt-2 border-t border-surface-border/60">
          <label className="block text-xs font-bold text-copy-primary uppercase tracking-wider">
            Your Webhook Endpoint URL:
          </label>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <input
              type="text"
              readOnly
              value={webhookUrl}
              className="flex-1 bg-surface-bg px-4 py-2.5 rounded-xl border border-surface-border text-xs font-mono text-copy-primary select-all"
            />
            <button
              type="button"
              onClick={copyWebhook}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-brand-50 hover:bg-brand-100 text-brand-700 text-xs font-semibold border border-brand-200 transition-colors"
            >
              <Copy className="w-4 h-4" />
              <span>{copied ? 'Copied!' : 'Copy URL'}</span>
            </button>
            <button
              type="button"
              onClick={async () => {
                try {
                  const res = await fetch('/api/admin/telegram/register-webhook', { method: 'POST' });
                  const data = await res.json();
                  alert(data.message || data.error);
                } catch {
                  alert('Network error registering webhook.');
                }
              }}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-semibold border border-purple-200 transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Auto-Register Webhook</span>
            </button>
          </div>
        </div>
      </div>

      {/* Live Telegram Import Simulator */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-surface-border shadow-soft-sm space-y-5">
        <div>
          <h2 className="text-lg font-bold font-display text-copy-primary flex items-center gap-2">
            <Play className="w-5 h-5 text-brand-600" />
            Live Telegram Channel Simulator
          </h2>
          <p className="text-xs text-copy-secondary">
            Test the automation pipeline right now. Type or paste a sample Telegram message with an affiliate link to verify metadata extraction, price detection, and draft creation.
          </p>
        </div>

        {simulationResult && (
          <div className={`p-4 rounded-2xl text-xs font-medium border flex items-start gap-2.5 ${
            simulationResult.startsWith('Success')
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-rose-50 border-rose-200 text-rose-900'
          }`}>
            {simulationResult.startsWith('Success') ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
            )}
            <div className="space-y-1">
              <div>{simulationResult}</div>
              {simulationResult.startsWith('Success') && (
                <Link
                  href="/admin/telegram/imports"
                  className="font-bold underline text-brand-700 block mt-1"
                >
                  Go to Pending Review Queue →
                </Link>
              )}
            </div>
          </div>
        )}

        <div className="space-y-3">
          <label className="block text-xs font-bold text-copy-primary">
            Simulated Telegram Post Message (Include at least one product URL):
          </label>
          <textarea
            rows={4}
            value={testMessage}
            onChange={(e) => setTestMessage(e.target.value)}
            className="w-full p-4 rounded-2xl border border-surface-border focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10 text-xs sm:text-sm font-mono text-copy-primary"
            placeholder="Type Telegram deal post with URL..."
          />

          <div className="flex items-center justify-between pt-1">
            <div className="text-[11px] text-copy-muted">
              Supports multiple URLs, shortened links (amzn.to, fkrt.it), and price mentions.
            </div>
            <button
              type="button"
              onClick={handleSimulate}
              disabled={simulating || !testMessage.trim()}
              className="inline-flex items-center gap-2 bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white text-xs font-semibold px-6 py-2.5 rounded-xl shadow-soft-sm transition-all"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{simulating ? 'Extracting Metadata...' : 'Run Telegram Import Test'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

