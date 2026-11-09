'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { ShieldCheck } from 'lucide-react';
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
    ...images.map((img) => img.image_url).filter((url) => url && url !== primaryImage),
  ];

  const [activeImage, setActiveImage] = useState(primaryImage || allImages[0]);

  return (
    <div className="space-y-4">
      {/* Main Image View */}
      <div className="relative aspect-square w-full rounded-2xl bg-[#F8FAF8] border border-surface-border overflow-hidden p-6 flex items-center justify-center">
        <Image
          src={activeImage}
          alt={title}
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 40vw"
          className="object-contain p-4 hover:scale-105 transition-transform duration-300"
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
                className={`relative w-16 h-16 rounded-xl border-2 flex-shrink-0 bg-white overflow-hidden p-1 transition-all ${
                  isSelected
                    ? 'border-brand-500 shadow-soft-sm scale-105'
                    : 'border-surface-border hover:border-brand-300 opacity-75 hover:opacity-100'
                }`}
              >
                <Image
                  src={imgUrl}
                  alt={`${title} thumbnail ${index + 1}`}
                  fill
                  className="object-contain p-1"
                />
              </button>
            );
          })}
        </div>
      )}

      <div className="flex items-center justify-center gap-2 text-xs text-copy-secondary">
        <ShieldCheck className="w-4 h-4 text-brand-600" />
        <span>Genuine retailer product preview</span>
      </div>
    </div>
  );
}

