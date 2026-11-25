'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Eye, Pencil, Plus, Search, Trash2, X } from 'lucide-react';
import { AppHeader } from '@/components/layout/AppHeader';
import { AuthGuard } from '@/components/layout/AuthGuard';
import { DeleteRecipeModal } from '@/components/recipes/DeleteRecipeModal';
import { EditRecipeModal } from '@/components/recipes/EditRecipeModal';
import { CategoryBadge } from '@/components/ui/CategoryBadge';
import { EmptyState } from '@/components/ui/EmptyState';
import { DashboardSkeleton } from '@/components/ui/Skeleton';
import { formatRecipeMeta, RECIPE_FALLBACK_IMAGE } from '@/lib/imageUtils';
import { listRecipes } from '@/services/recipeService';
import {
  RECIPE_CATEGORIES,
  type Recipe,
  type RecipeCategory,
} from '@/types/models';

export default function DashboardPage() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<RecipeCategory | 'all'>('all');

  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null);
  const [deletingRecipe, setDeletingRecipe] = useState<Recipe | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const items = await listRecipes();
      setRecipes(items);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredRecipes = useMemo(() => {
    const term = searchQuery.trim().toLowerCase();
    return recipes.filter((recipe) => {
      const matchesCategory =
        selectedCategory === 'all' || recipe.category === selectedCategory;
      if (!matchesCategory) return false;
      if (!term) return true;

      const inTitle = recipe.title.toLowerCase().includes(term);
      const inIngredients = recipe.ingredients.some((ing) =>
        ing.toLowerCase().includes(term)
      );
      return inTitle || inIngredients;
    });
  }, [recipes, searchQuery, selectedCategory]);

  const handleSavedRecipe = (updated: Recipe) => {
    setRecipes((prev) =>
      prev.map((item) => (item.id === updated.id ? updated : item))
    );
  };

  const handleDeletedRecipe = (deletedId: string) => {
    setRecipes((prev) => prev.filter((item) => item.id !== deletedId));
  };

  return (
    <AuthGuard>
      <div className="min-h-screen bg-[var(--mr-surface-default)]">
        <AppHeader />

        <main className="mx-auto max-w-mr-wide px-4 py-8">
          {/* Cabeçalho da página */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="mr-display-h1">Painel de Receitas</h1>
              <p className="mt-1 text-[15px] leading-[22px] text-[var(--mr-text-secondary)]">
                Gerencie todas as receitas criadas manualmente ou com auxílio da
                inteligência artificial.
              </p>
            </div>

            <Link href="/recipes/new" className="mr-btn-primary shrink-0">
              <Plus className="h-4 w-4" />
              Nova Receita
            </Link>
          </div>

          {/* Busca e filtros */}
          <section
            aria-label="Busca e filtros de receitas"
            className="mt-6 rounded-mr-lg border border-[var(--mr-border-default)] bg-[var(--mr-surface-cream)] p-4"
          >
            <div className="relative">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[var(--mr-text-muted)]" />
              <label htmlFor="dashboard-search" className="sr-only">
                Buscar receitas por título ou ingrediente
              </label>
              <input
                id="dashboard-search"
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por título ou ingrediente (ex.: salmão, alecrim, cogumelos)..."
                className="mr-input h-[48px] bg-white pl-11 pr-11 text-[15px]"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  aria-label="Limpar busca"
                  className="absolute right-1.5 top-1/2 flex h-[40px] w-[40px] -translate-y-1/2 items-center justify-center rounded-full text-[var(--mr-text-muted)] hover:bg-[var(--mr-surface-cream)] hover:text-[var(--mr-text-primary)]"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Chips de categorias */}
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setSelectedCategory('all')}
                className={`min-h-[36px] rounded-full px-3.5 py-1 text-[13px] font-bold transition-colors ${
                  selectedCategory === 'all'
                    ? 'bg-[var(--mr-terracotta-hover)] text-white'
                    : 'border border-[var(--mr-border-default)] bg-white text-[var(--mr-text-control)] hover:border-[var(--mr-border-strong)]'
                }`}
              >
                Todas ({recipes.length})
              </button>
              {RECIPE_CATEGORIES.map((cat) => {
                const isSelected = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() =>
                      setSelectedCategory(isSelected ? 'all' : cat.id)
                    }
                    className={`min-h-[36px] rounded-full px-3.5 py-1 text-[13px] font-bold transition-colors ${
                      isSelected
                        ? 'text-white'
                        : 'border border-[var(--mr-border-default)] bg-white text-[var(--mr-text-control)] hover:border-[var(--mr-border-strong)]'
                    }`}
                    style={
                      isSelected ? { backgroundColor: cat.bgToken } : undefined
                    }
                  >
                    {cat.label}
                  </button>
                );
              })}
            </div>
          </section>

          {/* Listagem / Tabela */}
          <section className="mt-6" aria-label="Tabela de receitas">
            {loading ? (
              <DashboardSkeleton />
            ) : filteredRecipes.length === 0 ? (
              <div className="rounded-mr-lg border border-[var(--mr-border-default)] bg-white">
                {recipes.length === 0 ? (
                  <EmptyState
                    title="Nenhuma receita cadastrada ainda"
                    description="Comece enviando a foto de um prato e o título para gerar sua primeira receita automaticamente com IA."
                    actionLabel="Nova Receita com IA"
                    actionHref="/recipes/new"
                  />
                ) : (
                  <EmptyState
                    title="Nenhum resultado encontrado"
                    description="Não encontramos receitas com esse título ou ingrediente no momento."
                    actionLabel="Limpar filtros"
                    onAction={() => {
                      setSearchQuery('');
                      setSelectedCategory('all');
                    }}
                  />
                )}
              </div>
            ) : (
              <>
                {/* Tabela Desktop (>= md) */}
                <div className="hidden overflow-hidden rounded-mr-lg border border-[var(--mr-border-default)] bg-white shadow-mr-sm md:block">
                  <table className="w-full border-collapse text-left">
                    <thead>
                      <tr className="border-b border-[var(--mr-border-default)] bg-[var(--mr-surface-cream)] text-[12px] font-bold uppercase tracking-[0.04em] text-[var(--mr-text-dropdown)]">
                        <th className="px-4 py-3.5">Receita</th>
                        <th className="px-4 py-3.5">Categoria</th>
                        <th className="px-4 py-3.5">Preparo & Rendimento</th>
                        <th className="px-4 py-3.5 text-right">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--mr-border-subtle)]">
                      {filteredRecipes.map((recipe) => {
                        const metaText = formatRecipeMeta(
                          recipe.prepInfo.servings,
                          recipe.prepInfo.prepTime
                        );

                        return (
                          <tr
                            key={recipe.id}
                            className="transition-colors hover:bg-[var(--mr-surface-subtle)]"
                          >
                            <td className="px-4 py-3.5">
                              <div className="flex items-center gap-4">
                                <Link
                                  href={`/recipes/${recipe.id}`}
                                  className="group relative aspect-[3/2] w-24 shrink-0 overflow-hidden rounded-mr-md bg-[var(--mr-surface-muted)]"
                                >
                                  <img
                                    src={recipe.imageUrl}
                                    alt={recipe.title}
                                    onError={(e) => {
                                      e.currentTarget.src = RECIPE_FALLBACK_IMAGE;
                                    }}
                                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                                  />
                                </Link>
                                <div className="min-w-0">
                                  <Link
                                    href={`/recipes/${recipe.id}`}
                                    className="line-clamp-2 text-[16px] font-bold leading-[22px] text-[var(--mr-text-primary)] hover:text-[var(--mr-terracotta-hover)]"
                                  >
                                    {recipe.title}
                                  </Link>
                                  <p className="mt-1 text-[13px] text-[var(--mr-text-muted)]">
                                    {recipe.ingredients.length} ingredientes
                                  </p>
                                </div>
                              </div>
                            </td>

                            <td className="px-4 py-3.5 align-middle">
                              <CategoryBadge category={recipe.category} />
                            </td>

                            <td className="px-4 py-3.5 align-middle text-[13px] font-bold text-[var(--mr-text-muted)]">
                              {metaText || '—'}
                            </td>

                            <td className="px-4 py-3.5 align-middle">
                              <div className="flex items-center justify-end gap-2">
                                <Link
                                  href={`/recipes/${recipe.id}`}
                                  className="inline-flex h-[40px] items-center gap-1.5 rounded-full border border-[var(--mr-border-default)] bg-white px-3.5 text-[13px] font-bold text-[var(--mr-text-control)] transition-colors hover:border-[var(--mr-terracotta-hover)] hover:text-[var(--mr-terracotta-hover)]"
                                >
                                  <Eye className="h-4 w-4" />
                                  Visualizar
                                </Link>

                                <button
                                  type="button"
                                  onClick={() => setEditingRecipe(recipe)}
                                  aria-label={`Editar ${recipe.title}`}
                                  title="Editar receita"
                                  className="inline-flex h-[40px] items-center gap-1.5 rounded-full border border-[var(--mr-border-default)] bg-white px-3.5 text-[13px] font-bold text-[var(--mr-text-control)] transition-colors hover:bg-[var(--mr-surface-cream)]"
                                >
                                  <Pencil className="h-4 w-4" />
                                  Editar
                                </button>

                                <button
                                  type="button"
                                  onClick={() => setDeletingRecipe(recipe)}
                                  aria-label={`Excluir ${recipe.title}`}
                                  title="Excluir receita"
                                  className="inline-flex h-[40px] w-[40px] items-center justify-center rounded-full border border-[var(--mr-border-default)] bg-white text-[var(--mr-error-text)] transition-colors hover:border-[var(--mr-error-border)] hover:bg-[var(--mr-error-bg)]"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Lista Responsiva Mobile (< md — sem overflow horizontal em 390px) */}
                <div className="space-y-4 md:hidden">
                  {filteredRecipes.map((recipe) => {
                    const metaText = formatRecipeMeta(
                      recipe.prepInfo.servings,
                      recipe.prepInfo.prepTime
                    );

                    return (
                      <article
                        key={recipe.id}
                        className="overflow-hidden rounded-mr-lg border border-[var(--mr-border-default)] bg-white p-4 shadow-mr-sm"
                      >
                        <div className="flex gap-3.5">
                          <Link
                            href={`/recipes/${recipe.id}`}
                            className="aspect-[3/2] w-28 shrink-0 overflow-hidden rounded-mr-md bg-[var(--mr-surface-muted)]"
                          >
                            <img
                              src={recipe.imageUrl}
                              alt={recipe.title}
                              onError={(e) => {
                                e.currentTarget.src = RECIPE_FALLBACK_IMAGE;
                              }}
                              className="h-full w-full object-cover"
                            />
                          </Link>

                          <div className="min-w-0 flex-1">
                            <CategoryBadge category={recipe.category} />
                            <h2 className="mt-2 line-clamp-2 text-[16px] font-bold leading-[22px] text-[var(--mr-text-primary)]">
                              {recipe.title}
                            </h2>
                            {metaText && (
                              <p className="mt-1 text-[12px] font-bold text-[var(--mr-text-muted)]">
                                {metaText}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-[var(--mr-border-subtle)] pt-3">
                          <Link
                            href={`/recipes/${recipe.id}`}
                            className="inline-flex min-h-[40px] flex-1 items-center justify-center gap-1.5 rounded-full border border-[var(--mr-border-default)] bg-white px-3 text-[13px] font-bold text-[var(--mr-text-control)]"
                          >
                            <Eye className="h-4 w-4" />
                            Visualizar
                          </Link>
                          <button
                            type="button"
                            onClick={() => setEditingRecipe(recipe)}
                            className="inline-flex min-h-[40px] flex-1 items-center justify-center gap-1.5 rounded-full border border-[var(--mr-border-default)] bg-white px-3 text-[13px] font-bold text-[var(--mr-text-control)]"
                          >
                            <Pencil className="h-4 w-4" />
                            Editar
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeletingRecipe(recipe)}
                            aria-label={`Excluir ${recipe.title}`}
                            className="inline-flex min-h-[40px] min-w-[40px] items-center justify-center rounded-full border border-[var(--mr-border-default)] bg-white px-3 text-[var(--mr-error-text)]"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </>
            )}
          </section>
        </main>

        <EditRecipeModal
          recipe={editingRecipe}
          isOpen={Boolean(editingRecipe)}
          onClose={() => setEditingRecipe(null)}
          onSaved={handleSavedRecipe}
        />

        <DeleteRecipeModal
          recipe={deletingRecipe}
          isOpen={Boolean(deletingRecipe)}
          onClose={() => setDeletingRecipe(null)}
          onDeleted={handleDeletedRecipe}
        />
      </div>
    </AuthGuard>
  );
}
