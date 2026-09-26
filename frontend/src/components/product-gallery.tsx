'use client';

import { useState } from 'react';

interface ProductGalleryProps {
  images: string[];
  title: string;
}

export function ProductGallery({ images, title }: ProductGalleryProps) {
  const [activeIdx, setActiveIdx] = useState(0);

  if (images.length === 0) {
    return (
      <div className="aspect-video w-full rounded-2xl bg-foreground/5 flex items-center justify-center border border-border text-foreground/30 font-bold text-sm">
        No Image Available
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Main image */}
      <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-foreground/5 border border-border shadow-sm group">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          key={activeIdx}
          src={images[activeIdx]}
          alt={title}
          className="w-full h-full object-cover transition-all duration-500 animate-in fade-in"
        />

        {/* Navigation arrows (only when multiple images) */}
        {images.length > 1 && (
          <>
            <button
              onClick={() => setActiveIdx((i) => (i === 0 ? images.length - 1 : i - 1))}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer backdrop-blur-sm"
              aria-label="Previous image"
            >
              ‹
            </button>
            <button
              onClick={() => setActiveIdx((i) => (i === images.length - 1 ? 0 : i + 1))}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer backdrop-blur-sm"
              aria-label="Next image"
            >
              ›
            </button>
          </>
        )}

        {/* Image counter */}
        {images.length > 1 && (
          <div className="absolute bottom-3 right-3 bg-black/50 text-white text-xs px-2 py-1 rounded-full backdrop-blur-sm">
            {activeIdx + 1} / {images.length}
          </div>
        )}
      </div>

      {/* Thumbnail strip */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
          {images.map((src, idx) => (
            <button
              key={idx}
              onClick={() => setActiveIdx(idx)}
              className={`relative flex-shrink-0 w-20 h-16 rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                activeIdx === idx
                  ? 'border-primary shadow-md shadow-primary/20 scale-[1.03]'
                  : 'border-border hover:border-primary/50 opacity-70 hover:opacity-100'
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt={`View ${idx + 1}`} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
