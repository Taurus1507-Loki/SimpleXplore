'use client';

import React, { useState } from 'react';
import { Mail, Send, Copy, Check } from 'lucide-react';
import { useSiteSettings } from '@/components/SiteSettingsContext';

const TOPICS = [
  'General question',
  'Report an outdated price or broken link',
  'Partnership / brand collaboration',
  'Technical support',
];

/**
 * No email service is connected, so the form never pretends to "send".
 * It opens the visitor's own email app with the message filled in, addressed
 * to the contact email set in Admin → Website Settings.
 */
export default function ContactForm() {
  const { contactEmail, siteName } = useSiteSettings();
  const [name, setName] = useState('');
  const [topic, setTopic] = useState(TOPICS[0]);
  const [message, setMessage] = useState('');
  const [opened, setOpened] = useState(false);
  const [copied, setCopied] = useState(false);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const subject = `[${siteName}] ${topic}`;
    const body = `${message.trim()}\n\n— ${name.trim() || 'A visitor'}`;
    window.location.href = `mailto:${contactEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    setOpened(true);
  };

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(contactEmail);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard blocked; the address is visible anyway
    }
  };

  const input =
    'w-full px-3.5 py-2.5 rounded-xl border border-surface-border focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10 text-copy-primary bg-white';

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 rounded-2xl border border-brand-200 bg-brand-50 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Mail className="h-5 w-5 shrink-0 text-brand-700" aria-hidden="true" />
          <div>
            <p className="text-xs text-brand-800">Email us directly</p>
            <a href={`mailto:${contactEmail}`} className="font-semibold text-ink underline-offset-4 hover:underline">
              {contactEmail}
            </a>
          </div>
        </div>
        <button
          type="button"
          onClick={copyEmail}
          className="inline-flex min-h-[40px] items-center gap-1.5 self-start rounded-xl border border-brand-200 bg-white px-3 text-xs font-semibold text-brand-800 hover:bg-brand-100 sm:self-auto"
        >
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />} {copied ? 'Copied' : 'Copy address'}
        </button>
      </div>

      <form onSubmit={onSubmit} className="space-y-4 rounded-3xl border border-surface-border bg-white p-6 text-xs sm:p-8 sm:text-sm">
        <p className="text-xs text-copy-secondary">Or write your message here — we’ll open your email app with it ready to send.</p>
        <div>
          <label htmlFor="contact-name" className="mb-1 block font-semibold text-copy-primary">Your name</label>
          <input id="contact-name" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" className={input} />
        </div>
        <div>
          <label htmlFor="contact-topic" className="mb-1 block font-semibold text-copy-primary">Topic</label>
          <select id="contact-topic" value={topic} onChange={(e) => setTopic(e.target.value)} className={input}>
            {TOPICS.map((t) => <option key={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="contact-message" className="mb-1 block font-semibold text-copy-primary">Message</label>
          <textarea id="contact-message" rows={5} required value={message} onChange={(e) => setMessage(e.target.value)} placeholder="How can we help?" className={input} />
        </div>
        <button type="submit" className="inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-brand-600 px-6 font-semibold text-white shadow-sm hover:bg-brand-700">
          Open in my email app <Send className="h-4 w-4" aria-hidden="true" />
        </button>
        {opened && (
          <p role="status" className="text-xs text-copy-secondary">
            Your email app should have opened with the message. Nothing happened? Email us at <strong>{contactEmail}</strong>.
          </p>
        )}
      </form>
    </div>
  );
}
