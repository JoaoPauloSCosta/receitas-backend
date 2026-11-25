import React from 'react';
import Link from 'next/link';
import { UtensilsCrossed } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel: string;
  onAction?: () => void;
  actionHref?: string;
}

export function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
  actionHref,
}: EmptyStateProps) {
  return (
    <div className="mx-auto max-w-[480px] px-6 py-12 text-center">
      <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-[var(--mr-surface-cream)]">
        <UtensilsCrossed className="h-12 w-12 text-[var(--mr-terracotta)]" />
      </div>
      <h3 className="text-[20px] font-bold leading-[28px] text-[var(--mr-text-primary)]">
        {title}
      </h3>
      <p className="mt-2 text-[14px] font-normal leading-[20px] text-[var(--mr-text-secondary)]">
        {description}
      </p>
      <div className="mt-6">
        {actionHref ? (
          <Link href={actionHref} className="mr-btn-primary">
            {actionLabel}
          </Link>
        ) : (
          <button type="button" onClick={onAction} className="mr-btn-primary">
            {actionLabel}
          </button>
        )}
      </div>
    </div>
  );
}
