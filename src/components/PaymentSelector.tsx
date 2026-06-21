import type { PaymentMethod } from '../types';

interface PaymentSelectorProps {
  selected: PaymentMethod | null;
  onSelect: (method: PaymentMethod) => void;
}

const methods: { key: PaymentMethod; label: string; color: string }[] = [
  { key: 'cash', label: 'EFECTIVO', color: 'bg-green-600 hover:bg-green-700' },
  { key: 'qr', label: 'QR', color: 'bg-purple-600 hover:bg-purple-700' },
  { key: 'card', label: 'TARJETA', color: 'bg-orange-600 hover:bg-orange-700' },
];

export default function PaymentSelector({ selected, onSelect }: PaymentSelectorProps) {
  return (
    <div className="grid grid-cols-3 gap-3">
      {methods.map((m) => (
        <button
          key={m.key}
          onClick={() => onSelect(m.key)}
          className={`py-4 rounded-xl text-white font-bold text-sm transition-all ${
            selected === m.key
              ? `${m.color} ring-4 ring-offset-2 ring-blue-300 scale-105`
              : `${m.color} opacity-80`
          }`}
        >
          {m.label}
        </button>
      ))}
    </div>
  );
}
