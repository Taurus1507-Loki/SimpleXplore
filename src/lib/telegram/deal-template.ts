/**
 * Parser for the channel's fixed deal-post template, e.g.
 *
 *   🔥 LOOT DEAL ALERT! 🔥
 *   🛍️ Amazon Brand - Tavasya Women Floral Printed Short Kurti
 *   💰 Price: ₹419
 *   🎯 Best Price: ₹419
 *   🛒 Grab it now: https://link.amazon/B08jYVqod
 *   ⚡ Hurry, deals can end anytime!
 *
 * "Best Price" means the lowest price the product has ever been seen at
 * (it is NOT the MRP, so it never feeds the strikethrough/discount).
 * Pure function, no I/O.
 */

export interface DealTemplate {
  title: string;
  price: number;
  /** Lowest price ever seen. */
  best_price?: number;
  url?: string;
}

const URL_IN_LINE = /(https?:\/\/[^\s<>"{}|\\^`[\]]+)/i;

/** Removes emoji / pictographs / variation selectors so labels can be matched as plain text. */
function stripEmoji(s: string): string {
  return s
    .replace(/[\p{Extended_Pictographic}\p{Emoji_Presentation}\u{FE0F}\u{200D}\u{20E3}]/gu, '')
    .trim();
}

/** "₹1,299", "Rs. 1299", "INR 1,299.50", "1299" → number; undefined when no number. */
function parseAmount(s: string): number | undefined {
  const m = s.match(/(?:₹|rs\.?|inr)?\s*(\d[\d,]*(?:\.\d+)?)/i);
  if (!m) return undefined;
  const n = parseFloat(m[1].replace(/,/g, ''));
  return Number.isFinite(n) && n > 0 ? n : undefined;
}

/**
 * Returns the parsed deal when the message follows the template
 * (a product-name line and a "Price:" line are required), otherwise null
 * so the caller can fall back to the generic extractor.
 */
export function parseDealTemplate(text?: string | null): DealTemplate | null {
  if (!text) return null;

  let title: string | undefined;
  let price: number | undefined;
  let bestPrice: number | undefined;
  let url: string | undefined;

  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line) continue;

    // Product name: the line that starts with the shopping-bags emoji.
    if (!title && /^🛍/u.test(line)) {
      const name = stripEmoji(line).replace(/\s+/g, ' ').trim();
      if (name) title = name;
      continue;
    }

    const plain = stripEmoji(line);

    // "Best Price: ₹419" (also "Lowest Price:"). Checked before plain "Price:".
    const best = plain.match(/^(?:best|lowest)\s*price\s*[:\-–]\s*(.+)$/i);
    if (best) {
      bestPrice ??= parseAmount(best[1]);
      continue;
    }

    // "Price: ₹419" (also "Deal Price:" / "Offer Price:").
    const cur = plain.match(/^(?:deal\s*|offer\s*|sale\s*)?price\s*[:\-–]\s*(.+)$/i);
    if (cur) {
      price ??= parseAmount(cur[1]);
      continue;
    }

    // "Grab it now: https://..." — preferred link line.
    if (/grab\s*it\s*now/i.test(plain)) {
      const u = line.match(URL_IN_LINE);
      if (u) url = u[1];
    }
  }

  // Any link in the message when the "Grab it now" line is missing.
  if (!url) url = text.match(URL_IN_LINE)?.[1];

  if (!title || !price) return null;
  return { title, price, ...(bestPrice ? { best_price: bestPrice } : {}), ...(url ? { url } : {}) };
}
