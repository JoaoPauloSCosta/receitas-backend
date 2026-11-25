'use client';

import React, { useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Check,
  Clock,
  Flame,
  ImagePlus,
  Loader2,
  RefreshCw,
  Sparkles,
  Upload,
  Users,
} from 'lucide-react';
import { AppHeader } from '@/components/layout/AppHeader';
import { AuthGuard } from '@/components/layout/AuthGuard';
import { CategoryBadge } from '@/components/ui/CategoryBadge';
import { RecipePreviewSkeleton } from '@/components/ui/Skeleton';
import { useToast } from '@/components/ui/ToastProvider';
import { compressImageFile } from '@/lib/imageUtils';
import { createRecipe } from '@/services/recipeService';
import type { GeneratedRecipeDraft } from '@/types/models';

export default function NewRecipePage() {
  const router = useRouter();
  const toast = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState('');
  const [imageBase64, setImageBase64] = useState('');
  const [imageName, setImageName] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [variation, setVariation] = useState(0);
  const [formError, setFormError] = useState('');
  const [draft, setDraft] = useState<GeneratedRecipeDraft | null>(null);

  const processSelectedFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setFormError('Selecione um arquivo de imagem válido (JPG, PNG ou WebP).');
      return;
    }
    try {
      setFormError('');
      const compressed = await compressImageFile(file);
      setImageBase64(compressed);
      setImageName(file.name);
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : 'Erro ao processar a imagem.';
      setFormError(msg);
      toast.error(msg);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      void processSelectedFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      void processSelectedFile(file);
    }
  };

  const requestGeneration = async (nextVariation: number) => {
    if (!imageBase64) {
      setFormError('Envie uma foto do prato antes de gerar a receita.');
      return;
    }
    if (title.trim().length < 3) {
      setFormError('Informe um título com pelo menos 3 caracteres.');
      return;
    }

    setFormError('');
    setGenerating(true);

    try {
      const response = await fetch('/api/ai/generate-recipe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          imageBase64,
          variation: nextVariation,
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.recipe) {
        throw new Error(data.error || 'Falha ao gerar receita com IA.');
      }

      setDraft(data.recipe as GeneratedRecipeDraft);
      setVariation(nextVariation);
      toast.success(
        nextVariation === 0
          ? 'Receita gerada! Confira a pré-visualização abaixo antes de salvar.'
          : 'Nova versão da receita gerada com sucesso!'
      );
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : 'Erro ao consultar serviço de IA.';
      setFormError(msg);
      toast.error(msg);
    } finally {
      setGenerating(false);
    }
  };

  const handleSaveRecipe = async () => {
    if (!draft || !imageBase64) return;
    setSaving(true);
    try {
      await createRecipe({
        title: draft.title,
        description: draft.description,
        category: draft.category,
        imageUrl: imageBase64,
        prepInfo: draft.prepInfo,
        ingredients: draft.ingredients,
        instructions: draft.instructions,
      });
      toast.success('Receita salva no banco de dados com sucesso!');
      router.push('/dashboard');
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : 'Erro ao salvar receita.';
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <AuthGuard>
      <div className="min-h-screen bg-[var(--mr-surface-default)]">
        <AppHeader />

        <main className="mx-auto max-w-mr-content px-4 py-8">
          <div className="mb-6">
            <Link
              href="/dashboard"
              className="inline-flex min-h-[40px] items-center gap-2 text-[14px] font-bold text-[var(--mr-terracotta-hover)] hover:underline"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar ao painel
            </Link>
            <h1 className="mr-display-h1 mt-2">Criar Receita com IA</h1>
            <p className="mt-1 text-[15px] leading-[22px] text-[var(--mr-text-secondary)]">
              Envie a foto do prato e o título. A inteligência artificial irá
              estruturar os ingredientes, informações de preparo e o passo a
              passo para você revisar nesta mesma tela.
            </p>
          </div>

          {/* Card de Entrada (Foto + Título) */}
          <section
            aria-label="Envio de foto e título"
            className="rounded-mr-xl border border-[var(--mr-border-default)] bg-white p-6 shadow-mr-sm md:p-8"
          >
            {formError && (
              <div
                role="alert"
                className="mb-5 rounded-mr-md border border-[var(--mr-error-border)] bg-[var(--mr-error-bg)] px-4 py-3 text-[14px] font-semibold text-[var(--mr-error-text)]"
              >
                {formError}
              </div>
            )}

            <div className="space-y-6">
              {/* Área de Upload de Foto */}
              <div>
                <span className="mb-2 block text-[14px] font-semibold text-[var(--mr-text-control)]">
                  Foto do prato
                </span>

                <input
                  ref={fileInputRef}
                  id="recipe-photo-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="sr-only"
                />

                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => fileInputRef.current?.click()}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      fileInputRef.current?.click();
                    }
                  }}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                  className={`group relative flex cursor-pointer flex-col items-center justify-center overflow-hidden rounded-mr-lg border-2 border-dashed transition-colors ${
                    isDragging
                      ? 'border-[var(--mr-terracotta)] bg-[var(--mr-info-bg)]'
                      : 'border-[var(--mr-border-warm)] bg-[var(--mr-surface-cream)] hover:border-[var(--mr-terracotta-hover)]'
                  }`}
                >
                  {imageBase64 ? (
                    <div className="relative aspect-[16/9] w-full">
                      <img
                        src={imageBase64}
                        alt={title || 'Prévia da foto enviada'}
                        className="h-full w-full object-cover"
                      />
                      <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-3 bg-gradient-to-t from-black/80 via-black/45 to-transparent p-4 text-white">
                        <span className="truncate text-[13px] font-semibold">
                          {imageName || 'Foto selecionada'}
                        </span>
                        <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-white px-3.5 py-1.5 text-[12px] font-bold text-[var(--mr-text-primary)] shadow-mr-sm">
                          <Upload className="h-3.5 w-3.5" />
                          Trocar foto
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center px-6 py-12 text-center">
                      <span className="mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-white text-[var(--mr-terracotta)] shadow-mr-sm">
                        <ImagePlus className="h-8 w-8" />
                      </span>
                      <p className="text-[16px] font-bold text-[var(--mr-text-primary)]">
                        Clique para selecionar ou arraste a foto do prato
                      </p>
                      <p className="mt-1 text-[13px] text-[var(--mr-text-secondary)]">
                        Formatos JPG, PNG ou WebP — otimizada automaticamente
                        para envio rápido
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Input Título */}
              <div>
                <label
                  htmlFor="recipe-title-input"
                  className="mb-1.5 block text-[14px] font-semibold text-[var(--mr-text-control)]"
                >
                  Título da receita
                </label>
                <input
                  id="recipe-title-input"
                  type="text"
                  className="mr-input"
                  placeholder="Ex.: Frango Assado com Batatas Rústicas e Alecrim"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  disabled={generating || saving}
                />
              </div>

              {/* Botão Gerar Receita com IA */}
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => void requestGeneration(0)}
                  className="mr-btn-primary w-full sm:w-auto"
                  disabled={generating || saving}
                >
                  {generating ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Gerando receita...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      Gerar Receita com IA
                    </>
                  )}
                </button>
              </div>
            </div>
          </section>

          {/* Área de Pré-visualização na Mesma Tela */}
          {generating && (
            <section className="mt-8" aria-label="Carregando pré-visualização">
              <RecipePreviewSkeleton />
            </section>
          )}

          {!generating && draft && (
            <section
              aria-label="Pré-visualização da receita gerada"
              className="mt-8 rounded-mr-xl border border-[var(--mr-border-default)] bg-white p-6 shadow-mr-card md:p-8"
            >
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--mr-border-subtle)] pb-4">
                <div className="flex items-center gap-2.5">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--mr-surface-cream)] px-3 py-1 text-[12px] font-bold uppercase tracking-[0.04em] text-[var(--mr-terracotta-hover)]">
                    <Sparkles className="h-3.5 w-3.5" />
                    Pré-visualização da Receita
                  </span>
                  <CategoryBadge category={draft.category} />
                </div>
              </div>

              <div className="mt-5">
                <h2 className="mr-section-title">{draft.title}</h2>
                <p className="mt-2 text-[16px] leading-[24px] text-[var(--mr-text-secondary)]">
                  {draft.description}
                </p>
              </div>

              {/* Informações de Preparo */}
              <div className="mt-6 grid grid-cols-1 gap-3 rounded-mr-lg bg-[var(--mr-surface-cream)] p-4 sm:grid-cols-3">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--mr-brand-orange-aa)] text-white">
                    <Clock className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-[12px] font-bold uppercase text-[var(--mr-text-muted)]">
                      Preparo
                    </p>
                    <p className="text-[15px] font-bold text-[var(--mr-text-primary)]">
                      {draft.prepInfo.prepTime}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--mr-brand-orange-aa)] text-white">
                    <Users className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-[12px] font-bold uppercase text-[var(--mr-text-muted)]">
                      Rendimento
                    </p>
                    <p className="text-[15px] font-bold text-[var(--mr-text-primary)]">
                      {draft.prepInfo.servings}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--mr-brand-orange-aa)] text-white">
                    <Flame className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-[12px] font-bold uppercase text-[var(--mr-text-muted)]">
                      Dificuldade
                    </p>
                    <p className="text-[15px] font-bold text-[var(--mr-text-primary)]">
                      {draft.prepInfo.difficulty ?? 'Fácil'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Lista de Ingredientes & Modo de Preparo */}
              <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-12">
                <div className="lg:col-span-5">
                  <h3 className="mr-editorial-h2 mb-4">Ingredientes</h3>
                  <ul className="space-y-2.5 text-[16px] leading-[24px] text-[var(--mr-text-secondary)]">
                    {draft.ingredients.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2.5">
                        <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-[var(--mr-terracotta)]" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="lg:col-span-7">
                  <h3 className="mr-editorial-h3 mb-4">Modo de preparo</h3>
                  <ol className="space-y-4 text-[16px] leading-[24px] text-[var(--mr-text-secondary)]">
                    {draft.instructions.map((step, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--mr-terracotta-hover)] text-[13px] font-bold text-white">
                          {idx + 1}
                        </span>
                        <span className="pt-0.5">{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              </div>

              {/* Ações de Confirmação */}
              <div className="mt-8 flex flex-col-reverse gap-3 border-t border-[var(--mr-border-subtle)] pt-6 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => void requestGeneration(variation + 1)}
                  className="mr-btn-secondary"
                  disabled={generating || saving}
                >
                  <RefreshCw className="h-4 w-4" />
                  Regenerar Receita
                </button>

                <button
                  type="button"
                  onClick={handleSaveRecipe}
                  className="mr-btn-primary"
                  disabled={generating || saving}
                >
                  {saving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Check className="h-4 w-4" />
                  )}
                  Salvar Receita
                </button>
              </div>
            </section>
          )}
        </main>
      </div>
    </AuthGuard>
  );
}
