import type { Category } from '@/types';

/**
 * Guesses a category slug from a product title.
 * For clothing/fashion items:
 *  - Women's keywords → 'womens-fashion'
 *  - Men's keywords   → 'mens-fashion'
 *  - Generic/ambiguous fashion keywords → 'fashion'
 */
export function guessCategorySlugFromTitle(title?: string | null): string | undefined {
  if (!title) return undefined;
  const t = title.toLowerCase();

  // 1. Footwear (check before generic gender words when clearly shoes/sandals, or keep fashion if needed)
  if (/\b(shoes?|sneakers?|sandals?|heels?|flats?|slippers?|flip[- ]?flops?|clogs?|boots?|loafers?|mojari|jutti|chappal)\b/i.test(t)) {
    return 'footwear';
  }

  // 2. Home Decor
  if (
    /\b(home\s*decor|wall\s*decor|wall\s*art|wall\s*hanging|showpiece|idol|figurine|vase|candle|tea\s*light|fairy\s*lights?|string\s*lights?|table\s*lamp|floor\s*lamp|curtains?|cushion|pillow\s*cover|bedsheet|bed\s*sheet|rug|carpet|doormat|wall\s*clock|planter|flower\s*pot|photo\s*frame|tapestry|macrame|mirror|wind\s*chime)\b/i.test(
      t
    )
  ) {
    return 'home-decor';
  }

  // 3. Fashion: Women's vs Men's vs Fashion fallback
  const hasWomen =
    /\b(women'?s?|woman'?s?|girls?|ladies|lady|female|kurti|kurtis|saree|sari|lehenga|anarkali|salwar|churidar|dupatta|blouse|palazzo|leggings|jeggings|gown|lingerie|bra|maternity|jhumka|bangles|handbag|tote\s*bag|clutch)\b/i.test(
      t
    );
  const hasMen =
    /\b(men'?s?|man'?s?|boys?|male|menswear|sherwani|boxers?|briefs|chinos|necktie|bowtie)\b/i.test(t);

  if (hasWomen && !hasMen) return 'womens-fashion';
  if (hasMen && !hasWomen) return 'mens-fashion';

  const hasFashionItem =
    /\b(fashion|clothing|apparel|wear|shirt|t-?shirt|tee|top|tops|kurta|jeans|trousers|pants?|jacket|hoodie|sweatshirt|sweater|cardigan|dress|shorts|joggers|track\s*pant|blazer|coat|denim|ethnic|suit|sunglasses|watch|belt|wallet|cap|scarf|stole|backpack)\b/i.test(
      t
    );

  if (hasWomen && hasMen) return 'fashion';
  if (hasFashionItem) return 'fashion';

  // 4. Beauty & Personal Care
  if (/\b(skincare|serum|moisturizer|sunscreen|face\s*wash|cleanser|shampoo|conditioner|lipstick|eyeliner|mascara|foundation|perfume|deodorant|body\s*wash|trimmer|hair\s*dryer|straightener)\b/i.test(t)) {
    return 'beauty-personal-care';
  }

  // 5. Electronics
  if (/\b(earbuds?|headphones?|earphones?|bluetooth|speaker|smartwatch|smart\s*watch|laptop|tablet|charger|power\s*bank|cable|adapter|keyboard|mouse|monitor|webcam|ssd|pendrive|usb|tv|soundbar)\b/i.test(t)) {
    return 'electronics';
  }

  // 6. Home & Kitchen
  if (/\b(kitchen|cookware|pan|kadhai|pressure\s*cooker|air\s*fryer|blender|mixer|grinder|kettle|coffee\s*maker|toaster|storage\s*box|organizer|container|flask|thermos|bottle)\b/i.test(t)) {
    return 'home-kitchen';
  }

  return undefined;
}

/** Finds the matching Category row by slug or name (case-insensitive). */
export function matchCategory(categories: Category[], slugOrName?: string | null): Category | undefined {
  if (!slugOrName) return undefined;
  const target = slugOrName.trim().toLowerCase();
  return categories.find(
    (c) => c.slug.toLowerCase() === target || c.name.toLowerCase() === target
  );
}
