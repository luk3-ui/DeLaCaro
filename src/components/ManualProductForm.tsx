import { useState } from 'react';

interface ManualProductFormProps {
  onSubmit: (description: string, amount: number) => void;
  onCancel: () => void;
}

export default function ManualProductForm({ onSubmit, onCancel }: ManualProductFormProps) {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(description, parseFloat(amount));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Descripción *</label>
        <input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-300 focus:outline-none"
          placeholder="Ej: Pan, Fiambre, Milanesas"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Importe *</label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
          min="0"
          step="0.01"
          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-300 focus:outline-none"
        />
      </div>
      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 py-3 rounded-xl border border-gray-300 text-gray-700 font-medium"
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="flex-1 py-3 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700"
        >
          AGREGAR
        </button>
      </div>
    </form>
  );
}
