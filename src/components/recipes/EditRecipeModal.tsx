'use client';

import React, { useEffect, useState } from 'react';
import { Loader2, Plus, Trash2 } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/ToastProvider';
import { updateRecipe } from '@/services/recipeService';
import {
  RECIPE_CATEGORIES,
  type Recipe,
  type RecipeCategory,
  type RecipeDifficulty,
} from '@/types/models';

interface EditRecipeModalProps {
  recipe: Recipe | null;
  isOpen: boolean;
  onClose: () => void;
  onSaved: (updated: Recipe) => void;
}

export function EditRecipeModal({
  recipe,
  isOpen,
  onClose,
  onSaved,
}: EditRecipeModalProps) {
  const toast = useToast();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<RecipeCategory>('aves');
  const [prepTime, setPrepTime] = useState('');
  const [servings, setServings] = useState('');
  const [difficulty, setDifficulty] = useState<RecipeDifficulty>('Fácil');
  const [ingredients, setIngredients] = useState<string[]>(['']);
  const [instructions, setInstructions] = useState<string[]>(['']);
  const [errorMsg, setErrorMsg] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (recipe && isOpen) {
      setTitle(recipe.title);
      setDescription(recipe.description);
      setCategory(recipe.category);
      setPrepTime(recipe.prepInfo.prepTime);
      setServings(recipe.prepInfo.servings);
      setDifficulty(recipe.prepInfo.difficulty ?? 'Fácil');
      setIngredients(recipe.ingredients.length > 0 ? [...recipe.ingredients] : ['']);
      setInstructions(recipe.instructions.length > 0 ? [...recipe.instructions] : ['']);
      setErrorMsg('');
    }
  }, [recipe, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipe) return;

    const cleanIngredients = ingredients.map((i) => i.trim()).filter(Boolean);
    const cleanInstructions = instructions.map((s) => s.trim()).filter(Boolean);

    if (title.trim().length < 3) {
      setErrorMsg('O título da receita precisa ter pelo menos 3 caracteres.');
      return;
    }
    if (cleanIngredients.length === 0) {
      setErrorMsg('Adicione pelo menos 1 ingrediente.');
      return;
    }
    if (cleanInstructions.length === 0) {
      setErrorMsg('Adicione pelo menos 1 passo no modo de preparo.');
      return;
    }

    setErrorMsg('');
    setSaving(true);
    try {
      const updated = await updateRecipe(recipe.id, {
        title,
        description,
        category,
        prepInfo: {
          prepTime,
          servings,
          difficulty,
        },
        ingredients: cleanIngredients,
        instructions: cleanInstructions,
      });
      toast.success('Receita atualizada com sucesso!');
      onSaved(updated);
      onClose();
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : 'Erro ao atualizar a receita.';
      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Editar Receita"
      description="Atualize as informações, ingredientes ou modo de preparo."
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {errorMsg && (
          <div
            role="alert"
            className="rounded-mr-md border border-[var(--mr-error-border)] bg-[var(--mr-error-bg)] px-3 py-2 text-[13px] font-semibold text-[var(--mr-error-text)]"
          >
            {errorMsg}
          </div>
        )}

        <div>
          <label
            htmlFor="edit-recipe-title"
            className="mb-1.5 block text-[14px] font-semibold text-[var(--mr-text-control)]"
          >
            Título da receita
          </label>
          <input
            id="edit-recipe-title"
            type="text"
            className="mr-input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label
              htmlFor="edit-recipe-category"
              className="mb-1.5 block text-[14px] font-semibold text-[var(--mr-text-control)]"
            >
              Categoria
            </label>
            <select
              id="edit-recipe-category"
              className="mr-input"
              value={category}
              onChange={(e) => setCategory(e.target.value as RecipeCategory)}
            >
              {RECIPE_CATEGORIES.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="edit-recipe-difficulty"
              className="mb-1.5 block text-[14px] font-semibold text-[var(--mr-text-control)]"
            >
              Dificuldade
            </label>
            <select
              id="edit-recipe-difficulty"
              className="mr-input"
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value as RecipeDifficulty)}
            >
              <option value="Fácil">Fácil</option>
              <option value="Médio">Médio</option>
              <option value="Difícil">Difícil</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label
              htmlFor="edit-recipe-time"
              className="mb-1.5 block text-[14px] font-semibold text-[var(--mr-text-control)]"
            >
              Tempo de preparo
            </label>
            <input
              id="edit-recipe-time"
              type="text"
              className="mr-input"
              placeholder="Ex.: 45 min"
              value={prepTime}
              onChange={(e) => setPrepTime(e.target.value)}
            />
          </div>

          <div>
            <label
              htmlFor="edit-recipe-servings"
              className="mb-1.5 block text-[14px] font-semibold text-[var(--mr-text-control)]"
            >
              Rendimento
            </label>
            <input
              id="edit-recipe-servings"
              type="text"
              className="mr-input"
              placeholder="Ex.: 4 porções"
              value={servings}
              onChange={(e) => setServings(e.target.value)}
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="edit-recipe-description"
            className="mb-1.5 block text-[14px] font-semibold text-[var(--mr-text-control)]"
          >
            Descrição
          </label>
          <textarea
            id="edit-recipe-description"
            rows={2}
            className="mr-input min-h-[80px] resize-y"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        {/* Ingredientes */}
        <div>
          <div className="mb-2 flex items-center justify-between">
            <span className="text-[14px] font-semibold text-[var(--mr-text-control)]">
              Ingredientes
            </span>
            <button
              type="button"
              onClick={() => setIngredients((prev) => [...prev, ''])}
              className="inline-flex min-h-[36px] items-center gap-1 rounded-full px-3 py-1 text-[13px] font-bold text-[var(--mr-terracotta-hover)] hover:bg-[var(--mr-surface-cream)]"
            >
              <Plus className="h-4 w-4" />
              Adicionar
            </button>
          </div>
          <div className="space-y-2">
            {ingredients.map((item, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <input
                  type="text"
                  className="mr-input"
                  value={item}
                  aria-label={`Ingrediente ${idx + 1}`}
                  onChange={(e) => {
                    const next = [...ingredients];
                    next[idx] = e.target.value;
                    setIngredients(next);
                  }}
                />
                {ingredients.length > 1 && (
                  <button
                    type="button"
                    aria-label={`Remover ingrediente ${idx + 1}`}
                    onClick={() =>
                      setIngredients((prev) => prev.filter((_, i) => i !== idx))
                    }
                    className="flex h-[44px] w-[44px] shrink-0 items-center justify-center rounded-mr-md border border-[var(--mr-border-default)] text-[var(--mr-error-text)] hover:bg-[var(--mr-error-bg)]"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Modo de preparo */}
        <div>
          <div className="mb-2 flex items-center justify-between">
            <span className="text-[14px] font-semibold text-[var(--mr-text-control)]">
              Modo de preparo
            </span>
            <button
              type="button"
              onClick={() => setInstructions((prev) => [...prev, ''])}
              className="inline-flex min-h-[36px] items-center gap-1 rounded-full px-3 py-1 text-[13px] font-bold text-[var(--mr-terracotta-hover)] hover:bg-[var(--mr-surface-cream)]"
            >
              <Plus className="h-4 w-4" />
              Adicionar passo
            </button>
          </div>
          <div className="space-y-2">
            {instructions.map((step, idx) => (
              <div key={idx} className="flex items-start gap-2">
                <span className="mt-2.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--mr-surface-cream)] text-[12px] font-bold text-[var(--mr-terracotta-hover)]">
                  {idx + 1}
                </span>
                <textarea
                  rows={2}
                  className="mr-input min-h-[68px] flex-1 resize-y"
                  value={step}
                  aria-label={`Passo ${idx + 1}`}
                  onChange={(e) => {
                    const next = [...instructions];
                    next[idx] = e.target.value;
                    setInstructions(next);
                  }}
                />
                {instructions.length > 1 && (
                  <button
                    type="button"
                    aria-label={`Remover passo ${idx + 1}`}
                    onClick={() =>
                      setInstructions((prev) => prev.filter((_, i) => i !== idx))
                    }
                    className="flex h-[44px] w-[44px] shrink-0 items-center justify-center rounded-mr-md border border-[var(--mr-border-default)] text-[var(--mr-error-text)] hover:bg-[var(--mr-error-bg)]"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col-reverse gap-3 border-t border-[var(--mr-border-subtle)] pt-4 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className="mr-btn-secondary"
            disabled={saving}
          >
            Cancelar
          </button>
          <button type="submit" className="mr-btn-primary" disabled={saving}>
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            Salvar alterações
          </button>
        </div>
      </form>
    </Modal>
  );
}
