'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Check,
  Clock,
  Flame,
  Link2,
  Pencil,
  Printer,
  Trash2,
  Users,
} from 'lucide-react';
import { AppHeader } from '@/components/layout/AppHeader';
import { AuthGuard } from '@/components/layout/AuthGuard';
import { DeleteRecipeModal } from '@/components/recipes/DeleteRecipeModal';
import { EditRecipeModal } from '@/components/recipes/EditRecipeModal';
import { CategoryBadge } from '@/components/ui/CategoryBadge';
import { EmptyState } from '@/components/ui/EmptyState';
import { RecipePreviewSkeleton } from '@/components/ui/Skeleton';
import { useToast } from '@/components/ui/ToastProvider';
import { RECIPE_FALLBACK_IMAGE } from '@/lib/imageUtils';
import { getRecipeById } from '@/services/recipeService';
import type { Recipe } from '@/types/models';

export default function RecipeDetailsPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const toast = useToast();

  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkedIngredients, setCheckedIngredients] = useState<Record<number, boolean>>({});
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const loadRecipe = useCallback(async () => {
    if (!params?.id) return;
    setLoading(true);
    try {
      const found = await getRecipeById(params.id);
      setRecipe(found);
    } finally {
      setLoading(false);
    }
  }, [params?.id]);

  useEffect(() => {
    void loadRecipe();
  }, [loadRecipe]);

  const toggleIngredient = (idx: number) => {
    setCheckedIngredients((prev) => ({
      ...prev,
      [idx]: !prev[idx],
    }));
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success('Link copiado!');
    } catch {
      toast.info('Copie a URL diretamente da barra do navegador.');
    }
  };

  return (
    <AuthGuard>
      <div className="min-h-screen bg-[var(--mr-surface-default)]">
        <AppHeader />

        {loading ? (
          <main className="mx-auto max-w-mr-content px-4 py-8">
            <RecipePreviewSkeleton />
          </main>
        ) : !recipe ? (
          <main className="mx-auto max-w-mr-content px-4 py-12">
            <EmptyState
              title="Receita não encontrada"
              description="Esta receita pode ter sido removida ou o endereço informado não existe."
              actionLabel="Voltar para o Painel"
              actionHref="/dashboard"
            />
          </main>
        ) : (
          <article>
            {/* Hero da Receita (DESIGN_SYSTEM.md Secao 7.6.B) */}
            <section className="mr-surface-dark relative flex min-h-[340px] w-full items-end overflow-hidden bg-[var(--mr-surface-dark-gourmet)] md:min-h-[384px]">
              <img
                src={recipe.imageUrl}
                alt=""
                aria-hidden="true"
                onError={(e) => {
                  e.currentTarget.src = RECIPE_FALLBACK_IMAGE;
                }}
                className="absolute inset-0 h-full w-full object-cover opacity-60"
              />
              <div
                className="absolute inset-0"
                style={{ backgroundImage: 'var(--mr-overlay-hero)' }}
              />

              <div className="relative z-10 mx-auto w-full max-w-mr-content px-4 py-8 md:py-10">
                <Link
                  href="/dashboard"
                  className="no-print mb-4 inline-flex min-h-[36px] items-center gap-2 rounded-full bg-black/40 px-3.5 py-1.5 text-[13px] font-bold text-white transition-colors hover:bg-black/60"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Voltar ao painel
                </Link>

                <div className="mb-3">
                  <CategoryBadge category={recipe.category} />
                </div>

                <h1 className="mr-hero-title max-w-[780px]">{recipe.title}</h1>

                {recipe.description && (
                  <p className="mt-3 max-w-[720px] text-[16px] leading-[24px] text-[var(--mr-text-inverse-soft)] md:text-[18px] md:leading-[28px]">
                    {recipe.description}
                  </p>
                )}

                {/* Informações de Preparo no Hero */}
                <div className="mt-6 flex flex-wrap items-center gap-5">
                  {recipe.prepInfo.servings && (
                    <div className="flex items-center gap-2.5 text-white">
                      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--mr-brand-orange-aa)] text-white">
                        <Users className="h-5 w-5" />
                      </span>
                      <div>
                        <span className="block text-[11px] font-bold uppercase tracking-[0.04em] text-white/80">
                          Rendimento
                        </span>
                        <span className="text-[14px] font-bold">
                          {recipe.prepInfo.servings}
                        </span>
                      </div>
                    </div>
                  )}

                  {recipe.prepInfo.prepTime && (
                    <div className="flex items-center gap-2.5 text-white">
                      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--mr-brand-orange-aa)] text-white">
                        <Clock className="h-5 w-5" />
                      </span>
                      <div>
                        <span className="block text-[11px] font-bold uppercase tracking-[0.04em] text-white/80">
                          Tempo de preparo
                        </span>
                        <span className="text-[14px] font-bold">
                          {recipe.prepInfo.prepTime}
                        </span>
                      </div>
                    </div>
                  )}

                  {recipe.prepInfo.difficulty && (
                    <div className="flex items-center gap-2.5 text-white">
                      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--mr-brand-orange-aa)] text-white">
                        <Flame className="h-5 w-5" />
                      </span>
                      <div>
                        <span className="block text-[11px] font-bold uppercase tracking-[0.04em] text-white/80">
                          Dificuldade
                        </span>
                        <span className="text-[14px] font-bold">
                          {recipe.prepInfo.difficulty}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </section>

            {/* Imagem principal & Barra de Ações */}
            <section className="mx-auto max-w-mr-content px-4 pt-8">
              <div className="overflow-hidden rounded-mr-lg border border-[var(--mr-border-default)] bg-[var(--mr-surface-muted)] shadow-mr-card">
                <div className="aspect-[16/9] w-full">
                  <img
                    src={recipe.imageUrl}
                    alt={recipe.title}
                    onError={(e) => {
                      e.currentTarget.src = RECIPE_FALLBACK_IMAGE;
                    }}
                    className="h-full w-full object-cover"
                  />
                </div>
              </div>

              <div className="no-print mt-5 flex flex-wrap items-center justify-between gap-3 border-b border-[var(--mr-border-default)] pb-5">
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => void handleCopyLink()}
                    className="mr-btn-secondary"
                  >
                    <Link2 className="h-4 w-4" />
                    Copiar link
                  </button>
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="mr-btn-secondary"
                  >
                    <Printer className="h-4 w-4" />
                    Imprimir
                  </button>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setEditOpen(true)}
                    className="mr-btn-primary"
                  >
                    <Pencil className="h-4 w-4" />
                    Editar
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteOpen(true)}
                    className="mr-btn-danger"
                  >
                    <Trash2 className="h-4 w-4" />
                    Excluir
                  </button>
                </div>
              </div>
            </section>

            {/* Corpo Editorial em 2 Colunas Assimétricas */}
            <section className="mx-auto max-w-mr-content px-4 py-8 md:py-10">
              <div className="grid grid-cols-1 gap-8 md:grid-cols-12">
                {/* Lista de Ingredientes com Checkboxes Interativos */}
                <div className="md:col-span-5">
                  <h2 className="mr-editorial-h2 mb-2">Ingredientes</h2>
                  <p className="no-print mb-4 text-[13px] text-[var(--mr-text-muted)]">
                    Marque os itens conforme for separando na cozinha.
                  </p>
                  <ul className="space-y-3">
                    {recipe.ingredients.map((item, idx) => {
                      const isChecked = Boolean(checkedIngredients[idx]);
                      return (
                        <li key={idx}>
                          <label className="flex cursor-pointer items-start gap-3 rounded-mr-md p-1.5 transition-colors hover:bg-[var(--mr-surface-cream)]">
                            <span
                              className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-mr-xs border transition-colors ${
                                isChecked
                                  ? 'border-[var(--mr-terracotta-hover)] bg-[var(--mr-terracotta-hover)] text-white'
                                  : 'border-[var(--mr-border-strong)] bg-white'
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => toggleIngredient(idx)}
                                className="sr-only"
                              />
                              {isChecked && <Check className="h-3.5 w-3.5" />}
                            </span>
                            <span
                              className={`text-[16px] leading-[24px] transition-colors ${
                                isChecked
                                  ? 'text-[var(--mr-text-muted)] line-through'
                                  : 'text-[var(--mr-text-secondary)]'
                              }`}
                            >
                              {item}
                            </span>
                          </label>
                        </li>
                      );
                    })}
                  </ul>
                </div>

                {/* Modo de Preparo */}
                <div className="border-t border-[var(--mr-border-default)] pt-8 md:col-span-7 md:border-l md:border-t-0 md:pl-8 md:pt-0">
                  <h3 className="mr-editorial-h3 mb-5">Modo de preparo</h3>
                  <ol className="space-y-5">
                    {recipe.instructions.map((step, idx) => (
                      <li key={idx} className="flex items-start gap-4">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--mr-terracotta-hover)] text-[14px] font-bold text-white">
                          {idx + 1}
                        </span>
                        <p className="pt-0.5 text-[16px] leading-[26px] text-[var(--mr-text-secondary)]">
                          {step}
                        </p>
                      </li>
                    ))}
                  </ol>
                </div>
              </div>
            </section>
          </article>
        )}

        <EditRecipeModal
          recipe={recipe}
          isOpen={editOpen}
          onClose={() => setEditOpen(false)}
          onSaved={(updated) => setRecipe(updated)}
        />

        <DeleteRecipeModal
          recipe={recipe}
          isOpen={deleteOpen}
          onClose={() => setDeleteOpen(false)}
          onDeleted={() => router.push('/dashboard')}
        />
      </div>
    </AuthGuard>
  );
}
