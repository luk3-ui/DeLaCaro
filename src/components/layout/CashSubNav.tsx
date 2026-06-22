import { Link, useLocation } from 'react-router-dom';

export default function CashSubNav() {
  const { pathname } = useLocation();
  const isApertura = pathname.startsWith('/open');
  const isCierre = pathname.startsWith('/close');

  if (!isApertura && !isCierre) return null;

  const tabClass = (active: boolean) =>
    `border-b-2 px-1 pb-3 pt-1 text-sm font-semibold transition-colors ${
      active
        ? 'border-pos-ink text-pos-ink'
        : 'border-transparent text-pos-muted hover:text-pos-ink'
    }`;

  return (
    <div className="flex w-full justify-center border-b border-[#e2e4ea]">
      <nav
        className="inline-flex items-center gap-8 sm:gap-12"
        aria-label="Caja"
      >
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
