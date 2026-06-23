import { Link, useLocation } from 'react-router-dom';
import { formatHeaderDate } from '../../utils/date';
import { pageShellClass } from './pageShell';
import MainNav from './MainNav';

type Period = 'day' | 'week' | 'month';

const periods: { id: Period; label: string }[] = [
  { id: 'day', label: 'Día' },
  { id: 'week', label: 'Semana' },
  { id: 'month', label: 'Mes' },
];

function PeriodToggle({
  period,
  onPeriodChange,
  className = '',
}: {
  period: Period;
  onPeriodChange?: (period: Period) => void;
  className?: string;
}) {
  return (
    <div
      className={`inline-flex items-center gap-0.5 rounded-[12px] bg-pos-nav p-1 md:gap-1 md:rounded-[14px] ${className}`}
    >
      {periods.map((p) => (
        <button
          key={p.id}
          type="button"
          onClick={() => onPeriodChange?.(p.id)}
          className={`flex-1 rounded-[8px] px-2 py-2 text-xs font-bold transition-colors md:flex-none md:rounded-[10px] md:px-5 md:py-2 md:text-sm ${
            period === p.id
              ? 'bg-gradient-to-br from-[#2d2b6b] to-[#5b6bf5] text-white shadow-sm'
              : 'text-pos-muted hover:text-pos-ink'
          }`}
        >
          {p.label}
        </button>
      ))}
    </div>
  );
}

function BellIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 3a5 5 0 0 0-5 5v2.5c0 .7-.3 1.4-.8 1.9L4.5 14.5h15l-1.7-2.1c-.5-.5-.8-1.2-.8-1.9V8a5 5 0 0 0-5-5Z"
        stroke="#5b6bf5"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path d="M10 18a2 2 0 0 0 4 0" stroke="#5b6bf5" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function UserActions() {
  return (
    <div className="flex shrink-0 items-center gap-2 sm:gap-4">
      <button
        type="button"
        className="relative flex size-9 items-center justify-center rounded-[12px] bg-white shadow-[0_2px_4px_rgba(45,43,107,0.1)] sm:size-10 sm:rounded-[14px]"
        aria-label="Notificaciones"
      >
        <BellIcon />
        <span className="absolute right-1.5 top-1.5 size-2 rounded-full bg-[#ff5f6d] sm:right-2 sm:top-2" />
      </button>
      <div className="flex size-9 items-center justify-center rounded-[12px] bg-gradient-to-br from-[#ff5f6d] to-[#ff9a56] text-xs font-bold text-white sm:size-10 sm:rounded-[14px] sm:text-sm">
        JD
      </div>
    </div>
  );
}

interface AppHeaderProps {
  period?: Period;
  onPeriodChange?: (period: Period) => void;
}

export default function AppHeader({ period = 'month', onPeriodChange }: AppHeaderProps) {
  const { pathname } = useLocation();
  const isHome = pathname === '/';

  if (isHome) {
    return (
      <header className="w-full py-3 md:py-5">
        <div
          className={`${pageShellClass} flex flex-col gap-3 md:flex-row md:items-center md:justify-between md:gap-4`}
        >
          <div className="flex min-w-0 items-start justify-between gap-3 md:shrink-0 md:justify-start">
            <div className="min-w-0">
              <h1 className="text-xl font-bold text-pos-ink md:text-2xl">Sistema</h1>
              <p className="truncate text-xs font-medium text-[#9999bb] md:text-sm">
                {formatHeaderDate()}
              </p>
            </div>
            <div className="md:hidden">
              <UserActions />
            </div>
          </div>

          <div className="flex items-center gap-3 md:shrink-0 md:gap-4">
            <PeriodToggle
              period={period}
              onPeriodChange={onPeriodChange}
              className="w-full md:w-auto"
            />
            <div className="hidden md:block">
              <UserActions />
            </div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="w-full py-3 md:py-5">
      <div
        className={`${pageShellClass} grid grid-cols-[1fr_auto] items-center gap-x-3 gap-y-3 md:grid-cols-[auto_1fr_auto] md:gap-x-8 md:gap-y-0 lg:gap-x-12`}
      >
        <Link to="/" className="min-w-0 shrink-0 md:col-start-1">
          <h1 className="text-lg font-bold text-pos-ink md:text-2xl">Sistema</h1>
          <p className="truncate text-xs font-medium text-[#9999bb] md:text-sm">
            {formatHeaderDate()}
          </p>
        </Link>

        <div className="col-span-2 flex justify-center md:col-span-1 md:col-start-2 md:row-start-1">
          <MainNav />
        </div>

        <div className="col-start-2 row-start-1 justify-self-end md:col-start-3">
          <UserActions />
        </div>
      </div>
    </header>
  );
}
