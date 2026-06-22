import { Link, useLocation } from 'react-router-dom';
import { formatHeaderDate } from '../../utils/date';
import { pageShellClass } from './pageShell';
import MainNav from './MainNav';

type Period = 'day' | 'week' | 'month';

const periods: { id: Period; label: string }[] = [
  { id: 'day', label: 'Day' },
  { id: 'week', label: 'Week' },
  { id: 'month', label: 'Month' },
];

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
    <div className="flex shrink-0 items-center gap-3 sm:gap-4">
      <button
        type="button"
        className="relative flex size-10 items-center justify-center rounded-[14px] bg-white shadow-[0_2px_4px_rgba(45,43,107,0.1)]"
        aria-label="Notificaciones"
      >
        <BellIcon />
        <span className="absolute right-2 top-2 size-2 rounded-full bg-[#ff5f6d]" />
      </button>
      <div className="flex size-10 items-center justify-center rounded-[14px] bg-gradient-to-br from-[#ff5f6d] to-[#ff9a56] text-sm font-bold text-white">
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
      <header className="w-full py-5">
        <div className={`${pageShellClass} flex items-center justify-between gap-4`}>
          <div className="shrink-0">
            <h1 className="text-2xl font-bold text-pos-ink">Sistema</h1>
            <p className="text-sm font-medium text-[#9999bb]">{formatHeaderDate()}</p>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-2 sm:gap-4">
            <div className="inline-flex items-center gap-1 rounded-[14px] bg-pos-nav p-1">
              {periods.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => onPeriodChange?.(p.id)}
                  className={`rounded-[10px] px-4 py-2 text-sm font-bold transition-colors sm:px-5 ${
                    period === p.id
                      ? 'bg-gradient-to-br from-[#2d2b6b] to-[#5b6bf5] text-white shadow-sm'
                      : 'text-pos-muted hover:text-pos-ink'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
            <UserActions />
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="w-full py-5">
      <div
        className={`${pageShellClass} grid grid-cols-[1fr_auto] items-center gap-x-4 gap-y-3 md:grid-cols-[auto_1fr_auto] md:gap-x-8 lg:gap-x-12`}
      >
        <Link to="/" className="shrink-0 md:col-start-1">
          <h1 className="text-xl font-bold text-pos-ink sm:text-2xl">Sistema</h1>
          <p className="text-sm font-medium text-[#9999bb]">{formatHeaderDate()}</p>
        </Link>

        <div className="col-span-2 flex justify-center md:col-span-1 md:col-start-2">
          <MainNav />
        </div>

        <div className="justify-self-end md:col-start-3">
          <UserActions />
        </div>
      </div>
    </header>
  );
}
