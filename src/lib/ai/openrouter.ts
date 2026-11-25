import { z } from 'zod';
import type {
  GeneratedRecipeDraft,
  RecipeCategory,
  RecipeDifficulty,
} from '@/types/models';

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

const DEFAULT_FREE_VISION_MODELS = [
  'google/gemma-4-31b-it:free',
  'google/gemma-4-26b-a4b-it:free',
  'nvidia/nemotron-3.5-super-vl:free',
  'openrouter/free',
] as const;

const VALID_CATEGORIES = [
  'aves',
  'peixes',
  'suina',
  'bovinos',
  'cordeiro',
  'frios',
  'vegetal',
  'doces',
  'paes',
] as const;

export class OpenRouterError extends Error {
  statusCode: number;

  constructor(message: string, statusCode = 502) {
    super(message);
    this.name = 'OpenRouterError';
    this.statusCode = statusCode;
  }
}

const generatedRecipeSchema = z.object({
  title: z.string().trim().min(3),
  description: z.string().trim().min(3),
  category: z.enum(VALID_CATEGORIES),
  prepInfo: z.object({
    prepTime: z.string().trim().min(1),
    servings: z.string().trim().min(1),
    difficulty: z.enum(['Fácil', 'Médio', 'Difícil']),
  }),
  ingredients: z.array(z.string().trim().min(1)).min(2),
  instructions: z.array(z.string().trim().min(1)).min(2),
});

function inferCategory(title: string): RecipeCategory {
  const lower = title.toLowerCase();

  if (/(frango|sobrecoxa|peito|peru|chester|ave|galinha)/.test(lower)) {
    return 'aves';
  }
  if (/(peixe|salm[aã]o|til[aá]pia|camar[aã]o|atum|bacalhau|mar|polvo)/.test(lower)) {
    return 'peixes';
  }
  if (/(porco|su[ií]n|lombo|pernil|costelinha|bisteca|bacon|pancetta)/.test(lower)) {
    return 'suina';
  }
  if (/(cordeiro|carneiro|paleta de cordeiro)/.test(lower)) {
    return 'cordeiro';
  }
  if (/(lingui[cç]a|salsicha|presunto|salame|mortadela|calabresa|embutido)/.test(lower)) {
    return 'frios';
  }
  if (/(vegan|vegetal|legume|salada|cogumelo|tofu|gr[aã]o|abobrinha|berinjela)/.test(lower)) {
    return 'vegetal';
  }
  if (/(bolo|doce|torta doce|pudim|mousse|chocolate|sobremesa|brigadeiro|cookie)/.test(lower)) {
    return 'doces';
  }
  if (/(p[aã]o|massa|macarr[aã]o|lasanha|nhoque|pizza|focaccia|espaguete|risoto)/.test(lower)) {
    return 'paes';
  }
  if (/(carne|bife|picanha|alcatra|costela|maminha|fil[eé]|churrasco|hamb[uú]rguer)/.test(lower)) {
    return 'bovinos';
  }

  return 'aves';
}

function stripAccents(value: string): string {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function normalizeCategory(
  rawCategory: unknown,
  fallbackTitle: string
): RecipeCategory {
  if (typeof rawCategory !== 'string') {
    return inferCategory(fallbackTitle);
  }

  const normalized = stripAccents(rawCategory.trim().toLowerCase());
  if ((VALID_CATEGORIES as readonly string[]).includes(normalized)) {
    return normalized as RecipeCategory;
  }

  if (/(ave|frango|peru|chester|galinha)/.test(normalized)) return 'aves';
  if (/(peixe|frutos do mar|salmao|camarao|bacalhau)/.test(normalized)) return 'peixes';
  if (/(suin|porco|lombo|pernil|bacon)/.test(normalized)) return 'suina';
  if (/(bovin|carne vermelha|boi|picanha|alcatra)/.test(normalized)) return 'bovinos';
  if (/(cordeiro|carneiro)/.test(normalized)) return 'cordeiro';
  if (/(frio|embutido|linguica|salsicha|calabresa)/.test(normalized)) return 'frios';
  if (/(vegetal|vegano|vegetariano|salada|legume)/.test(normalized)) return 'vegetal';
  if (/(doce|bolo|sobremesa|torta|pudim)/.test(normalized)) return 'doces';
  if (/(pao|paes|massa|pizza|macarrao)/.test(normalized)) return 'paes';

  return inferCategory(fallbackTitle);
}

function normalizeDifficulty(rawDifficulty: unknown): RecipeDifficulty {
  if (typeof rawDifficulty !== 'string') {
    return 'Médio';
  }

  const normalized = stripAccents(rawDifficulty.trim().toLowerCase());
  if (normalized.includes('facil')) return 'Fácil';
  if (normalized.includes('dificil')) return 'Difícil';
  if (normalized.includes('medi')) return 'Médio';
  return 'Médio';
}

function cleanStepText(step: string): string {
  return step.replace(/^(?:passo\s*)?\d+\s*[\.\)\-:]\s*/i, '').trim();
}

function extractMessageText(content: unknown): string {
  if (typeof content === 'string') {
    return content;
  }

  if (Array.isArray(content)) {
    return content
      .map((part) => {
        if (typeof part === 'string') return part;
        if (
          part &&
          typeof part === 'object' &&
          'text' in part &&
          typeof (part as { text?: unknown }).text === 'string'
        ) {
          return (part as { text: string }).text;
        }
        return '';
      })
      .join('\n')
      .trim();
  }

  return '';
}

function parseJsonFromResponse(rawText: string): Record<string, unknown> {
  const trimmed = rawText.trim();
  const withoutFence = trimmed
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();

  const firstBrace = withoutFence.indexOf('{');
  const lastBrace = withoutFence.lastIndexOf('}');
  if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) {
    throw new Error('Resposta da IA não contém um objeto JSON válido.');
  }

  const jsonSlice = withoutFence.slice(firstBrace, lastBrace + 1);
  const parsed: unknown = JSON.parse(jsonSlice);
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new Error('Estrutura JSON retornada pela IA é inválida.');
  }

  return parsed as Record<string, unknown>;
}

function normalizeDraft(
  raw: Record<string, unknown>,
  suggestedTitle: string
): GeneratedRecipeDraft {
  const rawTitle =
    typeof raw.title === 'string' && raw.title.trim().length >= 3
      ? raw.title.trim()
      : suggestedTitle.trim();

  const rawDescription =
    typeof raw.description === 'string' && raw.description.trim().length >= 3
      ? raw.description.trim()
      : `Receita completa de ${rawTitle}, elaborada para destacar sabor, aroma e apresentação.`;

  const rawPrepInfo =
    raw.prepInfo && typeof raw.prepInfo === 'object' && !Array.isArray(raw.prepInfo)
      ? (raw.prepInfo as Record<string, unknown>)
      : {};

  const prepTime =
    typeof rawPrepInfo.prepTime === 'string' && rawPrepInfo.prepTime.trim()
      ? rawPrepInfo.prepTime.trim()
      : '45 min';

  const servings =
    typeof rawPrepInfo.servings === 'string' && rawPrepInfo.servings.trim()
      ? rawPrepInfo.servings.trim()
      : '4 porções';

  const rawIngredients = Array.isArray(raw.ingredients)
    ? raw.ingredients
        .filter((item): item is string => typeof item === 'string')
        .map((item) => item.trim())
        .filter(Boolean)
    : [];

  const rawInstructions = Array.isArray(raw.instructions)
    ? raw.instructions
        .filter((step): step is string => typeof step === 'string')
        .map(cleanStepText)
        .filter(Boolean)
    : [];

  const candidate = {
    title: rawTitle,
    description: rawDescription,
    category: normalizeCategory(raw.category, rawTitle),
    prepInfo: {
      prepTime,
      servings,
      difficulty: normalizeDifficulty(rawPrepInfo.difficulty),
    },
    ingredients: rawIngredients,
    instructions: rawInstructions,
  };

  return generatedRecipeSchema.parse(candidate);
}

function getCandidateModels(): string[] {
  const customModel = (
    process.env.NEXT_OPEN_ROUTER_MODEL ||
    process.env.OPENROUTER_MODEL ||
    ''
  ).trim();

  const models = customModel
    ? [customModel, ...DEFAULT_FREE_VISION_MODELS]
    : [...DEFAULT_FREE_VISION_MODELS];

  return Array.from(new Set(models));
}

function getOpenRouterApiKey(): string {
  const apiKey = (
    process.env.NEXT_OPEN_ROUTER_API ||
    process.env.OPENROUTER_API_KEY ||
    ''
  ).trim();

  if (!apiKey) {
    throw new OpenRouterError(
      'Chave da OpenRouter não configurada no servidor (.env.local).',
      500
    );
  }

  return apiKey;
}

interface CallModelParams {
  apiKey: string;
  model: string;
  title: string;
  imageBase64: string;
  variation: number;
  useJsonResponseFormat: boolean;
}

async function callOpenRouterModel({
  apiKey,
  model,
  title,
  imageBase64,
  variation,
  useJsonResponseFormat,
}: CallModelParams): Promise<{
  ok: boolean;
  status: number;
  errorText: string;
  draft?: GeneratedRecipeDraft;
}> {
  const systemPrompt = [
    'Você é um chef brasileiro especialista e editor gastronômico.',
    'Analise o título sugerido e a imagem do prato enviada pelo usuário e crie uma receita completa, prática, saborosa e coerente em português do Brasil (PT-BR).',
    'Responda EXCLUSIVAMENTE com um objeto JSON válido (sem markdown, sem cercas ``` e sem texto fora do JSON) seguindo exatamente este formato:',
    '{',
    '  "title": "string (título final refinado ou fiel ao sugerido)",',
    '  "description": "string (1 a 2 frases apetitosas descrevendo o prato)",',
    '  "category": "aves | peixes | suina | bovinos | cordeiro | frios | vegetal | doces | paes",',
    '  "prepInfo": {',
    '    "prepTime": "string (ex: 45 min)",',
    '    "servings": "string (ex: 4 porções)",',
    '    "difficulty": "Fácil | Médio | Difícil"',
    '  },',
    '  "ingredients": ["string com quantidade e unidade em PT-BR (mínimo 5 itens)"],',
    '  "instructions": ["string com passo claro e direto sem numeração no início (mínimo 4 passos)"]',
    '}',
  ].join('\n');

  const userTextParts = [
    `Título sugerido pelo usuário: "${title.trim()}".`,
    'Observe a imagem enviada para identificar ingredientes visíveis, tipo de preparo, molho e apresentação, mantendo total coerência com o título.',
  ];

  if (variation > 0) {
    userTextParts.push(
      `Esta é a variação #${variation}: proponha uma abordagem criativa diferente (como novos temperos, técnica de cocção ou acompanhamento) mantendo o prato fiel ao título e à foto.`
    );
  }

  const userContent: Array<
    | { type: 'text'; text: string }
    | { type: 'image_url'; image_url: { url: string } }
  > = [{ type: 'text', text: userTextParts.join(' ') }];

  if (
    imageBase64.startsWith('data:image/') ||
    imageBase64.startsWith('https://')
  ) {
    userContent.push({
      type: 'image_url',
      image_url: { url: imageBase64 },
    });
  }

  const body: Record<string, unknown> = {
    model,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userContent },
    ],
    temperature: variation === 0 ? 0.45 : Math.min(0.9, 0.6 + variation * 0.08),
    max_tokens: 2500,
  };

  if (useJsonResponseFormat) {
    body.response_format = { type: 'json_object' };
  }

  const referer = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  const response = await fetch(OPENROUTER_API_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': referer,
      'X-Title': 'Minha Receita IA',
    },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(35000),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => '');
    return {
      ok: false,
      status: response.status,
      errorText,
    };
  }

  const payload = (await response.json()) as {
    choices?: Array<{
      message?: {
        content?: unknown;
      };
    }>;
  };

  const rawContent = extractMessageText(payload.choices?.[0]?.message?.content);
  if (!rawContent) {
    return {
      ok: false,
      status: 502,
      errorText: 'Modelo retornou resposta vazia.',
    };
  }

  const parsedJson = parseJsonFromResponse(rawContent);
  const draft = normalizeDraft(parsedJson, title);

  return {
    ok: true,
    status: 200,
    errorText: '',
    draft,
  };
}

export interface GenerateRecipeParams {
  title: string;
  imageBase64: string;
  variation?: number;
}

export async function generateRecipeWithOpenRouter({
  title,
  imageBase64,
  variation = 0,
}: GenerateRecipeParams): Promise<{ recipe: GeneratedRecipeDraft; model: string }> {
  const apiKey = getOpenRouterApiKey();
  const models = getCandidateModels();

  let lastStatus = 502;
  let lastReason = 'Nenhum modelo conseguiu gerar uma receita válida.';

  for (const model of models) {
    try {
      let attempt = await callOpenRouterModel({
        apiKey,
        model,
        title,
        imageBase64,
        variation,
        useJsonResponseFormat: true,
      });

      if (attempt.status === 401) {
        throw new OpenRouterError(
          'Chave da OpenRouter inválida ou não autorizada.',
          502
        );
      }

      if (
        !attempt.ok &&
        attempt.status === 400 &&
        /response_format|json_object|structured/i.test(attempt.errorText)
      ) {
        attempt = await callOpenRouterModel({
          apiKey,
          model,
          title,
          imageBase64,
          variation,
          useJsonResponseFormat: false,
        });
      }

      if (attempt.ok && attempt.draft) {
        return { recipe: attempt.draft, model };
      }

      lastStatus = attempt.status;
      lastReason = attempt.errorText || `HTTP ${attempt.status}`;
    } catch (err) {
      if (err instanceof OpenRouterError) {
        throw err;
      }
      lastStatus = 504;
      lastReason =
        err instanceof Error ? err.message : 'Falha na comunicação com OpenRouter.';
    }
  }

  if (lastStatus === 429) {
    throw new OpenRouterError(
      'Limite temporário de requisições da OpenRouter atingido. Aguarde alguns segundos e tente novamente.',
      429
    );
  }

  if (lastStatus === 404 && /data policy/i.test(lastReason)) {
    throw new OpenRouterError(
      'A conta OpenRouter bloqueou os modelos gratuitos pela política de privacidade (Data Policy). Habilite modelos gratuitos em openrouter.ai/settings/privacy ou defina NEXT_OPEN_ROUTER_MODEL.',
      503
    );
  }

  throw new OpenRouterError(
    'Não foi possível gerar a receita com a IA no momento. Tente novamente em instantes.',
    503
  );
}
