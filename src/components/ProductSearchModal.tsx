import type { Product } from '../types';
import { formatCurrency } from '../utils/format';

interface ProductSearchModalProps {
  open: boolean;
  query: string;
  products: Product[];
  onSelect: (product: Product) => void;
  onClose: () => void;
}

export default function ProductSearchModal({
  open,
  query,
  products,
  onSelect,
  onClose,
}: ProductSearchModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 sm:items-center">
      <div className="flex max-h-[80vh] w-full max-w-md flex-col rounded-3xl bg-white shadow-2xl">
        <div className="flex shrink-0 items-center justify-between border-b border-[#f0f0f8] px-6 py-4">
          <div>
            <h2 className="text-lg font-bold text-pos-ink">Resultados</h2>
            <p className="text-sm text-pos-muted">
              &quot;{query}&quot; — {products.length} producto{products.length !== 1 ? 's' : ''}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-2xl leading-none text-pos-muted hover:text-pos-ink"
            aria-label="Cerrar"
          >
            &times;
          </button>
        </div>
        <div className="divide-y divide-[#f0f0f8] overflow-y-auto">
          {products.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => onSelect(p)}
              className="flex w-full items-center gap-3 px-6 py-4 text-left transition-colors hover:bg-[#f5f7ff]"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-pos-ink">{p.name}</p>
                <p className="font-mono text-xs text-pos-muted">{p.barcode}</p>
              </div>
              <div className="shrink-0 text-right">
                <p className="font-semibold text-[#5b6bf5]">{formatCurrency(Number(p.price))}</p>
                <p
                  className={`text-xs ${
                    p.stock_current <= p.stock_minimum ? 'font-bold text-[#ef4444]' : 'text-pos-muted'
                  }`}
                >
                  Stock: {p.stock_current}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
