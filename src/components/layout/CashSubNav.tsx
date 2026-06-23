import { Link, useLocation } from 'react-router-dom';

export default function CashSubNav() {
  const { pathname } = useLocation();
  const isApertura = pathname.startsWith('/open');
  const isCierre = pathname.startsWith('/close');

  if (!isApertura && !isCierre) return null;

  const tabClass = (active: boolean) =>
    `flex-1 border-b-2 px-2 pb-3 pt-1 text-center text-sm font-semibold transition-colors sm:flex-none sm:px-1 ${
      active
        ? 'border-pos-ink text-pos-ink'
        : 'border-transparent text-pos-muted hover:text-pos-ink'
    }`;

  return (
    <div className="flex w-full justify-center border-b border-[#e2e4ea]">
      <nav className="flex w-full max-w-xs items-center gap-4 sm:inline-flex sm:w-auto sm:max-w-none sm:gap-12" aria-label="Caja">
        <Link to="/open" className={tabClass(isApertura)}>
          Apertura
        </Link>
        <Link to="/close" className={tabClass(isCierre)}>
          Cierre
        </Link>
      </nav>
    </div>
  );
}
