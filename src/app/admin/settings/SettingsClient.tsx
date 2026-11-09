'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { WebsiteSettings } from '@/types';
import { Save, CheckCircle2, AlertCircle } from 'lucide-react';
import { applyThemeColors } from '@/lib/utils/colors';
import ImageUploadField from '@/components/admin/ImageUploadField';

const input =
  'w-full px-3.5 py-2.5 rounded-xl border border-surface-border focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10 bg-white';
const card = 'bg-white p-6 sm:p-8 rounded-3xl border border-surface-border shadow-soft-sm space-y-4';

const COLOR_PRESETS = [
  { name: 'Emerald', hex: '#168A45' },
  { name: 'Royal Blue', hex: '#2563EB' },
  { name: 'Teal', hex: '#0D9488' },
  { name: 'Crimson', hex: '#E11D48' },
  { name: 'Amber', hex: '#B45309' },
  { name: 'Slate', hex: '#334155' },
];

const SECTIONS: Array<{ key: keyof WebsiteSettings['homepage_config']; label: string; hint: string }> = [
  { key: 'show_hero', label: 'Hero banner', hint: 'Headline, search box and showcase products at the top' },
  { key: 'show_categories', label: 'Categories row', hint: '“Shop by category” tiles' },
  { key: 'show_trending', label: 'Trending products', hint: 'Products marked Trending' },
  { key: 'show_deals', label: 'Latest deals', hint: 'Products at 15% off or more' },
];

/** Every field here changes the live website when saved. */
export default function SettingsClient({ initialSettings }: { initialSettings: WebsiteSettings }) {
  const router = useRouter();
  const [siteName, setSiteName] = useState(initialSettings.site_name);
  const [tagline, setTagline] = useState(initialSettings.tagline);
  const [logoUrl, setLogoUrl] = useState(initialSettings.logo_url ?? '');
  const [primaryColor, setPrimaryColor] = useState(initialSettings.primary_color);
  const [defaultCurrency, setDefaultCurrency] = useState(initialSettings.default_currency);
  const [contactEmail, setContactEmail] = useState(initialSettings.contact_email);
  const [social, setSocial] = useState({
    telegram: initialSettings.social_links?.telegram ?? '',
    instagram: initialSettings.social_links?.instagram ?? '',
    twitter: initialSettings.social_links?.twitter ?? '',
    facebook: initialSettings.social_links?.facebook ?? '',
  });
  const [sections, setSections] = useState({
    show_hero: initialSettings.homepage_config?.show_hero !== false,
    show_categories: initialSettings.homepage_config?.show_categories !== false,
    show_trending: initialSettings.homepage_config?.show_trending !== false,
    show_deals: initialSettings.homepage_config?.show_deals !== false,
  });
  const [affiliateDisclosure, setAffiliateDisclosure] = useState(initialSettings.affiliate_disclosure);

  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<{ ok: boolean; text: string } | null>(null);

  const handleColorChange = (color: string) => {
    setPrimaryColor(color);
    if (/^#[0-9A-Fa-f]{6}$/.test(color)) applyThemeColors(color); // live preview
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setNotice(null);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          site_name: siteName,
          tagline,
          logo_url: logoUrl,
          primary_color: primaryColor,
          default_currency: defaultCurrency,
          contact_email: contactEmail,
          social_links: social,
          homepage_config: sections,
          affiliate_disclosure: affiliateDisclosure,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setNotice({ ok: false, text: data.error || 'Could not save settings.' });
        return;
      }
      setNotice({ ok: true, text: 'Saved. The website now uses these settings.' });
      router.refresh();
    } catch {
      setNotice({ ok: false, text: 'Network error while saving.' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSave} className="space-y-6 max-w-4xl text-xs sm:text-sm">
      {notice && (
        <div
          role={notice.ok ? 'status' : 'alert'}
          className={`p-4 rounded-2xl text-xs font-semibold flex items-center gap-2 border ${
            notice.ok ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-red-50 border-red-200 text-red-900'
          }`}
        >
          {notice.ok ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-red-600" />}
          <span>{notice.text}</span>
        </div>
      )}

      {/* Branding */}
      <section className={card} aria-labelledby="branding-title">
        <h2 id="branding-title" className="text-base font-bold font-display text-copy-primary">Branding</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="site-name" className="block font-semibold text-copy-primary mb-1">Brand name</label>
            <input id="site-name" required maxLength={60} value={siteName} onChange={(e) => setSiteName(e.target.value)} className={`${input} font-semibold`} />
            <p className="mt-1 text-[11px] text-copy-muted">Header, footer, page titles and Google results.</p>
          </div>
          <div>
            <label htmlFor="tagline" className="block font-semibold text-copy-primary mb-1">Tagline</label>
            <input id="tagline" maxLength={80} value={tagline} onChange={(e) => setTagline(e.target.value)} className={input} />
            <p className="mt-1 text-[11px] text-copy-muted">Shown under the logo and in page titles.</p>
          </div>
        </div>

        <ImageUploadField
          label="Logo"
          folder="branding"
          value={logoUrl}
          onChange={setLogoUrl}
          hint="Square image works best (e.g. 256×256). Leave empty to use the built-in logo."
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="brand-color" className="block font-semibold text-copy-primary mb-1">Brand colour</label>
            <div className="flex items-center gap-2">
              <input type="color" aria-label="Pick brand colour" value={primaryColor} onChange={(e) => handleColorChange(e.target.value)} className="w-10 h-10 rounded-xl border border-surface-border cursor-pointer p-0.5 bg-white" />
              <input id="brand-color" value={primaryColor} onChange={(e) => handleColorChange(e.target.value)} className={`${input} font-mono uppercase`} />
            </div>
            <div className="flex items-center gap-1.5 mt-2">
              <span className="text-[10px] text-copy-muted font-bold uppercase">Presets:</span>
              {COLOR_PRESETS.map((c) => (
                <button
                  key={c.hex}
                  type="button"
                  aria-label={`Use ${c.name}`}
                  title={c.name}
                  onClick={() => handleColorChange(c.hex)}
                  className="w-5 h-5 rounded-full border border-black/10 hover:scale-110 transition-transform"
                  style={{ backgroundColor: c.hex }}
                />
              ))}
            </div>
          </div>
          <div>
            <label htmlFor="currency" className="block font-semibold text-copy-primary mb-1">Default currency</label>
            <select id="currency" value={defaultCurrency} onChange={(e) => setDefaultCurrency(e.target.value)} className={`${input} font-semibold`}>
              <option value="INR">INR (₹) — India</option>
              <option value="USD">USD ($) — United States</option>
              <option value="GBP">GBP (£) — United Kingdom</option>
              <option value="EUR">EUR (€) — Europe</option>
            </select>
            <p className="mt-1 text-[11px] text-copy-muted">Used for new products. Each product keeps its own currency.</p>
          </div>
        </div>

        <div>
          <label htmlFor="contact-email" className="block font-semibold text-copy-primary mb-1">Public contact email</label>
          <input id="contact-email" type="email" required value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} className={input} />
          <p className="mt-1 text-[11px] text-copy-muted">Shown on the Contact page; the contact form sends messages here.</p>
        </div>
      </section>

      {/* Homepage sections */}
      <section className={card} aria-labelledby="homepage-title">
        <h2 id="homepage-title" className="text-base font-bold font-display text-copy-primary">Homepage sections</h2>
        <p className="text-xs text-copy-secondary">Choose what appears on the homepage. Featured and Recently added are always shown when there are products.</p>
        <div className="grid gap-3 sm:grid-cols-2">
          {SECTIONS.map((s) => (
            <label key={s.key} className="flex cursor-pointer items-start gap-3 rounded-2xl border border-surface-border p-4 hover:bg-surface-bg">
              <input
                type="checkbox"
                checked={sections[s.key]}
                onChange={(e) => setSections((prev) => ({ ...prev, [s.key]: e.target.checked }))}
                className="mt-0.5 h-4 w-4"
              />
              <span>
                <span className="block font-semibold text-copy-primary">{s.label}</span>
                <span className="text-[11px] text-copy-muted">{s.hint}</span>
              </span>
            </label>
          ))}
        </div>
      </section>

      {/* Social */}
      <section className={card} aria-labelledby="social-title">
        <h2 id="social-title" className="text-base font-bold font-display text-copy-primary">Social links</h2>
        <p className="text-xs text-copy-secondary">Shown as icons in the footer. Leave a field empty to hide that icon.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {(['telegram', 'instagram', 'twitter', 'facebook'] as const).map((key) => (
            <div key={key}>
              <label htmlFor={`social-${key}`} className="block font-semibold text-copy-primary mb-1">
                {key === 'twitter' ? 'X (Twitter)' : key[0].toUpperCase() + key.slice(1)}
              </label>
              <input
                id={`social-${key}`}
                type="url"
                placeholder="https://"
                value={social[key]}
                onChange={(e) => setSocial((prev) => ({ ...prev, [key]: e.target.value }))}
                className={`${input} font-mono text-xs`}
              />
            </div>
          ))}
        </div>
      </section>

      {/* Disclosure */}
      <section className={card} aria-labelledby="disclosure-title">
        <h2 id="disclosure-title" className="text-base font-bold font-display text-copy-primary">Affiliate disclosure</h2>
        <p className="text-xs text-copy-secondary">Shown in the footer of every page and at the top of the Affiliate Disclosure page.</p>
        <label htmlFor="disclosure" className="sr-only">Affiliate disclosure text</label>
        <textarea id="disclosure" rows={4} required maxLength={2000} value={affiliateDisclosure} onChange={(e) => setAffiliateDisclosure(e.target.value)} className={`${input} leading-relaxed`} />
      </section>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white font-bold text-xs px-6 py-3 rounded-xl shadow-soft-sm transition-all"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'Saving…' : 'Save settings'}</span>
        </button>
      </div>
    </form>
  );
}
