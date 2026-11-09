export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024; // 5 MB
/** Detect the real image type from its first bytes — the file name and browser-sent type are not trusted. */
export function sniffImageType(bytes: Uint8Array): { ext: string; mime: string } | null {
  const b = bytes;
  if (b.length >= 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return { ext: 'jpg', mime: 'image/jpeg' };
  if (b.length >= 8 && b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47) return { ext: 'png', mime: 'image/png' };
  if (b.length >= 6 && b[0] === 0x47 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x38) return { ext: 'gif', mime: 'image/gif' };
  const ascii = (from: number, to: number) => String.fromCharCode(...Array.from(b.slice(from, to)));
  if (b.length >= 12 && ascii(0, 4) === 'RIFF' && ascii(8, 12) === 'WEBP') return { ext: 'webp', mime: 'image/webp' };
  if (b.length >= 12 && ascii(4, 8) === 'ftyp' && /^(avif|avis)$/.test(ascii(8, 12))) return { ext: 'avif', mime: 'image/avif' };
  return null; // SVG and everything else rejected (SVG can carry scripts)
}

