import { createClient } from '@/lib/supabase/client';
import { getCurrentUser } from '@/services/authService';
import type { User } from '@/types/models';

export async function getProfile(): Promise<User | null> {
  return getCurrentUser();
}

export interface UpdateProfileResult {
  user: User;
  emailConfirmationSent: boolean;
}

export async function updateProfile(payload: {
  name: string;
  email: string;
}): Promise<UpdateProfileResult> {
  const trimmedName = payload.name.trim();
  const normalizedEmail = payload.email.trim().toLowerCase();

  if (trimmedName.length < 2) {
    throw new Error('O nome deve ter pelo menos 2 caracteres.');
  }
  if (!normalizedEmail || !normalizedEmail.includes('@')) {
    throw new Error('Informe um e-mail válido.');
  }

  const supabase = createClient();
  const {
    data: { user: authUser },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !authUser) {
    throw new Error('Sessão expirada. Faça login novamente.');
  }

  const currentEmail = (authUser.email ?? '').toLowerCase();

  const { data: updatedProfile, error: profileError } = await supabase
    .from('profiles')
    .upsert(
      {
        id: authUser.id,
        name: trimmedName,
        email: currentEmail || normalizedEmail,
      },
      { onConflict: 'id' }
    )
    .select('id, name, email, created_at')
    .single();

  if (profileError || !updatedProfile) {
    throw new Error(
      profileError?.message ?? 'Não foi possível atualizar o perfil.'
    );
  }

  const { error: metadataError } = await supabase.auth.updateUser({
    data: { name: trimmedName },
  });

  if (metadataError) {
    throw new Error(metadataError.message);
  }

  let emailConfirmationSent = false;
  if (normalizedEmail !== currentEmail) {
    const emailRedirectTo =
      typeof window !== 'undefined'
        ? `${window.location.origin}/auth/callback?next=/settings`
        : undefined;

    const { error: emailError } = await supabase.auth.updateUser(
      { email: normalizedEmail },
      { emailRedirectTo }
    );

    if (emailError) {
      throw new Error(emailError.message);
    }

    emailConfirmationSent = true;
  }

  return {
    user: {
      id: updatedProfile.id,
      name: updatedProfile.name,
      email: updatedProfile.email,
      createdAt: updatedProfile.created_at,
    },
    emailConfirmationSent,
  };
}
