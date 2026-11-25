'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ChefHat,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  Sparkles,
  User as UserIcon,
  UserPlus,
} from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/ToastProvider';
import {
  getCurrentUser,
  requestPasswordReset,
  signIn,
  signUp,
} from '@/services/authService';

export default function AuthPage() {
  const router = useRouter();
  const toast = useToast();

  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formError, setFormError] = useState('');
  const [confirmationMessage, setConfirmationMessage] = useState('');
  const [loadingAction, setLoadingAction] = useState<'login' | 'signup' | null>(null);

  const [forgotOpen, setForgotOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetError, setResetError] = useState('');
  const [sendingReset, setSendingReset] = useState(false);

  useEffect(() => {
    let active = true;

    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('auth_error') === 'callback') {
        setFormError(
          'Não foi possível validar o link de autenticação. Tente entrar ou solicitar um novo link.'
        );
      }
    }

    void getCurrentUser().then((user) => {
      if (active && user) {
        router.replace('/dashboard');
      }
    });

    return () => {
      active = false;
    };
  }, [router]);

  const switchMode = (nextMode: 'login' | 'signup') => {
    setMode(nextMode);
    setFormError('');
    setConfirmationMessage('');
    setConfirmPassword('');
  };

  const validateLoginCredentials = (): boolean => {
    if (!email.trim() || !email.includes('@')) {
      setFormError('Informe um e-mail válido.');
      return false;
    }
    if (password.trim().length < 6) {
      setFormError('A senha deve ter pelo menos 6 caracteres.');
      return false;
    }
    setFormError('');
    setConfirmationMessage('');
    return true;
  };

  const validateSignUpCredentials = (): boolean => {
    if (name.trim().length < 2) {
      setFormError('Informe seu nome com pelo menos 2 caracteres.');
      return false;
    }
    if (!email.trim() || !email.includes('@')) {
      setFormError('Informe um e-mail válido.');
      return false;
    }
    if (password.trim().length < 6) {
      setFormError('A senha deve ter pelo menos 6 caracteres.');
      return false;
    }
    if (password !== confirmPassword) {
      setFormError('A confirmação de senha não confere.');
      return false;
    }
    setFormError('');
    setConfirmationMessage('');
    return true;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateLoginCredentials()) return;

    setLoadingAction('login');
    try {
      const user = await signIn(email, password);
      toast.success(`Bem-vindo(a), ${user.name}!`);
      router.push('/dashboard');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Não foi possível entrar.';
      setFormError(msg);
      toast.error(msg);
    } finally {
      setLoadingAction(null);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateSignUpCredentials()) return;

    setLoadingAction('signup');
    try {
      const { user, needsEmailConfirmation } = await signUp(
        email,
        password,
        name.trim()
      );
      if (needsEmailConfirmation) {
        const msg =
          'Conta criada! Enviamos um link de confirmação para o seu e-mail antes do primeiro acesso.';
        setConfirmationMessage(msg);
        setPassword('');
        setConfirmPassword('');
        toast.info(msg);
        return;
      }

      toast.success(`Conta criada com sucesso! Olá, ${user.name}.`);
      router.push('/dashboard');
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : 'Não foi possível criar sua conta.';
      setFormError(msg);
      toast.error(msg);
    } finally {
      setLoadingAction(null);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail.trim() || !resetEmail.includes('@')) {
      setResetError('Informe um e-mail válido para enviar as instruções.');
      return;
    }
    setResetError('');
    setSendingReset(true);
    try {
      await requestPasswordReset(resetEmail);
      toast.success('Instruções de recuperação enviadas para seu e-mail.');
      setForgotOpen(false);
      setResetEmail('');
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : 'Erro ao solicitar recuperação.';
      setResetError(msg);
    } finally {
      setSendingReset(false);
    }
  };

  const isBusy = loadingAction !== null;

  return (
    <div className="min-h-screen bg-[var(--mr-surface-cream)]">
      {/* Faixa superior oficial Seara */}
      <div className="h-2 w-full bg-[var(--mr-brand-orange)]" />

      <main className="mx-auto flex min-h-[calc(100vh-8px)] max-w-mr-wide flex-col items-center justify-center px-4 py-10">
        <div className="grid w-full max-w-[960px] grid-cols-1 overflow-hidden rounded-mr-xl border border-[var(--mr-border-default)] bg-white shadow-mr-card lg:grid-cols-12">
          {/* Painel editorial lateral */}
          <div className="relative flex flex-col justify-between bg-[var(--mr-brand-orange-aa)] p-8 text-white lg:col-span-5 lg:p-10">
            <div>
              <div className="mb-6 inline-flex items-center gap-3">
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-[var(--mr-terracotta-hover)] shadow-mr-sm">
                  <ChefHat className="h-7 w-7" />
                </span>
                <div>
                  <p className="text-[18px] font-bold leading-tight text-white">
                    Minha Receita
                  </p>
                  <p className="text-[12px] font-semibold uppercase tracking-[0.06em] text-white/90">
                    Estúdio Culinário IA
                  </p>
                </div>
              </div>

              <p className="text-[22px] font-bold leading-[30px] text-white">
                Transforme fotos de pratos em receitas completas em segundos.
              </p>
              <p className="mt-3 text-[15px] leading-[22px] text-white/95">
                Envie a imagem do prato, informe o título e revise ingredientes,
                rendimento e modo de preparo antes de salvar no seu catálogo.
              </p>
            </div>

            <div className="mt-8 rounded-mr-lg bg-black/20 p-4 text-[13px] leading-[19px] text-white">
              <div className="mb-1 flex items-center gap-2 font-bold">
                <Sparkles className="h-4 w-4 text-[var(--mr-yellow-light)]" />
                <span>Autenticação Segura</span>
              </div>
              <p className="text-white/95">
                Suas receitas e fotos ficam salvas com segurança na sua conta e
                disponíveis em qualquer dispositivo.
              </p>
            </div>
          </div>

          {/* Card de Autenticação */}
          <div className="p-6 sm:p-8 lg:col-span-7 lg:p-10">
            <div
              role="tablist"
              aria-label="Modo de acesso"
              className="mb-6 grid grid-cols-2 gap-1.5 rounded-full border border-[var(--mr-border-default)] bg-[var(--mr-surface-cream)] p-1"
            >
              <button
                type="button"
                role="tab"
                aria-selected={mode === 'login'}
                onClick={() => switchMode('login')}
                disabled={isBusy}
                className={`min-h-[40px] rounded-full px-4 text-[14px] font-bold transition-colors ${
                  mode === 'login'
                    ? 'bg-[var(--mr-terracotta-hover)] text-white shadow-mr-sm'
                    : 'text-[var(--mr-text-control)] hover:text-[var(--mr-text-primary)]'
                }`}
              >
                Entrar
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={mode === 'signup'}
                onClick={() => switchMode('signup')}
                disabled={isBusy}
                className={`min-h-[40px] rounded-full px-4 text-[14px] font-bold transition-colors ${
                  mode === 'signup'
                    ? 'bg-[var(--mr-terracotta-hover)] text-white shadow-mr-sm'
                    : 'text-[var(--mr-text-control)] hover:text-[var(--mr-text-primary)]'
                }`}
              >
                Criar Conta
              </button>
            </div>

            <h1 className="mr-display-h1">
              {mode === 'login' ? 'Bem-vindo(a) de volta' : 'Criar sua conta'}
            </h1>
            <p className="mt-2 text-[15px] leading-[22px] text-[var(--mr-text-secondary)]">
              {mode === 'login'
                ? 'Acesse o painel administrativo para gerenciar suas receitas com IA.'
                : 'Preencha seus dados para começar a gerar e salvar suas receitas.'}
            </p>

            <form
              onSubmit={mode === 'login' ? handleLogin : handleSignUp}
              className="mt-6 space-y-5"
              noValidate
            >
              {formError && (
                <div
                  role="alert"
                  className="rounded-mr-md border border-[var(--mr-error-border)] bg-[var(--mr-error-bg)] px-4 py-3 text-[14px] font-semibold text-[var(--mr-error-text)]"
                >
                  {formError}
                </div>
              )}

              {confirmationMessage && (
                <div
                  role="status"
                  className="rounded-mr-md border border-[var(--mr-info-border)] bg-[var(--mr-info-bg)] px-4 py-3 text-[14px] font-semibold text-[var(--mr-text-primary)]"
                >
                  {confirmationMessage}
                </div>
              )}

              {mode === 'signup' && (
                <div>
                  <label
                    htmlFor="auth-name"
                    className="mb-1.5 block text-[14px] font-semibold text-[var(--mr-text-control)]"
                  >
                    Nome completo
                  </label>
                  <div className="relative">
                    <UserIcon className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-[var(--mr-text-muted)]" />
                    <input
                      id="auth-name"
                      type="text"
                      autoComplete="name"
                      className="mr-input pl-11"
                      placeholder="Seu nome completo"
                      value={name}
                      aria-invalid={Boolean(formError && name.trim().length < 2)}
                      onChange={(e) => setName(e.target.value)}
                      disabled={isBusy}
                      required
                    />
                  </div>
                </div>
              )}

              <div>
                <label
                  htmlFor="auth-email"
                  className="mb-1.5 block text-[14px] font-semibold text-[var(--mr-text-control)]"
                >
                  E-mail
                </label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-[var(--mr-text-muted)]" />
                  <input
                    id="auth-email"
                    type="email"
                    autoComplete="email"
                    className="mr-input pl-11"
                    placeholder="seuemail@exemplo.com"
                    value={email}
                    aria-invalid={Boolean(formError && !email.includes('@'))}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isBusy}
                    required
                  />
                </div>
              </div>

              <div>
                <div className="mb-1.5 flex items-center justify-between gap-2">
                  <label
                    htmlFor="auth-password"
                    className="block text-[14px] font-semibold text-[var(--mr-text-control)]"
                  >
                    Senha
                  </label>
                  {mode === 'login' && (
                    <button
                      type="button"
                      onClick={() => {
                        setResetEmail(email);
                        setResetError('');
                        setForgotOpen(true);
                      }}
                      className="min-h-[36px] rounded-mr-xs px-1 text-[14px] font-semibold text-[var(--mr-terracotta-hover)] underline-offset-2 hover:underline"
                    >
                      Esqueci a senha
                    </button>
                  )}
                </div>

                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-[var(--mr-text-muted)]" />
                  <input
                    id="auth-password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete={
                      mode === 'login' ? 'current-password' : 'new-password'
                    }
                    className="mr-input pl-11 pr-12"
                    placeholder="Mínimo de 6 caracteres"
                    value={password}
                    aria-invalid={Boolean(formError && password.length < 6)}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isBusy}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                    className="absolute right-1 top-1/2 flex h-[40px] w-[40px] -translate-y-1/2 items-center justify-center rounded-mr-md text-[var(--mr-text-muted)] hover:text-[var(--mr-text-primary)]"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              {mode === 'signup' && (
                <div>
                  <label
                    htmlFor="auth-confirm-password"
                    className="mb-1.5 block text-[14px] font-semibold text-[var(--mr-text-control)]"
                  >
                    Confirmar senha
                  </label>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-[var(--mr-text-muted)]" />
                    <input
                      id="auth-confirm-password"
                      type={showConfirmPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      className="mr-input pl-11 pr-12"
                      placeholder="Repita sua senha"
                      value={confirmPassword}
                      aria-invalid={Boolean(
                        formError && password !== confirmPassword
                      )}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      disabled={isBusy}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((prev) => !prev)}
                      aria-label={
                        showConfirmPassword
                          ? 'Ocultar confirmação de senha'
                          : 'Mostrar confirmação de senha'
                      }
                      className="absolute right-1 top-1/2 flex h-[40px] w-[40px] -translate-y-1/2 items-center justify-center rounded-mr-md text-[var(--mr-text-muted)] hover:text-[var(--mr-text-primary)]"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-3 pt-2 sm:flex-row">
                {mode === 'login' ? (
                  <>
                    <button
                      type="submit"
                      className="mr-btn-primary flex-1"
                      disabled={isBusy}
                    >
                      {loadingAction === 'login' && (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      )}
                      Entrar
                    </button>

                    <button
                      type="button"
                      onClick={() => switchMode('signup')}
                      className="mr-btn-secondary flex-1"
                      disabled={isBusy}
                    >
                      <UserPlus className="h-4 w-4" />
                      Criar Conta
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="submit"
                      className="mr-btn-primary flex-1"
                      disabled={isBusy}
                    >
                      {loadingAction === 'signup' ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <UserPlus className="h-4 w-4" />
                      )}
                      Criar Conta
                    </button>

                    <button
                      type="button"
                      onClick={() => switchMode('login')}
                      className="mr-btn-secondary flex-1"
                      disabled={isBusy}
                    >
                      Já tenho conta
                    </button>
                  </>
                )}
              </div>
            </form>
          </div>
        </div>
      </main>

      {/* Modal de Recuperação de Senha */}
      <Modal
        isOpen={forgotOpen}
        onClose={() => setForgotOpen(false)}
        title="Recuperar senha"
        description="Informe o e-mail cadastrado para receber o link de redefinição."
        size="sm"
      >
        <form onSubmit={handlePasswordReset} className="space-y-4" noValidate>
          {resetError && (
            <div
              role="alert"
              className="rounded-mr-md border border-[var(--mr-error-border)] bg-[var(--mr-error-bg)] px-3 py-2 text-[13px] font-semibold text-[var(--mr-error-text)]"
            >
              {resetError}
            </div>
          )}

          <div>
            <label
              htmlFor="reset-email"
              className="mb-1.5 block text-[14px] font-semibold text-[var(--mr-text-control)]"
            >
              E-mail de cadastro
            </label>
            <input
              id="reset-email"
              type="email"
              className="mr-input"
              placeholder="seuemail@exemplo.com"
              value={resetEmail}
              onChange={(e) => setResetEmail(e.target.value)}
              required
            />
          </div>

          <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => setForgotOpen(false)}
              className="mr-btn-secondary"
              disabled={sendingReset}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="mr-btn-primary"
              disabled={sendingReset}
            >
              {sendingReset && <Loader2 className="h-4 w-4 animate-spin" />}
              Enviar link
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
