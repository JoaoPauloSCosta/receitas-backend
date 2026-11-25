'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser, onAuthStateChange } from '@/services/authService';
import { DashboardSkeleton } from '@/components/ui/Skeleton';

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    let active = true;

    void getCurrentUser().then((user) => {
      if (!active) return;
      if (!user) {
        router.replace('/');
        return;
      }
      setAuthorized(true);
    });

    const unsubscribe = onAuthStateChange((user) => {
      if (!active) return;
      if (!user) {
        setAuthorized(false);
        router.replace('/');
      } else {
        setAuthorized(true);
      }
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, [router]);

  if (!authorized) {
    return (
      <div className="min-h-screen bg-[var(--mr-surface-default)]">
        <div className="h-[68px] w-full bg-[var(--mr-header-bg)] lg:h-[72px]" />
        <main className="mx-auto max-w-mr-wide px-4 py-8">
          <DashboardSkeleton />
        </main>
      </div>
    );
  }

  return <>{children}</>;
}
