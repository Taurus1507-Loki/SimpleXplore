'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product } from '@/types';

interface WishlistContextType {
  wishlistIds: string[];
  wishlistProducts: Product[];
  toggleWishlist: (product: Product) => void;
  isInWishlist: (productId: string) => boolean;
  wishlistCount: number;
}

const WishlistContext = createContext<WishlistContextType>({
  wishlistIds: [],
  wishlistProducts: [],
  toggleWishlist: () => {},
  isInWishlist: () => false,
  wishlistCount: 0,
});

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [wishlistProducts, setWishlistProducts] = useState<Product[]>([]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('sx_wishlist');
      if (saved) {
        setWishlistProducts(JSON.parse(saved));
      }
    } catch {
      // Ignore local storage error
    }
  }, []);

  const toggleWishlist = (product: Product) => {
    setWishlistProducts(prev => {
      const exists = prev.some(p => p.id === product.id);
      let updated: Product[];
      if (exists) {
        updated = prev.filter(p => p.id !== product.id);
      } else {
        updated = [...prev, product];
      }
      try {
        localStorage.setItem('sx_wishlist', JSON.stringify(updated));
      } catch {
        // Ignore
      }
      return updated;
    });
  };

  const isInWishlist = (productId: string) => {
    return wishlistProducts.some(p => p.id === productId);
  };

  const wishlistIds = wishlistProducts.map(p => p.id);

  return (
    <WishlistContext.Provider
      value={{
        wishlistIds,
        wishlistProducts,
        toggleWishlist,
        isInWishlist,
        wishlistCount: wishlistProducts.length,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  return useContext(WishlistContext);
}

