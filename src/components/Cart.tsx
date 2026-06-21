import { useCartStore } from '../stores/cartStore';
import CartItem from './CartItem';
import { formatCurrency } from '../utils/format';

export default function Cart() {
  const items = useCartStore((s) => s.items);
  const total = useCartStore((s) => s.calculateTotal());

  if (items.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400">
        <p className="text-lg">Carrito vacío</p>
        <p className="text-sm mt-1">Escaneá un producto para comenzar</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="divide-y divide-gray-100">
        {items.map((item) => (
          <CartItem key={item.id} item={item} />
        ))}
      </div>
      <div className="mt-4 pt-4 border-t-2 border-gray-200 flex justify-between items-center">
        <span className="text-lg font-semibold text-gray-700">TOTAL</span>
        <span className="text-2xl font-bold text-blue-700">{formatCurrency(total)}</span>
      </div>
    </div>
  );
}
