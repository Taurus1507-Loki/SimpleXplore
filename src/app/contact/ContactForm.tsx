'use client';

import React, { useState } from 'react';
import { Send, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

const TOPICS = [
  'General question',
  'Report an outdated price or broken link',
  'Partnership / brand collaboration',
  'Technical support',
];

/**
 * Sends the visitor's message to the server (/api/contact), which emails it
 * to the owner's inbox without ever exposing the owner's email address.
 */
export default function ContactForm() {
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [topic, setTopic] = useState(TOPICS[0]);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setStatus(null);

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, contact, topic, message }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) {
        setStatus({ type: 'error', text: data.error || 'Could not send your message. Please try again.' });
        return;
      }
      setStatus({ type: 'success', text: 'Thanks! Your message has been sent. We will get back to you soon.' });
      setName('');
      setContact('');
      setTopic(TOPICS[0]);
      setMessage('');
    } catch {
      setStatus({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setSending(false);
    }
  };

  const input =
    'w-full px-3.5 py-2.5 rounded-xl border border-surface-border focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10 text-copy-primary bg-white';

  return (
    <form onSubmit={onSubmit} className="space-y-4 rounded-3xl border border-surface-border bg-white p-6 text-xs sm:p-8 sm:text-sm">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="contact-name" className="mb-1 block font-semibold text-copy-primary">
            Your name <span className="text-red-600">*</span>
          </label>
          <input
            id="contact-name"
            required
            minLength={2}
            maxLength={100}
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="name"
            placeholder="Your full name"
            className={input}
          />
        </div>

        <div>
          <label htmlFor="contact-info" className="mb-1 block font-semibold text-copy-primary">
            Phone number or email <span className="text-red-600">*</span>
          </label>
          <input
            id="contact-info"
            required
            minLength={5}
            maxLength={120}
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            placeholder="+91 98765 43210 or you@example.com"
            className={input}
          />
        </div>
      </div>

      <div>
        <label htmlFor="contact-topic" className="mb-1 block font-semibold text-copy-primary">
          Topic
        </label>
        <select id="contact-topic" value={topic} onChange={(e) => setTopic(e.target.value)} className={input}>
          {TOPICS.map((t) => (
            <option key={t}>{t}</option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="contact-message" className="mb-1 block font-semibold text-copy-primary">
          Message <span className="text-red-600">*</span>
        </label>
        <textarea
          id="contact-message"
          rows={5}
          required
          minLength={5}
          maxLength={2000}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="How can we help?"
          className={input}
        />
      </div>

      {status && (
        <div
          role={status.type === 'error' ? 'alert' : 'status'}
          className={`flex items-center gap-2 rounded-xl border px-3.5 py-2.5 text-xs font-medium ${
            status.type === 'success'
              ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
              : 'border-rose-200 bg-rose-50 text-rose-800'
          }`}
        >
          {status.type === 'success' ? (
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" aria-hidden="true" />
          ) : (
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" aria-hidden="true" />
          )}
          <span>{status.text}</span>
        </div>
      )}

      <button
        type="submit"
        disabled={sending}
        className="inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-brand-600 px-6 font-semibold text-white shadow-sm hover:bg-brand-700 disabled:opacity-60"
      >
        {sending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> Sending…
          </>
        ) : (
          <>
            Send message <Send className="h-4 w-4" aria-hidden="true" />
          </>
        )}
      </button>
    </form>
  );
}
