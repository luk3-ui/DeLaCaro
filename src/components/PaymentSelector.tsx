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
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      {methods.map((m) => (
        <button
          key={m.key}
          type="button"
          onClick={() => onSelect(m.key)}
          className={`rounded-2xl py-4 text-sm font-bold text-white transition-all ${m.color} ${
            selected === m.key
              ? `scale-[1.02] ring-4 ring-offset-2 ${m.ring}`
              : 'opacity-85'
          }`}
        >
          {m.label}
        </button>
      ))}
    </div>
  );
}
