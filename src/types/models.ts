export type RecipeCategory =
  | 'aves'
  | 'peixes'
  | 'suina'
  | 'bovinos'
  | 'cordeiro'
  | 'frios'
  | 'vegetal'
  | 'doces'
  | 'paes';

export type RecipeDifficulty = 'Fácil' | 'Médio' | 'Difícil';

export interface PrepInfo {
  prepTime: string;
  servings: string;
  difficulty?: RecipeDifficulty;
}

export interface Recipe {
  id: string;
  userId: string;
  title: string;
  description: string;
  category: RecipeCategory;
  imageUrl: string;
  prepInfo: PrepInfo;
  ingredients: string[];
  instructions: string[];
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

export interface GeneratedRecipeDraft {
  title: string;
  description: string;
  category: RecipeCategory;
  prepInfo: PrepInfo;
  ingredients: string[];
  instructions: string[];
}

export interface CategoryMeta {
  id: RecipeCategory;
  label: string;
  bgToken: string;
}

export const CATEGORY_META: Record<RecipeCategory, CategoryMeta> = {
  aves: { id: 'aves', label: 'Aves', bgToken: 'var(--mr-cat-aves-aa)' },
  peixes: {
    id: 'peixes',
    label: 'Peixes e Frutos do Mar',
    bgToken: 'var(--mr-cat-peixes-aa)',
  },
  suina: {
    id: 'suina',
    label: 'Carne Suína',
    bgToken: 'var(--mr-cat-suina-aa)',
  },
  bovinos: {
    id: 'bovinos',
    label: 'Bovinos',
    bgToken: 'var(--mr-cat-bovinos-aa)',
  },
  cordeiro: {
    id: 'cordeiro',
    label: 'Cordeiro',
    bgToken: 'var(--mr-cat-cordeiro-aa)',
  },
  frios: {
    id: 'frios',
    label: 'Frios e Embutidos',
    bgToken: 'var(--mr-cat-frios-aa)',
  },
  vegetal: {
    id: 'vegetal',
    label: '100% Vegetal',
    bgToken: 'var(--mr-cat-vegetal-aa)',
  },
  doces: {
    id: 'doces',
    label: 'Doces, Bolos e Sobremesas',
    bgToken: 'var(--mr-cat-doces-aa)',
  },
  paes: {
    id: 'paes',
    label: 'Pães e Massas',
    bgToken: 'var(--mr-cat-paes-aa)',
  },
};

export const RECIPE_CATEGORIES = Object.values(CATEGORY_META);
