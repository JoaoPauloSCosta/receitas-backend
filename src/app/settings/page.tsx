'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { KeyRound, Loader2, LogOut, Save, User as UserIcon } from 'lucide-react';
import { AppHeader } from '@/components/layout/AppHeader';
import { AuthGuard } from '@/components/layout/AuthGuard';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/ToastProvider';
import { signOut, updatePassword } from '@/services/authService';
import { getProfile, updateProfile } from '@/services/profileService';

export default function SettingsPage() {
  const router = useRouter();
  const toast = useToast();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [profileError, setProfileError] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);

  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);

  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    void getProfile().then((user) => {
      if (user) {
        setName(user.name);
        setEmail(user.email);
      }
    });
  }, []);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError('');
    setSavingProfile(true);
    try {
      const { user, emailConfirmationSent } = await updateProfile({
        name,
        email,
      });
      setName(user.name);
      if (emailConfirmationSent) {
        toast.info(
          'Nome atualizado! Confirme o novo e-mail na sua caixa de entrada para concluir a alteração.'
        );
      } else {
        setEmail(user.email);
        toast.success('Dados do perfil salvos com sucesso!');
      }
      router.refresh();
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : 'Erro ao atualizar perfil.';
      setProfileError(msg);
      toast.error(msg);
    } finally {
      setSavingProfile(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.trim().length < 6) {
      setPasswordError('A nova senha deve ter pelo menos 6 caracteres.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('A confirmação da nova senha não confere.');
      return;
    }

    setPasswordError('');
    setSavingPassword(true);
    try {
      await updatePassword(currentPassword, newPassword);
      toast.success('Senha alterada com sucesso!');
      setPasswordModalOpen(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : 'Erro ao alterar a senha.';
      setPasswordError(msg);
    } finally {
      setSavingPassword(false);
    }
  };

  const handleSignOut = async () => {
    setLoggingOut(true);
    try {
      await signOut();
      toast.info('Sessão encerrada.');
      router.replace('/');
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <AuthGuard>
      <div className="min-h-screen bg-[var(--mr-surface-default)]">
        <AppHeader />

        <main className="mx-auto max-w-mr-prose px-4 py-8">
          <h1 className="mr-display-h1">Configurações</h1>
          <p className="mt-1 text-[15px] leading-[22px] text-[var(--mr-text-secondary)]">
            Gerencie seus dados de perfil, altere sua senha ou encerre a sessão
            atual.
          </p>

          {/* Card de Perfil */}
          <section
            aria-label="Dados do perfil"
            className="mt-6 rounded-mr-lg border border-[var(--mr-border-default)] bg-white p-6 shadow-mr-sm md:p-8"
          >
            <div className="mb-5 flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--mr-surface-cream)] text-[var(--mr-terracotta)]">
                <UserIcon className="h-5 w-5" />
              </span>
              <div>
                <h2 className="text-[18px] font-bold text-[var(--mr-text-primary)]">
                  Perfil do Usuário
                </h2>
                <p className="text-[13px] text-[var(--mr-text-muted)]">
                  Informações exibidas no painel administrativo
                </p>
              </div>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4" noValidate>
              {profileError && (
                <div
                  role="alert"
                  className="rounded-mr-md border border-[var(--mr-error-border)] bg-[var(--mr-error-bg)] px-4 py-3 text-[14px] font-semibold text-[var(--mr-error-text)]"
                >
                  {profileError}
                </div>
              )}

              <div>
                <label
                  htmlFor="settings-name"
                  className="mb-1.5 block text-[14px] font-semibold text-[var(--mr-text-control)]"
                >
                  Nome do Usuário
                </label>
                <input
                  id="settings-name"
                  type="text"
                  className="mr-input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={savingProfile}
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="settings-email"
                  className="mb-1.5 block text-[14px] font-semibold text-[var(--mr-text-control)]"
                >
                  E-mail
                </label>
                <input
                  id="settings-email"
                  type="email"
                  className="mr-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={savingProfile}
                  required
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="mr-btn-primary w-full sm:w-auto"
                  disabled={savingProfile}
                >
                  {savingProfile ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  Salvar Alterações
                </button>
              </div>
            </form>
          </section>

          {/* Segurança e Sessão */}
          <section
            aria-label="Segurança e sessão"
            className="mt-6 rounded-mr-lg border border-[var(--mr-border-default)] bg-[var(--mr-surface-cream)] p-6"
          >
            <h2 className="text-[18px] font-bold text-[var(--mr-text-primary)]">
              Segurança e Sessão
            </h2>
            <p className="mt-1 text-[14px] text-[var(--mr-text-secondary)]">
              Atualize sua senha de acesso ou desconecte-se deste dispositivo.
            </p>

            <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <button
                type="button"
                onClick={() => {
                  setPasswordError('');
                  setPasswordModalOpen(true);
                }}
                className="mr-btn-secondary"
              >
                <KeyRound className="h-4 w-4" />
                Alterar Senha
              </button>

              <button
                type="button"
                onClick={handleSignOut}
                disabled={loggingOut}
                className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full border border-[var(--mr-error-border)] bg-[var(--mr-error-bg)] px-5 py-2.5 text-[14px] font-bold text-[var(--mr-error-text)] transition-colors hover:bg-[var(--mr-error-border)] hover:text-white"
              >
                {loggingOut ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <LogOut className="h-4 w-4" />
                )}
                Sair
              </button>
            </div>
          </section>
        </main>

        {/* Modal de Alteração de Senha */}
        <Modal
          isOpen={passwordModalOpen}
          onClose={() => setPasswordModalOpen(false)}
          title="Alterar senha"
          description="Informe sua senha atual e defina uma nova senha de acesso."
          size="sm"
        >
          <form
            onSubmit={handleUpdatePassword}
            className="space-y-4"
            noValidate
          >
            {passwordError && (
              <div
                role="alert"
                className="rounded-mr-md border border-[var(--mr-error-border)] bg-[var(--mr-error-bg)] px-3 py-2 text-[13px] font-semibold text-[var(--mr-error-text)]"
              >
                {passwordError}
              </div>
            )}

            <div>
              <label
                htmlFor="current-password"
                className="mb-1.5 block text-[14px] font-semibold text-[var(--mr-text-control)]"
              >
                Senha atual
              </label>
              <input
                id="current-password"
                type="password"
                className="mr-input"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
              />
            </div>

            <div>
              <label
                htmlFor="new-password"
                className="mb-1.5 block text-[14px] font-semibold text-[var(--mr-text-control)]"
              >
                Nova senha
              </label>
              <input
                id="new-password"
                type="password"
                className="mr-input"
                placeholder="Mínimo de 6 caracteres"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>

            <div>
              <label
                htmlFor="confirm-new-password"
                className="mb-1.5 block text-[14px] font-semibold text-[var(--mr-text-control)]"
              >
                Confirmar nova senha
              </label>
              <input
                id="confirm-new-password"
                type="password"
                className="mr-input"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setPasswordModalOpen(false)}
                className="mr-btn-secondary"
                disabled={savingPassword}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="mr-btn-primary"
                disabled={savingPassword}
              >
                {savingPassword && <Loader2 className="h-4 w-4 animate-spin" />}
                Salvar nova senha
              </button>
            </div>
          </form>
        </Modal>
      </div>
    </AuthGuard>
  );
}
