'use client';

import React, { useState, useMemo } from 'react';
import { Product, Category } from '@/types';
import ProductCard from './ProductCard';
import { formatPrice } from '@/lib/utils/formatters';
import { 
  SlidersHorizontal, 
  ArrowUpDown, 
  X, 
  RotateCcw, 
  Star, 
  Percent, 
  Check, 
  Grid 
} from 'lucide-react';

interface ProductCatalogClientProps {
  initialProducts: Product[];
  categories: Category[];
  initialCategorySlug?: string;
  initialRetailer?: string;
  initialSearch?: string;
}

export default function ProductCatalogClient({
  initialProducts,
  categories,
  initialCategorySlug,
  initialRetailer,
  initialSearch,
}: ProductCatalogClientProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategorySlug || 'all');
  const [selectedRetailer, setSelectedRetailer] = useState<string>(initialRetailer || 'all');
  const [searchQuery, setSearchQuery] = useState<string>(initialSearch || '');
  const [minDiscount, setMinDiscount] = useState<number>(0);
  const [minRating, setMinRating] = useState<number>(0);
  const [sortBy, setSortBy] = useState<'newest' | 'price_low' | 'price_high' | 'discount' | 'rating'>('newest');
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Compute price range from products
  const maxProductPrice = useMemo(() => {
    if (initialProducts.length === 0) return 50000;
    return Math.max(...initialProducts.map(p => p.current_price), 10000);
  }, [initialProducts]);

  const [minPrice, setMinPrice] = useState<number>(0);
  const [maxPrice, setMaxPrice] = useState<number>(maxProductPrice);

  const retailers = useMemo(() => {
    const set = new Set<string>();
    initialProducts.forEach(p => {
      if (p.retailer) set.add(p.retailer);
    });
    return Array.from(set);
  }, [initialProducts]);

  // Reactive filtering
  const filteredProducts = useMemo(() => {
    return initialProducts.filter(p => {
      // Category filter
      if (selectedCategory !== 'all') {
        const cat = categories.find(c => c.slug === selectedCategory);
        if (cat && p.category_id !== cat.id) return false;
      }

      // Retailer filter
      if (selectedRetailer !== 'all' && p.retailer.toLowerCase() !== selectedRetailer.toLowerCase()) {
        return false;
      }

      // Price limit filter (min and max)
      if (p.current_price < minPrice || p.current_price > maxPrice) {
        return false;
      }

      // Discount filter
      if (minDiscount > 0 && (p.discount || 0) < minDiscount) {
        return false;
      }

      // Rating filter
      if (minRating > 0 && (p.rating || 0) < minRating) {
        return false;
      }

      // Search query filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesTitle = p.title.toLowerCase().includes(query);
        const matchesRetailer = p.retailer.toLowerCase().includes(query);
        const matchesDesc = p.description?.toLowerCase().includes(query);
        if (!matchesTitle && !matchesRetailer && !matchesDesc) return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'price_low') return a.current_price - b.current_price;
      if (sortBy === 'price_high') return b.current_price - a.current_price;
      if (sortBy === 'discount') return (b.discount || 0) - (a.discount || 0);
      if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  }, [
    initialProducts, 
    categories, 
    selectedCategory, 
    selectedRetailer, 
    minPrice,
    maxPrice, 
    minDiscount, 
    minRating, 
    searchQuery, 
    sortBy
  ]);

  const handleResetFilters = () => {
    setSelectedCategory('all');
    setSelectedRetailer('all');
    setSearchQuery('');
    setMinDiscount(0);
    setMinRating(0);
    setMinPrice(0);
    setMaxPrice(maxProductPrice);
    setSortBy('newest');
  };

  const hasActiveFilters = 
    selectedCategory !== 'all' || 
    selectedRetailer !== 'all' || 
    searchQuery !== '' || 
    minDiscount > 0 || 
    minRating > 0 || 
    minPrice > 0 ||
    maxPrice < maxProductPrice;

  return (
    <div className="space-y-6">
      {/* Top Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-surface-border shadow-soft-sm">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
            className="md:hidden inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-bg border border-surface-border text-xs font-semibold text-copy-primary"
          >
            <SlidersHorizontal className="w-4 h-4 text-brand-600" />
            <span>Filters {hasActiveFilters && '(Active)'}</span>
          </button>

          <span className="text-xs font-medium text-copy-secondary">
            Showing <strong className="text-copy-primary font-bold">{filteredProducts.length}</strong> of {initialProducts.length} verified deals
          </span>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="text-xs font-semibold text-red-700 hover:underline flex items-center gap-1 ml-2"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          )}
        </div>

        {/* Sort dropdown */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-copy-muted flex items-center gap-1">
            <ArrowUpDown className="w-3.5 h-3.5" /> Sort:
          </span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="text-xs font-semibold bg-surface-bg border border-surface-border rounded-xl px-3 py-1.5 text-copy-primary focus:outline-none focus:border-brand-500"
          >
            <option value="newest">Newest Arrivals</option>
            <option value="discount">Highest Discount</option>
            <option value="price_low">Price: Low to High</option>
            <option value="price_high">Price: High to Low</option>
            <option value="rating">Customer Rating</option>
          </select>
        </div>
      </div>

      {/* Main 2-column layout: Left Filter sidebar, Right Product Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Left Filter Sidebar (3 cols on desktop) */}
        <aside className={`md:col-span-3 space-y-6 bg-white p-5 rounded-3xl border border-surface-border shadow-soft-sm ${
          mobileFilterOpen ? 'block' : 'hidden md:block'
        }`}>
          <div className="flex items-center justify-between border-b border-surface-border pb-3">
            <h3 className="font-bold text-sm text-copy-primary flex items-center gap-2 font-display">
              <SlidersHorizontal className="w-4 h-4 text-brand-600" />
              Refine Search
            </h3>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="text-[11px] font-semibold text-red-700 hover:underline"
              >
                Clear all
              </button>
            )}
          </div>

          {/* Department / Category Filter */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-copy-primary uppercase tracking-wider">
              Department
            </label>
            <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
              <button
                type="button"
                onClick={() => setSelectedCategory('all')}
                className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center justify-between ${
                  selectedCategory === 'all'
                    ? 'bg-brand-50 text-brand-700 font-bold'
                    : 'text-copy-secondary hover:bg-surface-bg'
                }`}
              >
                <span>All Departments</span>
                {selectedCategory === 'all' && <Check className="w-3.5 h-3.5 text-brand-600" />}
              </button>

              {categories.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setSelectedCategory(c.slug)}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center justify-between ${
                    selectedCategory === c.slug
                      ? 'bg-brand-50 text-brand-700 font-bold'
                      : 'text-copy-secondary hover:bg-surface-bg'
                  }`}
                >
                  <span className="truncate">{c.name}</span>
                  {selectedCategory === c.slug && <Check className="w-3.5 h-3.5 text-brand-600" />}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range Filter (Min & Max Inputs + Slider) */}
          <div className="space-y-3 pt-3 border-t border-surface-border/60">
            <div className="flex items-center justify-between text-xs">
              <label className="font-bold text-copy-primary uppercase tracking-wider">Price Range</label>
              {(minPrice > 0 || maxPrice < maxProductPrice) && (
                <span className="text-[10px] font-bold text-brand-700 bg-brand-50 px-2 py-0.5 rounded-full border border-brand-200">
                  Active
                </span>
              )}
            </div>

            {/* Min and Max Inputs */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-[10px] text-copy-muted font-bold uppercase tracking-wider">Min Price</span>
                <div className="relative mt-1">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-copy-muted font-bold">₹</span>
                  <input
                    type="number"
                    min={0}
                    max={maxPrice}
                    step={100}
                    placeholder="0"
                    value={minPrice === 0 ? '' : minPrice}
                    onChange={(e) => {
                      const val = Number(e.target.value) || 0;
                      setMinPrice(Math.max(0, val));
                    }}
                    className="w-full pl-6 pr-2 py-1.5 text-xs font-semibold rounded-xl border border-surface-border bg-surface-bg focus:outline-none focus:border-brand-500 text-copy-primary"
                  />
                </div>
              </div>

              <div>
                <span className="text-[10px] text-copy-muted font-bold uppercase tracking-wider">Max Price</span>
                <div className="relative mt-1">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-copy-muted font-bold">₹</span>
                  <input
                    type="number"
                    min={minPrice}
                    step={100}
                    placeholder={maxProductPrice.toString()}
                    value={maxPrice === maxProductPrice ? '' : maxPrice}
                    onChange={(e) => {
                      const val = e.target.value === '' ? maxProductPrice : Number(e.target.value) || 0;
                      setMaxPrice(Math.max(minPrice, val));
                    }}
                    className="w-full pl-6 pr-2 py-1.5 text-xs font-semibold rounded-xl border border-surface-border bg-surface-bg focus:outline-none focus:border-brand-500 text-copy-primary"
                  />
                </div>
              </div>
            </div>

            {/* Slider */}
            <div className="space-y-1 pt-1">
              <input
                type="range"
                min={0}
                max={maxProductPrice}
                step={500}
                value={maxPrice}
                onChange={(e) => setMaxPrice(Math.max(minPrice, Number(e.target.value)))}
                className="w-full accent-brand-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-copy-muted font-semibold">
                <span>{formatPrice(minPrice, 'INR')}</span>
                <span>{formatPrice(maxPrice, 'INR')}</span>
              </div>
            </div>
          </div>

          {/* Minimum Discount Filter */}
          <div className="space-y-2 pt-3 border-t border-surface-border/60">
            <label className="block text-xs font-bold text-copy-primary uppercase tracking-wider">
              Min. Discount
            </label>
            <div className="grid grid-cols-2 gap-1.5 text-xs">
              {[0, 15, 25, 40].map((disc) => (
                <button
                  key={disc}
                  type="button"
                  onClick={() => setMinDiscount(disc)}
                  className={`px-2 py-1.5 rounded-lg border text-center transition-colors ${
                    minDiscount === disc
                      ? 'bg-brand-500 text-white border-brand-500 font-bold'
                      : 'bg-surface-bg text-copy-secondary border-surface-border hover:bg-surface-border'
                  }`}
                >
                  {disc === 0 ? 'Any' : `${disc}% or more`}
                </button>
              ))}
            </div>
          </div>

          {/* Retailer Filter */}
          <div className="space-y-2 pt-3 border-t border-surface-border/60">
            <label className="block text-xs font-bold text-copy-primary uppercase tracking-wider">
              Store / Retailer
            </label>
            <div className="space-y-1">
              <button
                type="button"
                onClick={() => setSelectedRetailer('all')}
                className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center justify-between ${
                  selectedRetailer === 'all'
                    ? 'bg-brand-50 text-brand-700 font-bold'
                    : 'text-copy-secondary hover:bg-surface-bg'
                }`}
              >
                <span>All Stores</span>
                {selectedRetailer === 'all' && <Check className="w-3.5 h-3.5 text-brand-600" />}
              </button>

              {retailers.map((ret) => (
                <button
                  key={ret}
                  type="button"
                  onClick={() => setSelectedRetailer(ret)}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center justify-between ${
                    selectedRetailer === ret
                      ? 'bg-brand-50 text-brand-700 font-bold'
                      : 'text-copy-secondary hover:bg-surface-bg'
                  }`}
                >
                  <span>{ret}</span>
                  {selectedRetailer === ret && <Check className="w-3.5 h-3.5 text-brand-600" />}
                </button>
              ))}
            </div>
          </div>

          {/* Rating Filter */}
          <div className="space-y-2 pt-3 border-t border-surface-border/60">
            <label className="block text-xs font-bold text-copy-primary uppercase tracking-wider">
              Customer Rating
            </label>
            <div className="space-y-1 text-xs">
              {[0, 4.0, 4.5].map((stars) => (
                <button
                  key={stars}
                  type="button"
                  onClick={() => setMinRating(stars)}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg font-medium transition-colors flex items-center justify-between ${
                    minRating === stars
                      ? 'bg-accent-50 text-accent-700 font-bold'
                      : 'text-copy-secondary hover:bg-surface-bg'
                  }`}
                >
                  <div className="flex items-center gap-1">
                    {stars === 0 ? (
                      <span>All Ratings</span>
                    ) : (
                      <>
                        <Star className="w-3.5 h-3.5 fill-accent-400 text-accent-400" />
                        <span>{stars}★ &amp; above</span>
                      </>
                    )}
                  </div>
                  {minRating === stars && <Check className="w-3.5 h-3.5 text-accent-700" />}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Right Product Grid (9 cols on desktop) */}
        <div className="md:col-span-9 space-y-6">
          {filteredProducts.length === 0 ? (
            <div className="py-20 text-center bg-white rounded-3xl border border-surface-border p-8 space-y-3">
              <div className="w-12 h-12 rounded-full bg-brand-50 text-brand-600 mx-auto flex items-center justify-center font-bold text-lg">
                🔍
              </div>
              <h3 className="font-bold text-copy-primary text-base">No deals match your criteria</h3>
              <p className="text-xs text-copy-secondary max-w-sm mx-auto">
                Try widening your price range, clearing specific filters, or checking back shortly for new Telegram deal posts.
              </p>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-xl text-xs font-semibold shadow-soft-sm transition-all"
                >
                  Reset All Filters
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

