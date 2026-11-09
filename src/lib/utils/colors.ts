/**
 * Color utility to generate a full 50-900 Tailwind palette from any base hex color.
 */

interface HSL {
  h: number;
  s: number;
  l: number;
}

export function hexToHSL(hex: string): HSL {
  let clean = hex.replace('#', '');
  if (clean.length === 3) {
    clean = clean.split('').map(c => c + c).join('');
  }
  const num = parseInt(clean, 16);
  if (isNaN(num)) {
    return { h: 144, s: 72, l: 31 }; // fallback #168A45
  }

  const r = ((num >> 16) & 255) / 255;
  const g = ((num >> 8) & 255) / 255;
  const b = (num & 255) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h = Math.round(h * 60);
  }

  return { h, s: Math.round(s * 100), l: Math.round(l * 100) };
}

export function hslToHex({ h, s, l }: HSL): string {
  const sNorm = s / 100;
  const lNorm = l / 100;

  const c = (1 - Math.abs(2 * lNorm - 1)) * sNorm;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = lNorm - c / 2;

  let r = 0, g = 0, b = 0;
  if (h >= 0 && h < 60) {
    r = c; g = x; b = 0;
  } else if (h >= 60 && h < 120) {
    r = x; g = c; b = 0;
  } else if (h >= 120 && h < 180) {
    r = 0; g = c; b = x;
  } else if (h >= 180 && h < 240) {
    r = 0; g = x; b = c;
  } else if (h >= 240 && h < 300) {
    r = x; g = 0; b = c;
  } else if (h >= 300 && h < 360) {
    r = c; g = 0; b = x;
  }

  const toHex = (n: number) => {
    const hex = Math.round((n + m) * 255).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

export function generatePalette(baseHex: string): Record<string, string> {
  const hsl = hexToHSL(baseHex);

  return {
    '50': hslToHex({ h: hsl.h, s: Math.min(hsl.s, 60), l: 96 }),
    '100': hslToHex({ h: hsl.h, s: Math.min(hsl.s, 65), l: 91 }),
    '200': hslToHex({ h: hsl.h, s: Math.min(hsl.s, 70), l: 81 }),
    '300': hslToHex({ h: hsl.h, s: Math.min(hsl.s, 75), l: 67 }),
    '400': hslToHex({ h: hsl.h, s: Math.min(hsl.s, 80), l: 50 }),
    '500': baseHex, // Exact primary chosen by admin
    '600': hslToHex({ h: hsl.h, s: Math.min(hsl.s + 5, 100), l: Math.max(hsl.l - 7, 24) }),
    '700': hslToHex({ h: hsl.h, s: Math.min(hsl.s + 10, 100), l: Math.max(hsl.l - 12, 19) }),
    '800': hslToHex({ h: hsl.h, s: Math.min(hsl.s + 15, 100), l: Math.max(hsl.l - 16, 15) }),
    '900': hslToHex({ h: hsl.h, s: Math.min(hsl.s + 20, 100), l: Math.max(hsl.l - 20, 12) }),
  };
}

export function applyThemeColors(baseHex: string) {
  if (typeof document === 'undefined') return;
  const palette = generatePalette(baseHex);
  const root = document.documentElement;

  Object.entries(palette).forEach(([shade, hex]) => {
    root.style.setProperty(`--brand-${shade}`, hex);
  });
}

