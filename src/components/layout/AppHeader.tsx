'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  ChefHat,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  Sparkles,
  UserCircle2,
  X,
} from 'lucide-react';
import { getCurrentUser, onAuthStateChange, signOut } from '@/services/authService';
import type { User } from '@/types/models';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Painel de Receitas', Icon: LayoutDashboard },
  { href: '/recipes/new', label: 'Nova Receita IA', Icon: Sparkles },
  { href: '/settings', label: 'Configurações', Icon: Settings },
];

export function AppHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    let active = true;

    void getCurrentUser().then((currentUser) => {
      if (active) {
        setUser(currentUser);
      }
    });

    const unsubscribe = onAuthStateChange((nextUser) => {
      if (active) {
        setUser(nextUser);
      }
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, [pathname]);

  useEffect(() => {
    if (!drawerOpen) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setDrawerOpen(false);
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [drawerOpen]);

  const handleLogout = async () => {
    await signOut();
    setDrawerOpen(false);
    router.replace('/');
  };

  return (
    <>
      <header
        className="mr-header no-print sticky top-0 h-[68px] w-full bg-[var(--mr-header-bg)] shadow-mr-sm lg:h-[72px]"
        style={{ zIndex: 'var(--mr-z-header)' }}
      >
        <div className="mx-auto flex h-full max-w-mr-header items-center justify-between gap-4 px-4">
          {/* Brand Logo */}
          <Link
            href="/dashboard"
            className="flex min-h-[44px] items-center gap-2.5 rounded-mr-md px-1 text-white"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-[var(--mr-terracotta-hover)] shadow-mr-sm">
              <ChefHat className="h-6 w-6" />
            </span>
            <span className="flex flex-col">
              <span className="text-[18px] font-bold leading-tight tracking-tight text-white">
                Minha Receita
              </span>
              <span className="text-[11px] font-semibold uppercase tracking-[0.06em] text-white/95">
                Painel com IA
              </span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav
            aria-label="Navegação principal"
            className="hidden items-center gap-2 lg:flex"
          >
            {NAV_ITEMS.map(({ href, label, Icon }) => {
              const isActive =
                pathname === href ||
                (href === '/dashboard' && pathname.startsWith('/recipes/') && pathname !== '/recipes/new');

              return (
                <Link
                  key={href}
                  href={href}
                  className={`inline-flex min-h-[44px] items-center gap-2 rounded-full px-4 py-2 text-[14px] font-bold transition-colors ${
                    isActive
                      ? 'bg-[var(--mr-brand-orange-aa)] text-white shadow-mr-sm'
                      : 'bg-black/15 text-white hover:bg-[var(--mr-brand-orange-aa)]'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Desktop User Info + Mobile Hamburger */}
          <div className="flex items-center gap-2">
            {user && (
              <Link
                href="/settings"
                className="hidden min-h-[44px] items-center gap-2 rounded-full bg-black/15 px-3.5 py-2 text-[14px] font-semibold text-white transition-colors hover:bg-[var(--mr-brand-orange-aa)] lg:inline-flex"
                title={user.email}
              >
                <UserCircle2 className="h-5 w-5" />
                <span className="max-w-[160px] truncate">{user.name}</span>
              </Link>
            )}

            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              aria-label="Abrir menu"
              aria-expanded={drawerOpen}
              className="flex h-[44px] w-[44px] items-center justify-center rounded-mr-md text-white transition-colors hover:bg-black/15 lg:hidden"
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Full-Screen Drawer (DESIGN_SYSTEM.md Secao 7.2 & 7.5) */}
      {drawerOpen && (
        <div
          className="no-print fixed inset-0 flex flex-col bg-[var(--mr-surface-cream)] lg:hidden"
          style={{ zIndex: 'var(--mr-z-drawer)' }}
          role="dialog"
          aria-modal="true"
          aria-label="Menu de navegação"
        >
          {/* Top menu bar */}
          <div className="flex h-[56px] items-center justify-between bg-[var(--mr-brand-orange-aa)] px-4 text-white">
            <span className="text-[16px] font-bold">Minha Receita IA</span>
            <button
              type="button"
              onClick={() => setDrawerOpen(false)}
              aria-label="Fechar menu"
              className="flex h-[44px] w-[44px] items-center justify-center rounded-mr-md text-white hover:bg-black/15"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Sub-bar user info */}
          {user && (
            <div className="flex min-h-[53px] items-center gap-3 bg-[var(--mr-terracotta-hover)] px-4 py-3 text-white">
              <UserCircle2 className="h-5 w-5 shrink-0" />
              <div className="min-w-0">
                <p className="truncate text-[14px] font-bold">{user.name}</p>
                <p className="truncate text-[12px] text-white/90">{user.email}</p>
              </div>
            </div>
          )}

          {/* Drawer Links */}
          <nav className="flex-1 overflow-y-auto px-4 py-2">
            {NAV_ITEMS.map(({ href, label, Icon }) => {
              const isActive = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setDrawerOpen(false)}
                  className={`flex min-h-[54px] items-center gap-3 border-b border-[var(--mr-border-warm)] px-2 text-[14px] font-bold transition-colors ${
                    isActive
                      ? 'text-[var(--mr-terracotta-hover)]'
                      : 'text-[var(--mr-text-drawer)]'
                  }`}
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  <span>{label}</span>
                </Link>
              );
            })}

            <button
              type="button"
              onClick={handleLogout}
              className="mt-4 flex min-h-[54px] w-full items-center gap-3 rounded-mr-md px-2 text-left text-[14px] font-bold text-[var(--mr-error-text)] hover:bg-[var(--mr-error-bg)]"
            >
              <LogOut className="h-5 w-5 shrink-0" />
              <span>Sair da Conta</span>
            </button>
          </nav>
        </div>
      )}
    </>
  );
}
