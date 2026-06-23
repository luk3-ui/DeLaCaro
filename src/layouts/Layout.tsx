import { useState, type ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import AppHeader from '../components/layout/AppHeader';
import BackToHomeButton from '../components/layout/BackToHomeButton';
import CashSubNav from '../components/layout/CashSubNav';
import { pageShellClass } from '../components/layout/pageShell';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { pathname } = useLocation();
  const isHome = pathname === '/';
  const [period, setPeriod] = useState<'day' | 'week' | 'month'>('month');
  const showCashSubNav =
    pathname.startsWith('/open') || pathname.startsWith('/close');

  return (
    <div className="flex min-h-screen flex-col bg-pos-bg">
      <AppHeader period={period} onPeriodChange={setPeriod} />
      <main className="w-full flex-1 pb-[max(2rem,env(safe-area-inset-bottom))] pt-1 sm:pb-12 sm:pt-2">
        <div className={`${pageShellClass} flex flex-col`}>
          {!isHome && (
            <div className="mb-3 sm:mb-6">
              <BackToHomeButton />
            </div>
          )}
          {isHome ? (
            <div className="flex-1">{children}</div>
          ) : (
            <div className="flex w-full flex-col items-center">
              {showCashSubNav && (
                <div className="mb-4 w-full max-w-lg sm:mb-8">
                  <CashSubNav />
                </div>
              )}
              <div className="flex w-full flex-col items-center">{children}</div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
