import type { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useCashStore } from '../stores/cashStore';

interface LayoutProps {
  children: ReactNode;
}

const navItems = [
  { path: '/open', label: 'Abrir Caja' },
  { path: '/pos', label: 'Vender' },
  { path: '/restock', label: 'Reposición' },
  { path: '/close', label: 'Cerrar Caja' },
  { path: '/admin', label: 'Productos' },
];

export default function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const session = useCashStore((s) => s.session);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-blue-700 text-white shadow-lg">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-xl font-bold tracking-tight">Comercio IA</h1>
          <div className="flex items-center gap-2 text-sm">
            <span
              className={`inline-block w-2.5 h-2.5 rounded-full ${
                session ? 'bg-green-400' : 'bg-red-400'
              }`}
            />
            <span>{session ? 'CAJA ABIERTA' : 'CAJA CERRADA'}</span>
          </div>
        </div>
        <nav className="max-w-4xl mx-auto px-4 pb-2 flex gap-1 overflow-x-auto">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                location.pathname === item.path
                  ? 'bg-white text-blue-700'
                  : 'text-blue-100 hover:bg-blue-600'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </header>
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-6">{children}</main>
    </div>
  );
}
