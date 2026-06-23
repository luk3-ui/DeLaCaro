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
      className={`group relative flex min-h-[168px] flex-col justify-between overflow-hidden rounded-2xl bg-gradient-to-br p-4 text-white shadow-lg transition-transform active:scale-[0.98] sm:min-h-[280px] sm:p-5 sm:hover:scale-[1.02] lg:min-h-[368px] ${style.gradient}`}
    >
      <div className="absolute -top-8 right-[calc(50%-56px)] size-24 rounded-full bg-white/10 sm:size-28" />

      <div className="relative flex items-start justify-between gap-2">
        {badge ?? (
          <span className="text-xs font-semibold opacity-90 sm:text-sm">{topLabel ?? style.label}</span>
        )}
        <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-white/25 sm:size-9">
          {icon}
        </div>
      </div>

      <div className="relative flex flex-1 flex-col justify-center py-4 sm:py-10">
        <h2 className="text-center text-3xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
          {title}
        </h2>
      </div>

      <p className="relative line-clamp-2 text-[11px] font-medium leading-snug opacity-75 sm:line-clamp-none sm:text-sm">
        {subtitle}
      </p>
    </Link>
  );
}
