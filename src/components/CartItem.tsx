import { useCartStore } from '../stores/cartStore';
import type { CartItem as CartItemType } from '../types';
import { formatCurrency } from '../utils/format';

interface CartItemProps {
  item: CartItemType;
}

export default function CartItem({ item }: CartItemProps) {
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);

  return (
    <div className="flex flex-col gap-2 border-b border-[#f0f0f8] py-3 last:border-b-0 sm:flex-row sm:items-center sm:gap-3 sm:border-b-0">
      <div className="flex min-w-0 items-start justify-between gap-2 sm:flex-1 sm:items-center">
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium text-pos-ink">{item.description}</p>
          <p className="text-sm text-pos-muted">{formatCurrency(item.unitPrice)} c/u</p>
        </div>
        <button
          type="button"
          onClick={() => removeItem(item.id)}
          className="shrink-0 p-1 text-lg text-[#fca5a5] hover:text-[#ef4444] sm:hidden"
          title="Eliminar"
          aria-label="Eliminar"
        >
          🗑
        </button>
      </div>

      <div className="flex items-center justify-between gap-2 sm:justify-end">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => updateQuantity(item.id, item.quantity - 1)}
            className="flex size-9 items-center justify-center rounded-xl bg-[#f5f7ff] text-lg font-bold text-pos-ink hover:bg-[#e8edff]"
          >
            −
          </button>
          <button
            type="button"
            onClick={() => {
              const qty = prompt('Cantidad:', String(item.quantity));
              if (qty) updateQuantity(item.id, parseInt(qty, 10));
            }}
            className="min-w-9 text-center text-lg font-bold text-[#5b6bf5]"
          >
            {item.quantity}
          </button>
          <button
            type="button"
            onClick={() => updateQuantity(item.id, item.quantity + 1)}
            className="flex size-9 items-center justify-center rounded-xl bg-[#f5f7ff] text-lg font-bold text-pos-ink hover:bg-[#e8edff]"
          >
            +
          </button>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-right text-base font-semibold text-pos-ink sm:w-24 sm:text-lg">
            {formatCurrency(item.subtotal)}
          </span>
          <button
            type="button"
            onClick={() => removeItem(item.id)}
            className="hidden text-lg text-[#fca5a5] hover:text-[#ef4444] sm:block"
            title="Eliminar"
            aria-label="Eliminar"
          >
            🗑
          </button>
        </div>
      </div>
    </div>
  );
}
