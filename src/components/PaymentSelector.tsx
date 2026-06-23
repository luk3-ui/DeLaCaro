import type { PaymentMethod } from '../types';

interface PaymentSelectorProps {
  selected: PaymentMethod | null;
  onSelect: (method: PaymentMethod) => void;
}

const methods: { key: PaymentMethod; label: string; color: string; ring: string }[] = [
  {
    key: 'cash',
    label: 'EFECTIVO',
    color: 'bg-[#16a34a] hover:bg-[#15803d]',
    ring: 'ring-[#86efac]',
  },
  {
    key: 'qr',
    label: 'QR',
    color: 'bg-[#9333ea] hover:bg-[#7e22ce]',
    ring: 'ring-[#d8b4fe]',
  },
  {
    key: 'card',
    label: 'TARJETA',
    color: 'bg-[#ea580c] hover:bg-[#c2410c]',
    ring: 'ring-[#fdba74]',
  },
];

export default function PaymentSelector({ selected, onSelect }: PaymentSelectorProps) {
  return (
    <div className="grid grid-cols-3 gap-2 sm:gap-3">
      {methods.map((m) => (
        <button
          key={m.key}
          type="button"
          onClick={() => onSelect(m.key)}
          className={`rounded-xl py-3 text-[11px] font-bold text-white transition-all sm:rounded-2xl sm:py-4 sm:text-sm ${m.color} ${
            selected === m.key
              ? `scale-[1.02] ring-2 ring-offset-1 sm:ring-4 sm:ring-offset-2 ${m.ring}`
              : 'opacity-85'
          }`}
        >
          {m.label}
        </button>
      ))}
    </div>
  );
}
