import { NextResponse } from 'next/server';
import { z } from 'zod';
import {
  generateRecipeWithOpenRouter,
  OpenRouterError,
} from '@/lib/ai/openrouter';
import { createClient } from '@/lib/supabase/server';

export const maxDuration = 60;

const generateRequestSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, 'Informe um título com pelo menos 3 caracteres.')
    .max(120, 'O título pode ter no máximo 120 caracteres.'),
  imageBase64: z
    .string()
    .min(20, 'Envie uma foto válida do prato antes de gerar a receita.'),
  variation: z.number().int().min(0).max(50).optional().default(0),
});

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: claimsData, error: authError } = await supabase.auth.getClaims();

    if (authError || !claimsData?.claims) {
      return NextResponse.json(
        { error: 'Autenticação necessária para gerar receitas.' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const parsed = generateRequestSchema.safeParse(body);

    if (!parsed.success) {
      const firstIssue =
        parsed.error.issues[0]?.message ??
        'Dados inválidos para gerar receita.';
      return NextResponse.json({ error: firstIssue }, { status: 400 });
    }

    const { title, imageBase64, variation } = parsed.data;
    const { recipe, model } = await generateRecipeWithOpenRouter({
      title,
      imageBase64,
      variation,
    });

    return NextResponse.json({ recipe, model }, { status: 200 });
  } catch (err) {
    if (err instanceof OpenRouterError) {
      return NextResponse.json(
        { error: err.message },
        { status: err.statusCode }
      );
    }

    return NextResponse.json(
      { error: 'Não foi possível processar a requisição de geração com IA.' },
      { status: 500 }
    );
  }
}
