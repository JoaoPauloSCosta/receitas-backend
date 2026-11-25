import { createClient } from '@/lib/supabase/client';
import type { User } from '@/types/models';
import type { User as SupabaseAuthUser } from '@supabase/supabase-js';

function deriveNameFromEmail(email: string): string {
  const prefix = email.split('@')[0] || 'Chef';
  const cleaned = prefix.replace(/[._-]+/g, ' ').trim();
  if (!cleaned) return 'Chef Minha Receita';
  return cleaned
    .split(' ')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(' ');
}

function mapAuthError(message: string): string {
  const lower = message.toLowerCase();

  if (lower.includes('invalid login credentials')) {
    return 'E-mail ou senha incorretos.';
  }
  if (lower.includes('email not confirmed')) {
    return 'Confirme seu e-mail antes de entrar. Verifique sua caixa de entrada.';
  }
  if (lower.includes('user already registered')) {
    return 'Este e-mail já está cadastrado.';
  }
  if (lower.includes('password should be at least')) {
    return 'A senha deve ter pelo menos 6 caracteres.';
  }
  if (
    lower.includes('rate limit') ||
    lower.includes('too many requests') ||
    lower.includes('for security purposes')
  ) {
    return 'Muitas tentativas em sequência. Aguarde alguns instantes e tente novamente.';
  }
  if (lower.includes('unable to validate email address')) {
    return 'Informe um e-mail válido.';
  }
  return message;
}

function buildFallbackUser(authUser: SupabaseAuthUser): User {
  const email = (authUser.email ?? '').toLowerCase();
  const metadataName =
    typeof authUser.user_metadata?.name === 'string'
      ? authUser.user_metadata.name.trim()
      : '';

  return {
    id: authUser.id,
    name: metadataName || deriveNameFromEmail(email),
    email,
    createdAt: authUser.created_at ?? new Date().toISOString(),
  };
}

export async function getCurrentUser(): Promise<User | null> {
  const supabase = createClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) {
    return null;
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, name, email, created_at')
    .eq('id', data.user.id)
    .maybeSingle();

  if (profile) {
    return {
      id: profile.id,
      name: profile.name,
      email: profile.email,
      createdAt: profile.created_at,
    };
  }

  return buildFallbackUser(data.user);
}

export function onAuthStateChange(
  callback: (user: User | null) => void
): () => void {
  const supabase = createClient();
  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange((_event, session) => {
    if (!session?.user) {
      callback(null);
      return;
    }

    void getCurrentUser()
      .then((user) => callback(user))
      .catch(() => callback(buildFallbackUser(session.user)));
  });

  return () => {
    subscription.unsubscribe();
  };
}

export async function signIn(email: string, password: string): Promise<User> {
  const normalizedEmail = email.trim().toLowerCase();
  if (!normalizedEmail || !normalizedEmail.includes('@')) {
    throw new Error('Informe um e-mail válido.');
  }
  if (password.trim().length < 6) {
    throw new Error('A senha deve ter pelo menos 6 caracteres.');
  }

  const supabase = createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email: normalizedEmail,
    password,
  });

  if (error || !data.user) {
    throw new Error(
      error ? mapAuthError(error.message) : 'Não foi possível entrar.'
    );
  }

  return (await getCurrentUser()) ?? buildFallbackUser(data.user);
}

export interface SignUpResult {
  user: User;
  needsEmailConfirmation: boolean;
}

export async function signUp(
  email: string,
  password: string,
  name?: string
): Promise<SignUpResult> {
  if (name !== undefined && name.trim().length < 2) {
    throw new Error('Informe seu nome com pelo menos 2 caracteres.');
  }

  const normalizedEmail = email.trim().toLowerCase();
  if (!normalizedEmail || !normalizedEmail.includes('@')) {
    throw new Error('Informe um e-mail válido para criar sua conta.');
  }
  if (password.trim().length < 6) {
    throw new Error('A senha deve ter pelo menos 6 caracteres.');
  }

  const resolvedName =
    name !== undefined ? name.trim() : deriveNameFromEmail(normalizedEmail);
  const supabase = createClient();

  const emailRedirectTo =
    typeof window !== 'undefined'
      ? `${window.location.origin}/auth/callback`
      : undefined;

  const { data, error } = await supabase.auth.signUp({
    email: normalizedEmail,
    password,
    options: {
      data: { name: resolvedName },
      emailRedirectTo,
    },
  });

  if (error || !data.user) {
    throw new Error(
      error ? mapAuthError(error.message) : 'Não foi possível criar sua conta.'
    );
  }

  const needsEmailConfirmation = !data.session;
  const user = needsEmailConfirmation
    ? buildFallbackUser(data.user)
    : (await getCurrentUser()) ?? buildFallbackUser(data.user);

  return { user, needsEmailConfirmation };
}

export async function signOut(): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.auth.signOut();
  if (error) {
    throw new Error(mapAuthError(error.message));
  }
}

export async function requestPasswordReset(email: string): Promise<void> {
  const normalizedEmail = email.trim().toLowerCase();
  if (!normalizedEmail || !normalizedEmail.includes('@')) {
    throw new Error('Informe um e-mail válido para recuperação.');
  }

  const supabase = createClient();
  const redirectTo =
    typeof window !== 'undefined'
      ? `${window.location.origin}/auth/callback?next=/reset-password`
      : undefined;

  const { error } = await supabase.auth.resetPasswordForEmail(normalizedEmail, {
    redirectTo,
  });

  if (error) {
    throw new Error(mapAuthError(error.message));
  }
}

export async function updatePassword(
  currentPassword: string,
  newPassword: string
): Promise<void> {
  if (currentPassword.trim().length < 6) {
    throw new Error('Informe a senha atual com pelo menos 6 caracteres.');
  }
  if (newPassword.trim().length < 6) {
    throw new Error('A nova senha deve ter pelo menos 6 caracteres.');
  }

  const supabase = createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user?.email) {
    throw new Error('Sessão expirada. Faça login novamente.');
  }

  const { error: verifyError } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: currentPassword,
  });

  if (verifyError) {
    throw new Error('A senha atual informada não confere.');
  }

  const { error: updateError } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (updateError) {
    throw new Error(mapAuthError(updateError.message));
  }
}
