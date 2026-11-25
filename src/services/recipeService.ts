import { createClient } from '@/lib/supabase/client';
import type { Database } from '@/lib/supabase/database.types';
import type {
  PrepInfo,
  Recipe,
  RecipeCategory,
  RecipeDifficulty,
} from '@/types/models';

type RecipeRow = Database['public']['Tables']['recipes']['Row'];
type RecipeInsert = Database['public']['Tables']['recipes']['Insert'];
type RecipeUpdate = Database['public']['Tables']['recipes']['Update'];

const RECIPE_IMAGES_BUCKET = 'recipe-images';
const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function mapRowToRecipe(row: RecipeRow): Recipe {
  return {
    id: row.id,
    userId: row.user_id,
    title: row.title,
    description: row.description,
    category: row.category as RecipeCategory,
    imageUrl: row.image_url,
    prepInfo: {
      prepTime: row.prep_time,
      servings: row.servings,
      difficulty: (row.difficulty as RecipeDifficulty | null) ?? undefined,
    },
    ingredients: row.ingredients ?? [],
    instructions: row.instructions ?? [],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function getExtensionFromMime(mimeType: string): string {
  switch (mimeType.toLowerCase()) {
    case 'image/png':
      return 'png';
    case 'image/webp':
      return 'webp';
    case 'image/jpeg':
    case 'image/jpg':
    default:
      return 'jpg';
  }
}

function dataUrlToBlob(dataUrl: string): { blob: Blob; mimeType: string } {
  const match = dataUrl.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/);
  if (!match) {
    throw new Error('Formato de imagem inválido para envio.');
  }

  const mimeType = match[1];
  const base64 = match[2];
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  return {
    blob: new Blob([bytes], { type: mimeType }),
    mimeType,
  };
}

async function uploadRecipeImageIfDataUrl(
  userId: string,
  imageUrl: string
): Promise<{ imageUrl: string; imagePath: string | null }> {
  if (!imageUrl.startsWith('data:image/')) {
    return { imageUrl, imagePath: null };
  }

  const supabase = createClient();
  const { blob, mimeType } = dataUrlToBlob(imageUrl);
  const ext = getExtensionFromMime(mimeType);
  const path = `${userId}/${crypto.randomUUID()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from(RECIPE_IMAGES_BUCKET)
    .upload(path, blob, {
      contentType: mimeType,
      upsert: false,
    });

  if (uploadError) {
    throw new Error(`Falha ao enviar a imagem: ${uploadError.message}`);
  }

  const { data: publicUrlData } = supabase.storage
    .from(RECIPE_IMAGES_BUCKET)
    .getPublicUrl(path);

  return {
    imageUrl: publicUrlData.publicUrl,
    imagePath: path,
  };
}

export interface CreateRecipeInput {
  title: string;
  description: string;
  category: RecipeCategory;
  imageUrl: string;
  prepInfo: PrepInfo;
  ingredients: string[];
  instructions: string[];
}

export type UpdateRecipeInput = Partial<CreateRecipeInput>;

export async function listRecipes(): Promise<Recipe[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('recipes')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Erro ao carregar receitas: ${error.message}`);
  }

  return (data ?? []).map(mapRowToRecipe);
}

export async function getRecipeById(id: string): Promise<Recipe | null> {
  if (!UUID_REGEX.test(id)) {
    return null;
  }

  const supabase = createClient();
  const { data, error } = await supabase
    .from('recipes')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) {
    throw new Error(`Erro ao carregar receita: ${error.message}`);
  }

  return data ? mapRowToRecipe(data) : null;
}

export async function createRecipe(input: CreateRecipeInput): Promise<Recipe> {
  const supabase = createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error('Sessão expirada. Faça login novamente.');
  }

  const uploaded = await uploadRecipeImageIfDataUrl(user.id, input.imageUrl);

  const payload: RecipeInsert = {
    user_id: user.id,
    title: input.title.trim(),
    description: input.description.trim(),
    category: input.category,
    image_url: uploaded.imageUrl,
    image_path: uploaded.imagePath,
    prep_time: input.prepInfo.prepTime.trim(),
    servings: input.prepInfo.servings.trim(),
    difficulty: input.prepInfo.difficulty ?? null,
    ingredients: input.ingredients.map((i) => i.trim()).filter(Boolean),
    instructions: input.instructions.map((s) => s.trim()).filter(Boolean),
  };

  const { data, error } = await supabase
    .from('recipes')
    .insert(payload)
    .select('*')
    .single();

  if (error || !data) {
    if (uploaded.imagePath) {
      await supabase.storage
        .from(RECIPE_IMAGES_BUCKET)
        .remove([uploaded.imagePath]);
    }
    throw new Error(error?.message ?? 'Erro ao salvar receita.');
  }

  return mapRowToRecipe(data);
}

export async function updateRecipe(
  id: string,
  input: UpdateRecipeInput
): Promise<Recipe> {
  if (!UUID_REGEX.test(id)) {
    throw new Error('Receita não encontrada.');
  }

  const supabase = createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error('Sessão expirada. Faça login novamente.');
  }

  const updatePayload: RecipeUpdate = {};

  if (input.title !== undefined) {
    updatePayload.title = input.title.trim();
  }
  if (input.description !== undefined) {
    updatePayload.description = input.description.trim();
  }
  if (input.category !== undefined) {
    updatePayload.category = input.category;
  }
  if (input.prepInfo !== undefined) {
    updatePayload.prep_time = input.prepInfo.prepTime.trim();
    updatePayload.servings = input.prepInfo.servings.trim();
    updatePayload.difficulty = input.prepInfo.difficulty ?? null;
  }
  if (input.ingredients !== undefined) {
    updatePayload.ingredients = input.ingredients
      .map((i) => i.trim())
      .filter(Boolean);
  }
  if (input.instructions !== undefined) {
    updatePayload.instructions = input.instructions
      .map((s) => s.trim())
      .filter(Boolean);
  }

  let oldImagePathToDelete: string | null = null;
  if (input.imageUrl !== undefined) {
    if (input.imageUrl.startsWith('data:image/')) {
      const { data: existing } = await supabase
        .from('recipes')
        .select('image_path')
        .eq('id', id)
        .maybeSingle();

      oldImagePathToDelete = existing?.image_path ?? null;

      const uploaded = await uploadRecipeImageIfDataUrl(
        user.id,
        input.imageUrl
      );
      updatePayload.image_url = uploaded.imageUrl;
      updatePayload.image_path = uploaded.imagePath;
    } else {
      updatePayload.image_url = input.imageUrl;
    }
  }

  const { data, error } = await supabase
    .from('recipes')
    .update(updatePayload)
    .eq('id', id)
    .select('*')
    .maybeSingle();

  if (error) {
    throw new Error(`Erro ao atualizar receita: ${error.message}`);
  }
  if (!data) {
    throw new Error('Receita não encontrada.');
  }

  if (oldImagePathToDelete) {
    await supabase.storage
      .from(RECIPE_IMAGES_BUCKET)
      .remove([oldImagePathToDelete]);
  }

  return mapRowToRecipe(data);
}

export async function deleteRecipe(id: string): Promise<void> {
  if (!UUID_REGEX.test(id)) {
    throw new Error('Receita não encontrada.');
  }

  const supabase = createClient();
  const { data, error } = await supabase
    .from('recipes')
    .delete()
    .eq('id', id)
    .select('image_path')
    .maybeSingle();

  if (error) {
    throw new Error(`Erro ao excluir receita: ${error.message}`);
  }

  if (data?.image_path) {
    await supabase.storage
      .from(RECIPE_IMAGES_BUCKET)
      .remove([data.image_path]);
  }
}
