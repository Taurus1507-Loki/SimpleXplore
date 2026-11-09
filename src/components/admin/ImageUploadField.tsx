'use client';

import React, { useId, useRef, useState } from 'react';
import Image from '@/components/SafeImage';
import { ImagePlus, Loader2, Link2, X } from 'lucide-react';

interface ImageUploadFieldProps {
  label: string;
  value: string;
  onChange: (url: string) => void;
  folder?: 'products' | 'categories' | 'branding';
  required?: boolean;
  hint?: string;
}

/**
 * Upload an image from the computer, or paste an image link.
 * Uploads go to /api/admin/upload (admin-only, type-checked, max 5 MB).
 */
export default function ImageUploadField({ label, value, onChange, folder = 'products', required, hint }: ImageUploadFieldProps) {
  const inputId = useId();
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  async function upload(file: File) {
    setError(null);
    if (file.size > 5 * 1024 * 1024) {
      setError('Image is too large. The maximum is 5 MB.');
      return;
    }
    setUploading(true);
    try {
      const form = new FormData();
      form.append('file', file);
      form.append('folder', folder);
      const res = await fetch('/api/admin/upload', { method: 'POST', body: form });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.url) throw new Error(data.error || 'Upload failed.');
      onChange(data.url);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Upload failed.');
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  }

  return (
    <div className="space-y-2">
      <label htmlFor={inputId} className="block text-xs font-semibold text-copy-primary">
        {label}
        {required && <span className="text-red-600"> *</span>}
      </label>

      <div className="flex gap-3">
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            const f = e.dataTransfer.files?.[0];
            if (f) upload(f);
          }}
          className={`relative flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-xl border-2 border-dashed bg-surface-muted transition-colors ${
            dragOver ? 'border-brand-500 bg-brand-50' : 'border-surface-border'
          }`}
        >
          {uploading ? (
            <Loader2 className="h-5 w-5 animate-spin text-brand-600" aria-label="Uploading" />
          ) : value ? (
            <>
              <Image src={value} alt="" fill sizes="96px" className="object-contain p-1" unoptimized={value.startsWith('/uploads/')} />
              <button
                type="button"
                onClick={() => onChange('')}
                aria-label="Remove image"
                className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-white/95 text-copy-secondary shadow-soft-sm hover:text-red-600"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </>
          ) : (
            <ImagePlus className="h-6 w-6 text-copy-muted" aria-hidden="true" />
          )}
        </div>

        <div className="min-w-0 flex-1 space-y-2">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="inline-flex min-h-[40px] items-center gap-2 rounded-xl border border-surface-border bg-white px-3 text-xs font-semibold text-copy-primary hover:border-brand-300 hover:bg-brand-50 disabled:opacity-60"
          >
            <ImagePlus className="h-4 w-4" aria-hidden="true" />
            {uploading ? 'Uploading…' : value ? 'Replace image' : 'Upload from computer'}
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
            className="sr-only"
            tabIndex={-1}
            aria-hidden="true"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) upload(f);
            }}
          />
          <div className="relative">
            <Link2 className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-copy-muted" aria-hidden="true" />
            <input
              id={inputId}
              type="url"
              value={value}
              required={required}
              onChange={(e) => onChange(e.target.value)}
              placeholder="…or paste an image link (https://)"
              className="w-full rounded-xl border border-surface-border py-2 pl-8 pr-3 text-xs text-copy-primary focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/10"
            />
          </div>
        </div>
      </div>

      {error ? (
        <p role="alert" className="text-xs text-red-700">
          {error}
        </p>
      ) : (
        <p className="text-[11px] text-copy-muted">{hint ?? 'JPG, PNG, WebP, GIF or AVIF · max 5 MB · drag and drop works too'}</p>
      )}
    </div>
  );
}
