import type { WebsiteSettings } from '@/types';

/**
 * Validate and normalise an admin "save settings" request. Unknown keys are dropped;
 * returns either the clean partial update or a list of problems to show the admin.
 */
export function validateSettingsInput(raw: unknown): { update?: Partial<WebsiteSettings>; errors: string[] } {
  const errors: string[] = [];
  const input = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
  const update: Partial<WebsiteSettings> = {};

  const str = (key: string, label: string, max: number, required = false): string | undefined => {
    if (input[key] === undefined) return undefined;
    const v = typeof input[key] === 'string' ? (input[key] as string).trim() : '';
    if (required && !v) errors.push(`${label} can’t be empty.`);
    if (v.length > max) errors.push(`${label} must be ${max} characters or fewer.`);
    return v;
  };

  const siteName = str('site_name', 'Brand name', 60, true);
  if (siteName !== undefined) update.site_name = siteName;
  const tagline = str('tagline', 'Tagline', 80);
  if (tagline !== undefined) update.tagline = tagline;

  if (input.logo_url !== undefined) {
    const logo = typeof input.logo_url === 'string' ? input.logo_url.trim() : '';
    if (logo && !/^(https:\/\/|\/uploads\/)/.test(logo)) errors.push('Logo must be an uploaded image or an https:// link.');
    update.logo_url = logo || null;
  }

  if (input.primary_color !== undefined) {
    const c = String(input.primary_color).trim();
    if (!/^#[0-9a-fA-F]{6}$/.test(c)) errors.push('Brand colour must be a hex value like #168A45.');
    else update.primary_color = c.toUpperCase();
  }

  if (input.default_currency !== undefined) {
    const cur = String(input.default_currency).trim().toUpperCase();
    if (!/^[A-Z]{3}$/.test(cur)) errors.push('Currency must be a 3-letter code like INR.');
    else update.default_currency = cur;
  }

  const email = str('contact_email', 'Contact email', 120, true);
  if (email !== undefined) {
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.push('Contact email doesn’t look valid.');
    update.contact_email = email;
  }

  const disclosure = str('affiliate_disclosure', 'Affiliate disclosure', 2000, true);
  if (disclosure !== undefined) update.affiliate_disclosure = disclosure;

  if (input.social_links !== undefined) {
    const links = (input.social_links && typeof input.social_links === 'object' ? input.social_links : {}) as Record<string, unknown>;
    const clean: WebsiteSettings['social_links'] = {};
    for (const key of ['telegram', 'instagram', 'twitter', 'facebook'] as const) {
      const v = typeof links[key] === 'string' ? (links[key] as string).trim() : '';
      if (!v) continue;
      if (!/^https:\/\/[^\s]+$/.test(v)) errors.push(`${key[0].toUpperCase() + key.slice(1)} link must start with https://`);
      else clean[key] = v;
    }
    update.social_links = clean;
  }

  if (input.homepage_config !== undefined) {
    const h = (input.homepage_config && typeof input.homepage_config === 'object' ? input.homepage_config : {}) as Record<string, unknown>;
    update.homepage_config = {
      show_hero: h.show_hero !== false,
      show_categories: h.show_categories !== false,
      show_trending: h.show_trending !== false,
      show_deals: h.show_deals !== false,
    };
  }

  return errors.length ? { errors } : { update, errors };
}
