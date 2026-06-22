import { Link } from 'react-router-dom';
import type { ReactNode } from 'react';

type CardVariant = 'caja' | 'venta' | 'stock' | 'productos';

const cardStyles: Record<
  CardVariant,
  { gradient: string; label: string; to: string }
> = {
  caja: {
    gradient: 'from-[#5b6bf5] to-[#818cf8]',
    label: 'Caja',
    to: '/open',
  },
  venta: {
    gradient: 'from-[#7c6ff7] to-[#a78bfa]',
    label: 'Cobros',
    to: '/pos',
  },
  stock: {
    gradient: 'from-[#22d3ee] to-[#38bdf8]',
    label: 'Reposición',
    to: '/restock',
  },
  productos: {
    gradient: 'from-[#ff5f6d] to-[#ff8e5e]',
    label: 'Catálogo',
    to: '/admin',
  },
};

interface DashboardCardProps {
  variant: CardVariant;
  title: string;
  subtitle: string;
  topLabel?: string;
  badge?: ReactNode;
  icon: ReactNode;
}

export default function DashboardCard({
  variant,
  title,
  subtitle,
  topLabel,
  badge,
  icon,
}: DashboardCardProps) {
  const style = cardStyles[variant];

  return (
    <Link
      to={style.to}
      className={`group relative flex min-h-[200px] flex-col justify-between overflow-hidden rounded-2xl bg-gradient-to-br p-5 text-white shadow-lg transition-transform hover:scale-[1.02] sm:min-h-[280px] sm:p-5 lg:min-h-[368px] ${style.gradient}`}
    >
      <div className="absolute -top-8 right-[calc(50%-56px)] size-28 rounded-full bg-white/10" />

      <div className="relative flex items-start justify-between gap-2">
        {badge ?? (
          <span className="text-sm font-semibold opacity-90">{topLabel ?? style.label}</span>
        )}
        <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-white/25">
          {icon}
        </div>
      </div>

      <div className="relative flex flex-1 flex-col justify-center py-6 sm:py-10">
        <h2 className="text-center text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
          {title}
        </h2>
      </div>

      <p className="relative text-xs font-medium opacity-75 sm:text-sm">{subtitle}</p>
    </Link>
  );
}
