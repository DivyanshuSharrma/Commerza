'use client';

import * as React from 'react';

interface CategoryFilterProps {
  categories: { id: string; name: string; slug: string }[];
  selectedSlug: string | null;
  onSelect: (slug: string | null) => void;
}

export function CategoryFilter({ categories, selectedSlug, onSelect }: CategoryFilterProps) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0">
      <button
        onClick={() => onSelect(null)}
        className={`px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all border cursor-pointer whitespace-nowrap select-none ${
          selectedSlug === null
            ? 'bg-primary text-white border-primary shadow-sm'
            : 'bg-card text-foreground/75 border-border hover:bg-foreground/5'
        }`}
      >
        All Products
      </button>
      {categories.map((category) => (
        <button
          key={category.id}
          onClick={() => onSelect(category.slug)}
          className={`px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all border cursor-pointer whitespace-nowrap select-none ${
            selectedSlug === category.slug
              ? 'bg-primary text-white border-primary shadow-sm'
              : 'bg-card text-foreground/75 border-border hover:bg-foreground/5'
          }`}
        >
          {category.name}
        </button>
      ))}
    </div>
  );
}
