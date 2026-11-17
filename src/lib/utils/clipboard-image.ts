/**
 * Shared helpers for extracting pasted screenshots from the clipboard
 * and uploading image files to /api/admin/upload.
 */

export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

function extFromMime(mime: string): string {
  const sub = mime.split('/')[1]?.toLowerCase() ?? 'png';
  if (sub === 'jpeg') return 'jpg';
  return sub.replace(/[^a-z0-9]/g, '') || 'png';
}

/** Extracts any image files from a React/DOM clipboard paste event. */
export function extractImageFilesFromClipboard(clipboardData: DataTransfer | null | undefined): File[] {
  if (!clipboardData) return [];
  const files: File[] = [];

  for (const item of Array.from(clipboardData.items ?? [])) {
    if (item.kind === 'file' && item.type.startsWith('image/')) {
      const f = item.getAsFile();
      if (f) files.push(f);
    }
  }

  if (files.length === 0) {
    for (const f of Array.from(clipboardData.files ?? [])) {
      if (f.type.startsWith('image/')) files.push(f);
    }
  }

  return files;
}

/**
 * Reads image blobs from the async Clipboard API (`navigator.clipboard.read()`).
 * Returns an empty array if the clipboard has no image, or throws if blocked/unsupported.
 */
export async function readImagesFromNavigatorClipboard(): Promise<File[]> {
  if (typeof navigator === 'undefined' || !navigator.clipboard?.read) {
    throw new Error('Clipboard read is not supported in this browser. Press Ctrl+V (or Cmd+V) instead.');
  }

  const items = await navigator.clipboard.read();
  const files: File[] = [];
  for (const item of items) {
    const imageType = item.types.find((t) => t.startsWith('image/'));
    if (!imageType) continue;
    const blob = await item.getType(imageType);
    const ext = extFromMime(imageType);
    files.push(new File([blob], `screenshot-${Date.now()}.${ext}`, { type: imageType }));
  }
  return files;
}

/** Uploads one image file via /api/admin/upload and returns its public URL. */
export async function uploadAdminImage(
  file: File,
  folder: 'products' | 'categories' | 'branding' = 'products'
): Promise<string> {
  if (file.size > MAX_IMAGE_BYTES) {
    throw new Error(`${file.name || 'Image'} is larger than 5 MB.`);
  }
  const form = new FormData();
  form.append('file', file);
  form.append('folder', folder);

  const res = await fetch('/api/admin/upload', { method: 'POST', body: form });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.url) {
    throw new Error(data.error || 'Upload failed.');
  }
  return data.url as string;
}

/** True when a URL is an http(s) URL safe to open in a new tab from the admin UI. */
export function isOpenableHttpUrl(url: string): boolean {
  return /^https?:\/\/.+/i.test(url.trim());
}
