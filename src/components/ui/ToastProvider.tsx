'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Info,
  X,
} from 'lucide-react';

export type ToastVariant = 'success' | 'error' | 'warning' | 'info';

export interface ToastItem {
  id: string;
  variant: ToastVariant;
  message: string;
  duration: number;
}

interface ToastContextValue {
  showToast: (variant: ToastVariant, message: string, duration?: number) => void;
  success: (message: string, duration?: number) => void;
  error: (message: string, duration?: number) => void;
  warning: (message: string, duration?: number) => void;
  info: (message: string, duration?: number) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const VARIANT_CONFIG: Record<
  ToastVariant,
  {
    bg: string;
    border: string;
    text: string;
    iconColor: string;
    defaultDuration: number;
    role: 'status' | 'alert';
    ariaLive: 'polite' | 'assertive';
    Icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  }
> = {
  success: {
    bg: 'var(--mr-success-bg)',
    border: 'var(--mr-success-border)',
    text: 'var(--mr-success-text)',
    iconColor: 'var(--mr-success-border)',
    defaultDuration: 4000,
    role: 'status',
    ariaLive: 'polite',
    Icon: CheckCircle2,
  },
  error: {
    bg: 'var(--mr-error-bg)',
    border: 'var(--mr-error-border)',
    text: 'var(--mr-error-text)',
    iconColor: 'var(--mr-error-border)',
    defaultDuration: 6000,
    role: 'alert',
    ariaLive: 'assertive',
    Icon: AlertCircle,
  },
  warning: {
    bg: 'var(--mr-warning-bg)',
    border: 'var(--mr-warning-border)',
    text: 'var(--mr-warning-text)',
    iconColor: 'var(--mr-warning-icon)',
    defaultDuration: 5000,
    role: 'alert',
    ariaLive: 'assertive',
    Icon: AlertTriangle,
  },
  info: {
    bg: 'var(--mr-info-bg)',
    border: 'var(--mr-info-border)',
    text: 'var(--mr-info-text)',
    iconColor: 'var(--mr-info-border)',
    defaultDuration: 4000,
    role: 'status',
    ariaLive: 'polite',
    Icon: Info,
  },
};

function ToastBanner({
  toast,
  onDismiss,
}: {
  toast: ToastItem;
  onDismiss: (id: string) => void;
}) {
  const [paused, setPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cfg = VARIANT_CONFIG[toast.variant];
  const { Icon } = cfg;

  useEffect(() => {
    if (paused) return;
    timerRef.current = setTimeout(() => {
      onDismiss(toast.id);
    }, toast.duration);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [paused, toast.duration, toast.id, onDismiss]);

  return (
    <div
      role={cfg.role}
      aria-live={cfg.ariaLive}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
      className="pointer-events-auto flex w-full items-start gap-3 rounded-mr-lg border px-4 py-3 text-[14px] font-medium leading-[20px] shadow-mr-toast transition-all duration-200 md:min-w-[300px] md:max-w-[420px]"
      style={{
        backgroundColor: cfg.bg,
        borderColor: cfg.border,
        color: cfg.text,
      }}
    >
      <Icon
        className="mt-0.5 h-5 w-5 shrink-0"
        style={{ color: cfg.iconColor }}
      />
      <p className="flex-1 break-words">{toast.message}</p>
      <button
        type="button"
        onClick={() => onDismiss(toast.id)}
        aria-label="Fechar notificação"
        className="-mr-1 -mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors hover:bg-black/5"
        style={{ color: cfg.text }}
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const showToast = useCallback(
    (variant: ToastVariant, message: string, duration?: number) => {
      const cfg = VARIANT_CONFIG[variant];
      const item: ToastItem = {
        id: `toast-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        variant,
        message,
        duration: duration ?? cfg.defaultDuration,
      };
      setToasts((prev) => {
        const next = [...prev, item];
        return next.length > 3 ? next.slice(next.length - 3) : next;
      });
    },
    []
  );

  const value = useMemo<ToastContextValue>(
    () => ({
      showToast,
      success: (msg, dur) => showToast('success', msg, dur),
      error: (msg, dur) => showToast('error', msg, dur),
      warning: (msg, dur) => showToast('warning', msg, dur),
      info: (msg, dur) => showToast('info', msg, dur),
    }),
    [showToast]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        className="no-print pointer-events-none fixed bottom-4 left-4 right-4 flex flex-col-reverse gap-3 md:bottom-6 md:left-auto md:right-6"
        style={{ zIndex: 'var(--mr-z-toast)' }}
      >
        {toasts.map((toast) => (
          <ToastBanner key={toast.id} toast={toast} onDismiss={dismiss} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast deve ser utilizado dentro de ToastProvider.');
  }
  return ctx;
}
