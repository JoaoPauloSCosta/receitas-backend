import React from 'react';
import { CATEGORY_META, type RecipeCategory } from '@/types/models';

export function CategoryBadge({
  category,
  className = '',
}: {
  category: RecipeCategory;
  className?: string;
}) {
  const meta = CATEGORY_META[category] ?? CATEGORY_META.aves;

  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-[12px] font-bold uppercase leading-[16px] tracking-[0.025em] text-white ${className}`}
      style={{ backgroundColor: meta.bgToken }}
    >
      {meta.label}
    </span>
  );
}
