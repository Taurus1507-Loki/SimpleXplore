import { describe, it, expect, beforeAll } from 'vitest';
import { db } from '../src/lib/db';
import {
  createAdminSessionToken,
  createCustomerSessionToken,
  verifyAdminSessionToken,
  verifyCustomerSessionToken,
} from '../src/lib/admin-session';
import { sniffImageType } from '../src/lib/utils/image-type';
import { retryTelegramImport } from '../src/lib/telegram/service';

beforeAll(() => {
  process.env.ADMIN_SESSION_SECRET = 'test-secret-that-is-definitely-longer-than-32-chars';
});

describe('Customer sessions', () => {
  it('round-trips a customer token', async () => {
    const token = await createCustomerSessionToken('Shopper@Example.com');
    expect(await verifyCustomerSessionToken(token)).toEqual({ email: 'shopper@example.com' });
  });

  it('keeps admin and customer tokens separate', async () => {
    const customer = await createCustomerSessionToken('shopper@example.com');
    const admin = await createAdminSessionToken('admin@example.com');
    expect(await verifyAdminSessionToken(customer)).toBeNull();
    expect(await verifyCustomerSessionToken(admin)).toBeNull();
  });
});

describe('Wishlists', () => {
  it('saves and removes published products per user, isolated between users', async () => {
    const { products } = await db.getProducts({ status: 'published', limit: 1 });
    const productId = products[0].id;

    expect(await db.addToWishlist('demo:alice@example.com', productId)).toBe(true);
    expect(await db.getWishlistProductIds('demo:alice@example.com')).toContain(productId);
    expect(await db.getWishlistProductIds('demo:bob@example.com')).not.toContain(productId);

    await db.addToWishlist('demo:alice@example.com', productId); // no duplicates
    expect((await db.getWishlistProductIds('demo:alice@example.com')).filter(id => id === productId)).toHaveLength(1);

    await db.removeFromWishlist('demo:alice@example.com', productId);
    expect(await db.getWishlistProductIds('demo:alice@example.com')).not.toContain(productId);
  });

  it('refuses to save draft products', async () => {
    const { products } = await db.getProducts({ status: 'draft', limit: 1 });
    expect(await db.addToWishlist('demo:carol@example.com', products[0].id)).toBe(false);
  });
});

describe('Category management', () => {
  it('creates, updates, hides and deletes a category', async () => {
    const created = await db.createCategory({ name: 'Kids Fashion', slug: 'kids-fashion-test' });
    expect(created.is_active).toBe(true);
    expect((await db.getCategories()).some(c => c.id === created.id)).toBe(true);

    const hidden = await db.updateCategory(created.id, { is_active: false, name: 'Kids & Baby' });
    expect(hidden?.name).toBe('Kids & Baby');
    // Hidden categories disappear from the storefront but stay in the admin list.
    expect((await db.getCategories()).some(c => c.id === created.id)).toBe(false);
    expect((await db.getAllCategories()).some(c => c.id === created.id)).toBe(true);

    expect(await db.deleteCategory(created.id)).toBe(true);
    expect((await db.getAllCategories()).some(c => c.id === created.id)).toBe(false);
  });

  it('rejects a duplicate slug and self-parenting', async () => {
    const [first] = await db.getAllCategories();
    await expect(db.createCategory({ name: 'Dup', slug: first.slug })).rejects.toThrow(/slug/i);
    await expect(db.updateCategory(first.id, { parent_id: first.id })).rejects.toThrow(/own parent/i);
  });

  it('keeps products when their category is deleted', async () => {
    const cat = await db.createCategory({ name: 'Temp', slug: 'temp-cat-test' });
    const product = await db.createProduct({ title: 'Temp product', category_id: cat.id, status: 'draft' });
    await db.deleteCategory(cat.id);
    const after = await db.getProductById(product.id);
    expect(after).not.toBeNull();
    expect(after?.category_id).toBeNull();
  });
});

describe('Image upload validation', () => {
  it('accepts real image signatures and rejects everything else', () => {
    expect(sniffImageType(new Uint8Array([0xff, 0xd8, 0xff, 0xe0]))?.mime).toBe('image/jpeg');
    expect(sniffImageType(new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))?.mime).toBe('image/png');
    expect(sniffImageType(new TextEncoder().encode('RIFF\0\0\0\0WEBPVP8 '))?.mime).toBe('image/webp');
    expect(sniffImageType(new TextEncoder().encode('<svg onload="alert(1)">'))).toBeNull();
    expect(sniffImageType(new TextEncoder().encode('<?php echo 1; ?>'))).toBeNull();
  });
});

describe('Retrying failed Telegram imports', () => {
  it('only retries failed imports that have no product yet', async () => {
    const pending = (await db.getTelegramImports()).find(i => i.extraction_status !== 'failed');
    expect(pending).toBeDefined();
    const res = await retryTelegramImport(pending!.id);
    expect(res.ok).toBe(false);
  });

  it('refuses unsafe links and records nothing as published', async () => {
    const failed = await db.createTelegramImport({
      original_url: 'http://169.254.169.254/latest/meta-data',
      affiliate_url: 'http://169.254.169.254/latest/meta-data',
      extraction_status: 'failed',
      error_message: 'boom',
      extracted_data: { raw_message: 'test' },
    });
    const res = await retryTelegramImport(failed.id);
    expect(res.ok).toBe(false);
    const after = await db.getTelegramImportById(failed.id);
    expect(after?.review_status).toBe('pending');
    expect(after?.product_id ?? null).toBeNull();
  });

  it('links a manually created product without approving the import', async () => {
    const failed = await db.createTelegramImport({
      original_url: 'https://www.amazon.in/dp/B000TEST01',
      affiliate_url: 'https://www.amazon.in/dp/B000TEST01',
      extraction_status: 'failed',
    });
    const product = await db.createProduct({ title: 'Manual', status: 'draft', source_type: 'telegram' });
    const updated = await db.updateTelegramImport(failed.id, { product_id: product.id, error_message: 'Product created manually by admin' });
    expect(updated?.product_id).toBe(product.id);
    expect(updated?.review_status).toBe('pending');
  });
});
