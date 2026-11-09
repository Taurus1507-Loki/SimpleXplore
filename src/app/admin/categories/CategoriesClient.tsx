'use client';

import React, { useMemo, useState } from 'react';
import Image from '@/components/SafeImage';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { Plus, Pencil, Trash2, Eye, EyeOff, X, Save, ExternalLink, AlertCircle } from 'lucide-react';
import type { Category } from '@/types';
import { slugify } from '@/lib/utils/slugify';
import ImageUploadField from '@/components/admin/ImageUploadField';

interface Props {
  initialCategories: Category[];
  productCounts: Record<string, number>;
}

interface FormState {
  id?: string;
  name: string;
  slug: string;
  slugTouched: boolean;
  description: string;
  image: string;
  parent_id: string;
  sort_order: number;
  is_active: boolean;
}

const emptyForm = (sortOrder: number): FormState => ({
  name: '',
  slug: '',
  slugTouched: false,
  description: '',
  image: '',
  parent_id: '',
  sort_order: sortOrder,
  is_active: true,
});

async function api(method: string, body?: unknown, query = '') {
  const res = await fetch(`/api/admin/categories${query}`, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Request failed.');
  return data;
}

export default function CategoriesClient({ initialCategories, productCounts }: Props) {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [form, setForm] = useState<FormState | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Category | null>(null);

  const nameById = useMemo(() => Object.fromEntries(categories.map((c) => [c.id, c.name])), [categories]);
  const nextSort = categories.reduce((m, c) => Math.max(m, c.sort_order ?? 0), 0) + 1;

  function flash(message: string) {
    setNotice(message);
    setTimeout(() => setNotice(null), 3000);
  }

  function openEdit(c: Category) {
    setError(null);
    setForm({
      id: c.id,
      name: c.name,
      slug: c.slug,
      slugTouched: true,
      description: c.description ?? '',
      image: c.image ?? '',
      parent_id: c.parent_id ?? '',
      sort_order: c.sort_order ?? 0,
      is_active: c.is_active,
    });
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!form) return;
    setSaving(true);
    setError(null);
    const payload = {
      id: form.id,
      name: form.name,
      slug: form.slug || slugify(form.name),
      description: form.description,
      image: form.image,
      parent_id: form.parent_id || null,
      sort_order: form.sort_order,
      is_active: form.is_active,
    };
    try {
      const { category } = await api(form.id ? 'PATCH' : 'POST', payload);
      setCategories((prev) =>
        (form.id ? prev.map((c) => (c.id === category.id ? category : c)) : [...prev, category]).sort(
          (a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0)
        )
      );
      flash(form.id ? `Saved “${category.name}”.` : `Added “${category.name}”.`);
      setForm(null);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save.');
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(c: Category) {
    try {
      const { category } = await api('PATCH', { id: c.id, is_active: !c.is_active });
      setCategories((prev) => prev.map((x) => (x.id === c.id ? category : x)));
      flash(category.is_active ? `“${c.name}” is visible on the site.` : `“${c.name}” is hidden from the site.`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not update.');
    }
  }

  async function remove(c: Category) {
    try {
      await api('DELETE', undefined, `?id=${encodeURIComponent(c.id)}`);
      setCategories((prev) => prev.filter((x) => x.id !== c.id).map((x) => (x.parent_id === c.id ? { ...x, parent_id: null } : x)));
      flash(`Deleted “${c.name}”.`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not delete.');
    } finally {
      setConfirmDelete(null);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-copy-secondary">
          {categories.length} categories · {categories.filter((c) => !c.is_active).length} hidden
        </p>
        <button
          type="button"
          onClick={() => {
            setError(null);
            setForm(emptyForm(nextSort));
          }}
          className="inline-flex min-h-[40px] items-center gap-2 rounded-xl bg-brand-600 px-4 text-xs font-semibold text-white shadow-soft-sm hover:bg-brand-700"
        >
          <Plus className="h-4 w-4" aria-hidden="true" /> Add category
        </button>
      </div>

      <AnimatePresence>
        {notice && (
          <motion.p
            role="status"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="rounded-xl border border-brand-200 bg-brand-50 px-4 py-2.5 text-xs font-medium text-brand-800"
          >
            {notice}
          </motion.p>
        )}
      </AnimatePresence>

      {error && !form && (
        <p role="alert" className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-xs text-red-800">
          <AlertCircle className="h-4 w-4" aria-hidden="true" /> {error}
        </p>
      )}

      {/* Add / edit panel */}
      <AnimatePresence initial={false}>
        {form && (
          <motion.form
            key={form.id ?? 'new'}
            onSubmit={save}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden rounded-3xl border border-surface-border bg-white shadow-soft-sm"
          >
            <div className="space-y-5 p-5 sm:p-6">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-lg font-bold text-ink">{form.id ? 'Edit category' : 'New category'}</h2>
                <button
                  type="button"
                  onClick={() => setForm(null)}
                  aria-label="Close"
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-copy-muted hover:bg-surface-muted"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {error && (
                <p role="alert" className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-800">
                  <AlertCircle className="h-4 w-4" aria-hidden="true" /> {error}
                </p>
              )}

              <div className="grid gap-5 lg:grid-cols-2">
                <div className="space-y-4 text-xs">
                  <div>
                    <label htmlFor="cat-name" className="mb-1 block font-semibold text-copy-primary">
                      Name <span className="text-red-600">*</span>
                    </label>
                    <input
                      id="cat-name"
                      required
                      maxLength={80}
                      value={form.name}
                      onChange={(e) =>
                        setForm((f) => f && { ...f, name: e.target.value, slug: f.slugTouched ? f.slug : slugify(e.target.value) })
                      }
                      placeholder="e.g. Kids' Fashion"
                      className="w-full rounded-xl border border-surface-border px-3 py-2.5 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/10"
                    />
                  </div>
                  <div>
                    <label htmlFor="cat-slug" className="mb-1 block font-semibold text-copy-primary">
                      URL slug
                    </label>
                    <div className="flex items-center rounded-xl border border-surface-border focus-within:border-brand-500">
                      <span className="pl-3 text-copy-muted">/categories/</span>
                      <input
                        id="cat-slug"
                        value={form.slug}
                        onChange={(e) => setForm((f) => f && { ...f, slug: slugify(e.target.value), slugTouched: true })}
                        className="min-w-0 flex-1 rounded-r-xl px-1 py-2.5 font-mono focus:outline-none"
                      />
                    </div>
                    {form.id && <p className="mt-1 text-[11px] text-copy-muted">Changing the slug changes the page address; old links will stop working.</p>}
                  </div>
                  <div>
                    <label htmlFor="cat-desc" className="mb-1 block font-semibold text-copy-primary">
                      Description <span className="font-normal text-copy-muted">(shown on the category page and in Google)</span>
                    </label>
                    <textarea
                      id="cat-desc"
                      rows={3}
                      maxLength={300}
                      value={form.description}
                      onChange={(e) => setForm((f) => f && { ...f, description: e.target.value })}
                      className="w-full rounded-xl border border-surface-border px-3 py-2.5 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/10"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="cat-parent" className="mb-1 block font-semibold text-copy-primary">
                        Parent category
                      </label>
                      <select
                        id="cat-parent"
                        value={form.parent_id}
                        onChange={(e) => setForm((f) => f && { ...f, parent_id: e.target.value })}
                        className="w-full rounded-xl border border-surface-border bg-white px-3 py-2.5 focus:border-brand-500 focus:outline-none"
                      >
                        <option value="">None (top level)</option>
                        {categories
                          .filter((c) => c.id !== form.id)
                          .map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.name}
                            </option>
                          ))}
                      </select>
                    </div>
                    <div>
                      <label htmlFor="cat-order" className="mb-1 block font-semibold text-copy-primary">
                        Display order
                      </label>
                      <input
                        id="cat-order"
                        type="number"
                        value={form.sort_order}
                        onChange={(e) => setForm((f) => f && { ...f, sort_order: Number(e.target.value) })}
                        className="w-full rounded-xl border border-surface-border px-3 py-2.5 focus:border-brand-500 focus:outline-none"
                      />
                    </div>
                  </div>
                  <label className="flex cursor-pointer items-center gap-2.5 text-copy-primary">
                    <input
                      type="checkbox"
                      checked={form.is_active}
                      onChange={(e) => setForm((f) => f && { ...f, is_active: e.target.checked })}
                      className="h-4 w-4 accent-[var(--brand-600,#106B36)]"
                    />
                    <span className="font-semibold">Visible on the website</span>
                  </label>
                </div>

                <ImageUploadField
                  label="Category image"
                  folder="categories"
                  value={form.image}
                  onChange={(url) => setForm((f) => f && { ...f, image: url })}
                  hint="Square photos look best · JPG, PNG, WebP · max 5 MB"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 border-t border-surface-border bg-surface-bg px-5 py-3 sm:px-6">
              <button
                type="button"
                onClick={() => setForm(null)}
                className="min-h-[40px] rounded-xl px-4 text-xs font-semibold text-copy-secondary hover:bg-surface-muted"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="inline-flex min-h-[40px] items-center gap-2 rounded-xl bg-brand-600 px-5 text-xs font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
              >
                <Save className="h-4 w-4" aria-hidden="true" />
                {saving ? 'Saving…' : form.id ? 'Save changes' : 'Add category'}
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* List */}
      <div className="overflow-x-auto rounded-3xl border border-surface-border bg-white shadow-soft-sm">
        <table className="w-full min-w-[720px] text-left text-xs">
          <thead className="border-b border-surface-border bg-surface-bg font-semibold uppercase tracking-wider text-copy-secondary">
            <tr>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Slug</th>
              <th className="px-4 py-3">Parent</th>
              <th className="px-4 py-3 text-right">Products</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-border/60">
            {categories.map((c) => (
              <tr key={c.id} className={c.is_active ? '' : 'bg-surface-bg/60 text-copy-muted'}>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-xl border border-surface-border bg-surface-muted">
                      {c.image && (
                        <Image src={c.image} alt="" fill sizes="40px" className="object-cover" unoptimized={c.image.startsWith('/uploads/')} />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-copy-primary">{c.name}</p>
                      {c.description && <p className="max-w-xs truncate text-copy-muted">{c.description}</p>}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 font-mono text-copy-muted">{c.slug}</td>
                <td className="px-4 py-3 text-copy-secondary">{c.parent_id ? nameById[c.parent_id] ?? '—' : '—'}</td>
                <td className="tabular px-4 py-3 text-right font-semibold">{productCounts[c.id] ?? 0}</td>
                <td className="px-4 py-3">
                  {c.is_active ? (
                    <span className="rounded-full border border-brand-200 bg-brand-50 px-2 py-0.5 text-[10px] font-semibold text-brand-700">Visible</span>
                  ) : (
                    <span className="rounded-full border border-surface-border bg-surface-muted px-2 py-0.5 text-[10px] font-semibold text-copy-secondary">Hidden</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-1">
                    {c.is_active && (
                      <a
                        href={`/categories/${c.slug}`}
                        target="_blank"
                        rel="noopener"
                        aria-label={`View ${c.name} on the site`}
                        className="flex h-9 w-9 items-center justify-center rounded-lg text-copy-muted hover:bg-surface-muted hover:text-copy-primary"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    )}
                    <button
                      type="button"
                      onClick={() => toggleActive(c)}
                      aria-label={c.is_active ? `Hide ${c.name}` : `Show ${c.name}`}
                      title={c.is_active ? 'Hide from website' : 'Show on website'}
                      className="flex h-9 w-9 items-center justify-center rounded-lg text-copy-muted hover:bg-surface-muted hover:text-copy-primary"
                    >
                      {c.is_active ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => openEdit(c)}
                      aria-label={`Edit ${c.name}`}
                      className="flex h-9 w-9 items-center justify-center rounded-lg text-copy-muted hover:bg-surface-muted hover:text-copy-primary"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmDelete(c)}
                      aria-label={`Delete ${c.name}`}
                      className="flex h-9 w-9 items-center justify-center rounded-lg text-copy-muted hover:bg-red-50 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Delete confirmation */}
      <AnimatePresence>
        {confirmDelete && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setConfirmDelete(null)}
          >
            <motion.div
              role="alertdialog"
              aria-modal="true"
              aria-labelledby="del-title"
              initial={{ scale: 0.96, y: 8 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.96, y: 8 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm space-y-4 rounded-3xl bg-white p-6 shadow-soft-lg"
            >
              <h2 id="del-title" className="font-display text-lg font-bold text-ink">
                Delete “{confirmDelete.name}”?
              </h2>
              <p className="text-sm text-copy-secondary">
                {productCounts[confirmDelete.id]
                  ? `Its ${productCounts[confirmDelete.id]} product(s) will stay on the site but become uncategorised.`
                  : 'No products use this category.'}{' '}
                This can’t be undone. To take it off the site temporarily, hide it instead.
              </p>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  autoFocus
                  onClick={() => setConfirmDelete(null)}
                  className="min-h-[40px] rounded-xl px-4 text-sm font-semibold text-copy-secondary hover:bg-surface-muted"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => remove(confirmDelete)}
                  className="min-h-[40px] rounded-xl bg-red-600 px-4 text-sm font-semibold text-white hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
