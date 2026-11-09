'use client';

import React, { useState } from 'react';
import { WebsiteSettings } from '@/types';
import { Save, CheckCircle2, Settings, Palette } from 'lucide-react';
import { applyThemeColors } from '@/lib/utils/colors';

export default function SettingsClient({ initialSettings }: { initialSettings: WebsiteSettings }) {
  const [siteName, setSiteName] = useState(initialSettings.site_name);
  const [tagline, setTagline] = useState(initialSettings.tagline);
  const [primaryColor, setPrimaryColor] = useState(initialSettings.primary_color);
  const [defaultCurrency, setDefaultCurrency] = useState(initialSettings.default_currency);
  const [contactEmail, setContactEmail] = useState(initialSettings.contact_email);
  const [telegramUrl, setTelegramUrl] = useState(initialSettings.social_links.telegram || '');
  const [twitterUrl, setTwitterUrl] = useState(initialSettings.social_links.twitter || '');
  const [instagramUrl, setInstagramUrl] = useState(initialSettings.social_links.instagram || '');
  const [affiliateDisclosure, setAffiliateDisclosure] = useState(initialSettings.affiliate_disclosure);

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleColorChange = (color: string) => {
    setPrimaryColor(color);
    if (/^#[0-9A-Fa-f]{6}$/.test(color)) {
      applyThemeColors(color);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaved(false);

    try {
      await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          site_name: siteName,
          tagline,
          primary_color: primaryColor,
          default_currency: defaultCurrency,
          contact_email: contactEmail,
          social_links: {
            telegram: telegramUrl,
            twitter: twitterUrl,
            instagram: instagramUrl,
          },
          affiliate_disclosure: affiliateDisclosure,
        }),
      });

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSave} className="space-y-6 max-w-4xl text-xs sm:text-sm">
      {saved && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Website settings successfully saved and applied.</span>
        </div>
      )}

      {/* General Settings */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-surface-border shadow-soft-sm space-y-4">
        <h2 className="text-base font-bold font-display text-copy-primary">
          Branding &amp; Identity
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-semibold text-copy-primary mb-1">Brand Name</label>
            <input
              type="text"
              value={siteName}
              onChange={(e) => setSiteName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-surface-border focus:outline-none focus:border-brand-500 font-semibold"
            />
          </div>

          <div>
            <label className="block font-semibold text-copy-primary mb-1">Tagline</label>
            <input
              type="text"
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-surface-border focus:outline-none focus:border-brand-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block font-semibold text-copy-primary">Primary Brand Color</label>
              <span className="text-[11px] text-brand-600 font-bold">Applies Live</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={primaryColor}
                onChange={(e) => handleColorChange(e.target.value)}
                className="w-10 h-10 rounded-xl border border-surface-border cursor-pointer p-0.5 bg-white"
              />
              <input
                type="text"
                value={primaryColor}
                onChange={(e) => handleColorChange(e.target.value)}
                className="flex-1 px-3.5 py-2.5 rounded-xl border border-surface-border font-mono text-xs uppercase focus:outline-none focus:border-brand-500 font-bold"
              />
            </div>

            {/* Quick Preset Colors */}
            <div className="flex items-center gap-1.5 mt-2">
              <span className="text-[10px] text-copy-muted font-bold uppercase">Presets:</span>
              {[
                { name: 'Emerald', hex: '#168A45' },
                { name: 'Royal Blue', hex: '#2563EB' },
                { name: 'Indigo', hex: '#4F46E5' },
                { name: 'Purple', hex: '#9333EA' },
                { name: 'Crimson', hex: '#E11D48' },
                { name: 'Teal', hex: '#0D9488' },
              ].map((c) => (
                <button
                  key={c.hex}
                  type="button"
                  title={c.name}
                  onClick={() => handleColorChange(c.hex)}
                  className="w-5 h-5 rounded-full border border-black/10 hover:scale-110 transition-transform shadow-xs"
                  style={{ backgroundColor: c.hex }}
                />
              ))}
            </div>
          </div>

          <div>
            <label className="block font-semibold text-copy-primary mb-1">Default Market Currency</label>
            <select
              value={defaultCurrency}
              onChange={(e) => setDefaultCurrency(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-surface-border focus:outline-none focus:border-brand-500 bg-white font-semibold"
            >
              <option value="INR">INR (₹) — India</option>
              <option value="USD">USD ($) — United States</option>
              <option value="GBP">GBP (£) — United Kingdom</option>
              <option value="EUR">EUR (€) — Europe</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block font-semibold text-copy-primary mb-1">Public Contact Email</label>
          <input
            type="email"
            value={contactEmail}
            onChange={(e) => setContactEmail(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-surface-border focus:outline-none focus:border-brand-500"
          />
        </div>
      </div>

      {/* Social Links */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-surface-border shadow-soft-sm space-y-4">
        <h2 className="text-base font-bold font-display text-copy-primary">
          Social &amp; Telegram Channel Links
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block font-semibold text-copy-primary mb-1">Telegram Channel URL</label>
            <input
              type="url"
              value={telegramUrl}
              onChange={(e) => setTelegramUrl(e.target.value)}
              placeholder="https://t.me/yourchannel"
              className="w-full px-3.5 py-2.5 rounded-xl border border-surface-border focus:outline-none focus:border-brand-500 font-mono text-xs"
            />
          </div>

          <div>
            <label className="block font-semibold text-copy-primary mb-1">Twitter / X URL</label>
            <input
              type="url"
              value={twitterUrl}
              onChange={(e) => setTwitterUrl(e.target.value)}
              placeholder="https://x.com/yourhandle"
              className="w-full px-3.5 py-2.5 rounded-xl border border-surface-border focus:outline-none focus:border-brand-500 font-mono text-xs"
            />
          </div>

          <div>
            <label className="block font-semibold text-copy-primary mb-1">Instagram URL</label>
            <input
              type="url"
              value={instagramUrl}
              onChange={(e) => setInstagramUrl(e.target.value)}
              placeholder="https://instagram.com/yourhandle"
              className="w-full px-3.5 py-2.5 rounded-xl border border-surface-border focus:outline-none focus:border-brand-500 font-mono text-xs"
            />
          </div>
        </div>
      </div>

      {/* Legal & Affiliate Disclosure Text */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-surface-border shadow-soft-sm space-y-4">
        <h2 className="text-base font-bold font-display text-copy-primary">
          Global Affiliate Disclosure Text
        </h2>
        <p className="text-xs text-copy-secondary">
          Appears across product pages, footer, and compliance sections.
        </p>

        <textarea
          rows={4}
          value={affiliateDisclosure}
          onChange={(e) => setAffiliateDisclosure(e.target.value)}
          className="w-full p-3.5 rounded-xl border border-surface-border focus:outline-none focus:border-brand-500 text-xs text-copy-primary leading-relaxed"
        />
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-2 bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white font-bold text-xs px-6 py-3 rounded-xl shadow-soft-sm transition-all"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'Saving...' : 'Save Website Settings'}</span>
        </button>
      </div>
    </form>
  );
}

