import { useCartStore } from '../stores/cartStore';
import CartItem from './CartItem';
import { formatCurrency } from '../utils/format';

export default function Cart() {
  const items = useCartStore((s) => s.items);
  const total = useCartStore((s) => s.calculateTotal());

  if (items.length === 0) {
    return (
      <div className="flex min-h-[160px] flex-col items-center justify-center rounded-2xl border border-[#e5e7eb] bg-[#fafafa] py-10 text-center sm:min-h-[200px]">
        <p className="text-lg font-medium text-pos-muted">Carrito vacío</p>
        <p className="mt-1 text-sm text-[#c4c9d4]">Escaneá un producto para comenzar</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <div>
        {items.map((item) => (
          <CartItem key={item.id} item={item} />
        ))}
      </div>
      <div className="mt-4 flex items-center justify-between border-t-2 border-[#e5e7eb] pt-4">
        <span className="text-base font-semibold text-pos-ink sm:text-lg">TOTAL</span>
        <span className="text-xl font-bold text-[#5b6bf5] sm:text-2xl">{formatCurrency(total)}</span>
      </div>
    </div>
  );
}
