import { useEffect, useState } from 'react';
import { useCashStore } from '../stores/cashStore';
import * as productService from '../services/productService';
import DashboardCard from '../components/ui/DashboardCard';
import { formatCurrency } from '../utils/format';
import type { Product } from '../types';

function CalculatorIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="5" y="3" width="14" height="18" rx="2" stroke="white" strokeWidth="1.8" />
      <path d="M8 7h8M8 11h2M12 11h2M16 11h0M8 15h2M12 15h2M16 15h0" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function SaleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="8" stroke="white" strokeWidth="1.8" />
      <path d="M12 8v8M9 11h6" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function StockIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M4 18V6l8-3 8 3v12l-8 3-8-3Z" stroke="white" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M12 9v12M4 6l8 3 8-3" stroke="white" strokeWidth="1.8" />
    </svg>
  );
}

function BoxIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M12 3 4 7v10l8 4 8-4V7l-8-4Z" stroke="white" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M12 7v14M4 7l8 4 8-4" stroke="white" strokeWidth="1.8" />
    </svg>
  );
}

function buildProductosCardCopy(products: Product[]) {
  const active = products.filter((p) => p.active);
  const categories = [
    ...new Set(active.map((p) => p.category).filter((c): c is string => Boolean(c))),
  ];

  if (active.length === 0) {
    return {
      topLabel: 'Catálogo',
      subtitle: 'Cargá y editá tu inventario',
    };
  }

  const lowStockCount = active.filter((p) => p.stock_current <= p.stock_minimum).length;

  let topLabel = 'Catálogo';
  if (categories.length === 1) {
    topLabel = categories[0];
  } else if (categories.length === 2) {
    topLabel = `${categories[0]} · ${categories[1]}`;
  } else if (categories.length > 2) {
    topLabel = `${categories.slice(0, 2).join(' · ')} +${categories.length - 2}`;
  }

  const parts = [
    `${active.length} producto${active.length !== 1 ? 's' : ''} activo${active.length !== 1 ? 's' : ''}`,
  ];
  if (categories.length > 0) {
    parts.push(`${categories.length} categoría${categories.length !== 1 ? 's' : ''}`);
  }
  if (lowStockCount > 0) {
    parts.push(`${lowStockCount} bajo stock`);
  }

  return { topLabel, subtitle: parts.join(' · ') };
}

function HomeCashStatus({ open }: { open: boolean }) {
  if (open) {
    return (
      <div className="flex items-center gap-1.5">
        <span className="size-2.5 shrink-0 rounded-full bg-[#05df72]" />
        <span className="font-[family-name:var(--font-inter)] text-xs font-semibold tracking-wide text-white">
          CAJA ABIERTA
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1.5">
      <span className="size-2.5 shrink-0 rounded-full bg-[#ef4444]" />
      <span className="font-[family-name:var(--font-inter)] text-xs font-semibold tracking-wide text-white">
        CAJA CERRADA
      </span>
    </div>
  );
}

export default function HomePage() {
  const session = useCashStore((s) => s.session);
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    productService.getAllProducts().then(setProducts).catch(() => setProducts([]));
  }, []);

  const totalStock = products.reduce((sum, p) => sum + p.stock_current, 0);
  const productosCard = buildProductosCardCopy(products);

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-[18px] lg:gap-5">
      <DashboardCard
        variant="caja"
        title="CAJA"
        subtitle={`Monto inicial: ${formatCurrency(Number(session?.opening_amount ?? 0))}`}
        badge={<HomeCashStatus open={!!session} />}
        icon={<CalculatorIcon />}
      />
      <DashboardCard
        variant="venta"
        title="VENTA"
        subtitle={`Venta total: ${formatCurrency(Number(session?.total_sales ?? 0))}`}
        icon={<SaleIcon />}
      />
      <DashboardCard
        variant="stock"
        title="STOCK"
        subtitle={`Cantidad de Stock: ${totalStock}`}
        icon={<StockIcon />}
      />
      <DashboardCard
        variant="productos"
        title="PRODUCTOS"
        topLabel={productosCard.topLabel}
        subtitle={productosCard.subtitle}
        icon={<BoxIcon />}
      />
    </div>
  );
}
