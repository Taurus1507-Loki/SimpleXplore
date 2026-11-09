'use client';

import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { Product } from '@/types';

interface WishlistContextType {
  wishlistIds: string[];
  wishlistProducts: Product[];
  toggleWishlist: (product: Product) => void;
  isInWishlist: (productId: string) => boolean;
  wishlistCount: number;
  /** True when the list is saved to the signed-in account (vs. this browser only). */
  syncedToAccount: boolean;
  loading: boolean;
}

const WishlistContext = createContext<WishlistContextType>({
  wishlistIds: [],
  wishlistProducts: [],
  toggleWishlist: () => {},
  isInWishlist: () => false,
  wishlistCount: 0,
  syncedToAccount: false,
  loading: false,
});

const LOCAL_KEY = 'sx_wishlist';

function readLocal(): Product[] {
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeLocal(products: Product[]) {
  try {
    if (products.length) localStorage.setItem(LOCAL_KEY, JSON.stringify(products));
    else localStorage.removeItem(LOCAL_KEY);
  } catch {
    // storage unavailable (private mode etc.)
  }
}

/**
 * Guests: wishlist lives in this browser.
 * Signed-in customers: wishlist lives in their account (server). On sign-in,
 * anything saved as a guest is merged into the account once.
 *
 * `accountKey` changes when the user signs in or out, which triggers a reload.
 */
export function WishlistProvider({ children, accountKey }: { children: React.ReactNode; accountKey: string | null }) {
  const [wishlistProducts, setWishlistProducts] = useState<Product[]>([]);
  const [syncedToAccount, setSynced] = useState(false);
  const [loading, setLoading] = useState(true);
  const syncedRef = useRef(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const local = readLocal();
      if (!accountKey) {
        syncedRef.current = false;
        if (!cancelled) {
          setSynced(false);
          setWishlistProducts(local);
          setLoading(false);
        }
        return;
      }
      try {
        const res = await fetch('/api/wishlist', { cache: 'no-store' });
        if (res.status === 401) throw new Error('guest');
        let data = await res.json();
        if (local.length > 0) {
          const merge = await fetch('/api/wishlist', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ productIds: local.map((p) => p.id) }),
          });
          if (merge.ok) {
            data = await merge.json();
            writeLocal([]);
          }
        }
        if (!cancelled) {
          syncedRef.current = true;
          setSynced(true);
          setWishlistProducts(Array.isArray(data.products) ? data.products : []);
        }
      } catch {
        // Not signed in after all (or offline): fall back to the browser list.
        if (!cancelled) {
          syncedRef.current = false;
          setSynced(false);
          setWishlistProducts(local);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [accountKey]);

  const toggleWishlist = useCallback((product: Product) => {
    setWishlistProducts((prev) => {
      const exists = prev.some((p) => p.id === product.id);
      const updated = exists ? prev.filter((p) => p.id !== product.id) : [...prev, product];

      if (syncedRef.current) {
        const request = exists
          ? fetch(`/api/wishlist?productId=${encodeURIComponent(product.id)}`, { method: 'DELETE' })
          : fetch('/api/wishlist', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ productId: product.id }),
            });
        // Optimistic update; roll back if the server refuses.
        request
          .then((res) => {
            if (!res.ok) throw new Error(String(res.status));
          })
          .catch(() => setWishlistProducts(prev));
      } else {
        writeLocal(updated);
      }
      return updated;
    });
  }, []);

  const isInWishlist = useCallback(
    (productId: string) => wishlistProducts.some((p) => p.id === productId),
    [wishlistProducts]
  );

  return (
    <WishlistContext.Provider
      value={{
        wishlistIds: wishlistProducts.map((p) => p.id),
        wishlistProducts,
        toggleWishlist,
        isInWishlist,
        wishlistCount: wishlistProducts.length,
        syncedToAccount,
        loading,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  return useContext(WishlistContext);
}
