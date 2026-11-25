'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ChefHat, KeyRound, Loader2, Lock } from 'lucide-react';
import { useToast } from '@/components/ui/ToastProvider';
import { createClient } from '@/lib/supabase/client';

export default function ResetPasswordPage() {
  const router = useRouter();
  const toast = useToast();

  const [checkingSession, setCheckingSession] = useState(true);
  const [hasSession, setHasSession] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let active = true;
    const supabase = createClient();

    void supabase.auth.getUser().then(({ data, error }) => {
      if (!active) return;
      setHasSession(!error && Boolean(data.user));
      setCheckingSession(false);
    });

    return () => {
      active = false;
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword.trim().length < 6) {
      setErrorMsg('A nova senha deve ter pelo menos 6 caracteres.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMsg('A confirmação da nova senha não confere.');
      return;
    }

    setErrorMsg('');
    setSubmitting(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });
      if (error) {
        throw new Error(error.message);
      }
      toast.success('Senha redefinida com sucesso!');
      router.replace('/dashboard');
    } catch (err) {
      const msg =
        err instanceof Error
          ? err.message
          : 'Não foi possível redefinir a senha.';
      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--mr-surface-cream)]">
      <div className="h-2 w-full bg-[var(--mr-brand-orange)]" />

      <main className="mx-auto flex min-h-[calc(100vh-8px)] max-w-mr-prose flex-col items-center justify-center px-4 py-10">
        <div className="w-full max-w-[480px] rounded-mr-xl border border-[var(--mr-border-default)] bg-white p-6 shadow-mr-card sm:p-8">
          <div className="mb-6 flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--mr-brand-orange-aa)] text-white shadow-mr-sm">
              <ChefHat className="h-6 w-6" />
            </span>
            <div>
              <p className="text-[16px] font-bold text-[var(--mr-text-primary)]">
                Minha Receita IA
              </p>
              <p className="text-[12px] font-semibold uppercase tracking-[0.06em] text-[var(--mr-text-muted)]">
                Redefinição de senha
              </p>
            </div>
          </div>

          {checkingSession ? (
            <div className="flex items-center justify-center gap-2 py-8 text-[14px] font-semibold text-[var(--mr-text-secondary)]">
              <Loader2 className="h-5 w-5 animate-spin text-[var(--mr-terracotta)]" />
              Validando sessão de recuperação...
            </div>
          ) : !hasSession ? (
            <div className="space-y-4">
              <div
                role="alert"
                className="rounded-mr-md border border-[var(--mr-error-border)] bg-[var(--mr-error-bg)] px-4 py-3 text-[14px] font-semibold text-[var(--mr-error-text)]"
              >
                O link de recuperação expirou ou é inválido. Solicite uma nova
                redefinição de senha na tela de login.
              </div>
              <Link href="/" className="mr-btn-secondary w-full">
                <ArrowLeft className="h-4 w-4" />
                Voltar ao login
              </Link>
            </div>
          ) : (
            <>
              <h1 className="mr-display-h1">Nova senha</h1>
              <p className="mt-2 text-[15px] leading-[22px] text-[var(--mr-text-secondary)]">
                Escolha uma nova senha com pelo menos 6 caracteres para acessar
                sua conta.
              </p>

              <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
                {errorMsg && (
                  <div
                    role="alert"
                    className="rounded-mr-md border border-[var(--mr-error-border)] bg-[var(--mr-error-bg)] px-4 py-3 text-[14px] font-semibold text-[var(--mr-error-text)]"
                  >
                    {errorMsg}
                  </div>
                )}

                <div>
                  <label
                    htmlFor="reset-new-password"
                    className="mb-1.5 block text-[14px] font-semibold text-[var(--mr-text-control)]"
                  >
                    Nova senha
                  </label>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-[var(--mr-text-muted)]" />
                    <input
                      id="reset-new-password"
                      type="password"
                      autoComplete="new-password"
                      className="mr-input pl-11"
                      placeholder="Mínimo de 6 caracteres"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      disabled={submitting}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="reset-confirm-password"
                    className="mb-1.5 block text-[14px] font-semibold text-[var(--mr-text-control)]"
                  >
                    Confirmar nova senha
                  </label>
                  <div className="relative">
                    <KeyRound className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-[var(--mr-text-muted)]" />
                    <input
                      id="reset-confirm-password"
                      type="password"
                      autoComplete="new-password"
                      className="mr-input pl-11"
                      placeholder="Repita a nova senha"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      disabled={submitting}
                      required
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="mr-btn-primary w-full"
                    disabled={submitting}
                  >
                    {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                    Salvar nova senha
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
