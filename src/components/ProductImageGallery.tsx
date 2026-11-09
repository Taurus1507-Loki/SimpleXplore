'use client';

import React, { useState } from 'react';
import Image from '@/components/SafeImage';
import { ProductImage } from '@/types';

interface ProductImageGalleryProps {
  primaryImage: string;
  title: string;
  images?: ProductImage[];
}

export default function ProductImageGallery({
  primaryImage,
  title,
  images = [],
}: ProductImageGalleryProps) {
  // Collect all unique images (primary first)
  const allImages = [
    primaryImage,
    ...[...images]
      .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
      .map((img) => img.image_url)
      .filter((url, i, all) => url && url !== primaryImage && all.indexOf(url) === i),
  ];

  const [activeImage, setActiveImage] = useState(primaryImage || allImages[0]);

  return (
    <div className="space-y-4">
      {/* Main Image View */}
      <div className="relative aspect-square w-full rounded-3xl bg-white border border-surface-border overflow-hidden p-6 flex items-center justify-center">
        <Image
          src={activeImage}
          alt={title}
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 40vw"
          className="object-contain p-4 transition-transform duration-500 ease-out-expo hover:scale-[1.03]"
        />
      </div>

      {/* Thumbnails Row if multiple images exist */}
      {allImages.length > 1 && (
        <div className="flex items-center gap-2.5 overflow-x-auto pb-1 max-w-full">
          {allImages.map((imgUrl, index) => {
            const isSelected = activeImage === imgUrl;
            return (
              <button
                key={index}
                type="button"
                onClick={() => setActiveImage(imgUrl)}
                aria-label={`Show image ${index + 1} of ${allImages.length}`}
                aria-pressed={isSelected}
                className={`relative w-16 h-16 min-w-[44px] rounded-xl border-2 flex-shrink-0 bg-white overflow-hidden p-1 transition-all ${
                  isSelected
                    ? 'border-brand-500 shadow-soft-sm scale-105'
                    : 'border-surface-border hover:border-brand-300 opacity-75 hover:opacity-100'
                }`}
              >
                <Image
                  src={imgUrl}
                  alt=""
                  sizes="64px"
                  fill
                  className="object-contain p-1"
                />
              </button>
            );
          })}
        </div>
      )}

    </div>
  );
}

