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
    <div className="flex items-center gap-2 py-3 sm:gap-3">
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium text-pos-ink">{item.description}</p>
        <p className="text-sm text-pos-muted">{formatCurrency(item.unitPrice)} c/u</p>
      </div>
      <div className="flex items-center gap-1.5 sm:gap-2">
        <button
          type="button"
          onClick={() => updateQuantity(item.id, item.quantity - 1)}
          className="flex size-8 items-center justify-center rounded-xl bg-[#f5f7ff] text-lg font-bold text-pos-ink hover:bg-[#e8edff]"
        >
          −
        </button>
        <button
          type="button"
          onClick={() => {
            const qty = prompt('Cantidad:', String(item.quantity));
            if (qty) updateQuantity(item.id, parseInt(qty, 10));
          }}
          className="min-w-8 text-center text-lg font-bold text-[#5b6bf5]"
        >
          {item.quantity}
        </button>
        <button
          type="button"
          onClick={() => updateQuantity(item.id, item.quantity + 1)}
          className="flex size-8 items-center justify-center rounded-xl bg-[#f5f7ff] text-lg font-bold text-pos-ink hover:bg-[#e8edff]"
        >
          +
        </button>
      </div>
      <span className="w-20 text-right font-semibold text-pos-ink sm:w-24">
        {formatCurrency(item.subtotal)}
      </span>
      <button
        type="button"
        onClick={() => removeItem(item.id)}
        className="text-lg text-[#fca5a5] hover:text-[#ef4444]"
        title="Eliminar"
        aria-label="Eliminar"
      >
        🗑
      </button>
    </div>
  );
}
