import { Link, useLocation } from 'react-router-dom';

export type NavSection = 'caja' | 'venta' | 'stock' | 'productos';

const navItems: { id: NavSection; label: string; path: string; activeClass: string }[] = [
  {
    id: 'caja',
    label: 'Caja',
    path: '/open',
    activeClass: 'bg-gradient-to-br from-[#5b6bf5] to-[#818cf8] text-white shadow-sm',
  },
  {
    id: 'venta',
    label: 'Venta',
    path: '/pos',
    activeClass: 'bg-gradient-to-br from-[#7c6ff7] to-[#a78bfa] text-white shadow-sm',
  },
  {
    id: 'stock',
    label: 'Stock',
    path: '/restock',
    activeClass: 'bg-gradient-to-br from-[#22d3ee] to-[#38bdf8] text-white shadow-sm',
  },
  {
    id: 'productos',
    label: 'Productos',
    path: '/admin',
    activeClass: 'bg-gradient-to-br from-[#ff5f6d] to-[#ff8e5e] text-white shadow-sm',
  },
];

function resolveSection(pathname: string): NavSection | null {
  if (pathname === '/') return null;
  if (pathname.startsWith('/open') || pathname.startsWith('/close')) return 'caja';
  if (pathname.startsWith('/pos')) return 'venta';
  if (pathname.startsWith('/restock')) return 'stock';
  if (pathname.startsWith('/admin')) return 'productos';
  return null;
}

export default function MainNav() {
  const { pathname } = useLocation();
  const active = resolveSection(pathname);

  return (
    <nav className="flex w-full items-center gap-0.5 rounded-[12px] bg-pos-nav p-1 md:w-auto md:gap-1 md:rounded-[14px]">
      {navItems.map((item) => {
        const isActive = active === item.id;
        return (
          <Link
            key={item.id}
            to={item.path}
            className={`flex-1 rounded-[8px] px-1 py-2 text-center text-xs font-bold transition-colors md:flex-none md:rounded-[10px] md:px-4 md:py-2 md:text-sm lg:px-5 ${
              isActive ? item.activeClass : 'text-pos-muted hover:text-pos-ink'
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
