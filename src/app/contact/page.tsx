'use client';

import React, { useState } from 'react';
import { Mail, Send, CheckCircle2 } from 'lucide-react';

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div className="border-b border-surface-border pb-4 space-y-1">
        <h1 className="text-3xl font-extrabold font-display text-copy-primary">
          Contact SimpleXplore
        </h1>
        <p className="text-xs text-copy-secondary">
          Questions, partnership inquiries, or affiliate compliance notices.
        </p>
      </div>

      <div className="bg-white p-8 rounded-3xl border border-surface-border">
        {submitted ? (
          <div className="py-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-brand-50 text-brand-600 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-copy-primary">Message Received</h3>
            <p className="text-xs text-copy-secondary max-w-sm mx-auto">
              Thank you for reaching out. Our support and editorial compliance team will review your message and reply within 24-48 business hours.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs sm:text-sm">
            <div>
              <label className="block font-semibold text-copy-primary mb-1">Your Full Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Rahul Sharma"
                className="w-full px-3.5 py-2.5 rounded-xl border border-surface-border focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10 text-copy-primary"
              />
            </div>

            <div>
              <label className="block font-semibold text-copy-primary mb-1">Email Address</label>
              <input
                type="email"
                required
                placeholder="you@domain.com"
                className="w-full px-3.5 py-2.5 rounded-xl border border-surface-border focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10 text-copy-primary"
              />
            </div>

            <div>
              <label className="block font-semibold text-copy-primary mb-1">Inquiry Topic</label>
              <select className="w-full px-3.5 py-2.5 rounded-xl border border-surface-border focus:outline-none focus:border-brand-500 text-copy-primary bg-white">
                <option>General Question</option>
                <option>Affiliate Link Correction / Report Outdated Price</option>
                <option>Partnership / Brand Collaboration</option>
                <option>Technical Support</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-copy-primary mb-1">Message</label>
              <textarea
                rows={4}
                required
                placeholder="How can we help you?"
                className="w-full px-3.5 py-2.5 rounded-xl border border-surface-border focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10 text-copy-primary"
              />
            </div>

            <button
              type="submit"
              className="inline-flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white font-semibold px-6 py-3 rounded-xl transition-all shadow-sm"
            >
              <span>Send Message</span>
              <Send className="w-4 h-4" />
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

