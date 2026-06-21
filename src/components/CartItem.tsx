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
    <div className="flex items-center gap-3 py-3">
      <div className="flex-1 min-w-0">
        <p className="font-medium text-gray-900 truncate">{item.description}</p>
        <p className="text-sm text-gray-500">{formatCurrency(item.unitPrice)} c/u</p>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={() => updateQuantity(item.id, item.quantity - 1)}
          className="w-8 h-8 rounded-lg bg-gray-100 text-gray-700 font-bold hover:bg-gray-200"
        >
          −
        </button>
        <button
          onClick={() => {
            const qty = prompt('Cantidad:', String(item.quantity));
            if (qty) updateQuantity(item.id, parseInt(qty, 10));
          }}
          className="w-10 text-center font-bold text-lg text-blue-700"
        >
          {item.quantity}
        </button>
        <button
          onClick={() => updateQuantity(item.id, item.quantity + 1)}
          className="w-8 h-8 rounded-lg bg-gray-100 text-gray-700 font-bold hover:bg-gray-200"
        >
          +
        </button>
      </div>
      <span className="font-semibold text-gray-900 w-24 text-right">
        {formatCurrency(item.subtotal)}
      </span>
      <button
        onClick={() => removeItem(item.id)}
        className="text-red-400 hover:text-red-600 text-xl"
        title="Eliminar"
      >
        🗑
      </button>
    </div>
  );
}
