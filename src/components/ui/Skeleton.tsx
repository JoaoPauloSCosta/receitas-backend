import React from 'react';

export function DashboardSkeleton() {
  return (
    <div className="space-y-4" aria-busy="true" aria-label="Carregando receitas">
      {[1, 2, 3, 4].map((row) => (
        <div
          key={row}
          className="flex flex-col gap-4 rounded-mr-md border border-[var(--mr-border-default)] bg-white p-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="flex items-center gap-4">
            <div className="mr-skeleton h-16 w-24 shrink-0 rounded-mr-md" />
            <div className="space-y-2">
              <div className="mr-skeleton h-3 w-20 rounded-mr-xs" />
              <div className="mr-skeleton h-5 w-56 rounded-mr-xs" />
              <div className="mr-skeleton h-3 w-32 rounded-mr-xs" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="mr-skeleton h-10 w-24 rounded-full" />
            <div className="mr-skeleton h-10 w-10 rounded-full" />
            <div className="mr-skeleton h-10 w-10 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function RecipePreviewSkeleton() {
  return (
    <div
      className="rounded-mr-lg border border-[var(--mr-border-default)] bg-white p-6 shadow-mr-sm md:p-8"
      aria-busy="true"
      aria-label="Gerando receita com inteligência artificial"
    >
      <div className="space-y-4">
        <div className="mr-skeleton h-6 w-32 rounded-full" />
        <div className="mr-skeleton h-8 w-3/4 rounded-mr-xs" />
        <div className="mr-skeleton h-4 w-full rounded-mr-xs" />
        <div className="mr-skeleton h-4 w-5/6 rounded-mr-xs" />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-3 border-y border-[var(--mr-border-subtle)] py-4 sm:grid-cols-3">
        <div className="mr-skeleton h-12 rounded-mr-md" />
        <div className="mr-skeleton h-12 rounded-mr-md" />
        <div className="mr-skeleton h-12 rounded-mr-md" />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-8 md:grid-cols-2">
        <div className="space-y-3">
          <div className="mr-skeleton h-6 w-40 rounded-mr-xs" />
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="mr-skeleton h-4 w-full rounded-mr-xs" />
          ))}
        </div>
        <div className="space-y-3">
          <div className="mr-skeleton h-6 w-44 rounded-mr-xs" />
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="mr-skeleton h-12 w-full rounded-mr-xs" />
          ))}
        </div>
      </div>
    </div>
  );
}
