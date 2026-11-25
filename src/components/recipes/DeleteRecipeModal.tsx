'use client';

import React, { useState } from 'react';
import { Loader2, Trash2 } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/ToastProvider';
import { deleteRecipe } from '@/services/recipeService';
import type { Recipe } from '@/types/models';

interface DeleteRecipeModalProps {
  recipe: Recipe | null;
  isOpen: boolean;
  onClose: () => void;
  onDeleted: (deletedId: string) => void;
}

export function DeleteRecipeModal({
  recipe,
  isOpen,
  onClose,
  onDeleted,
}: DeleteRecipeModalProps) {
  const toast = useToast();
  const [deleting, setDeleting] = useState(false);

  const handleConfirmDelete = async () => {
    if (!recipe) return;
    setDeleting(true);
    try {
      await deleteRecipe(recipe.id);
      toast.success(`Receita "${recipe.title}" excluída com sucesso.`);
      onDeleted(recipe.id);
      onClose();
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : 'Erro ao excluir receita.';
      toast.error(msg);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Excluir receita"
      description="Esta ação removerá permanentemente a receita do seu painel."
      size="sm"
    >
      <div className="space-y-5">
        <div className="rounded-mr-md border border-[var(--mr-error-border)] bg-[var(--mr-error-bg)] p-4 text-[14px] leading-[20px] text-[var(--mr-error-text)]">
          Tem certeza que deseja excluir{' '}
          <strong className="font-bold">
            {recipe?.title ?? 'esta receita'}
          </strong>
          ?
        </div>

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className="mr-btn-secondary"
            disabled={deleting}
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleConfirmDelete}
            className="mr-btn-danger"
            disabled={deleting}
          >
            {deleting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
            Confirmar exclusão
          </button>
        </div>
      </div>
    </Modal>
  );
}
