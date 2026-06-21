import { useState } from 'react';
import type { CreateProductInput } from '../types';

interface ProductFormProps {
  barcode?: string;
  initialData?: Partial<CreateProductInput>;
  onSubmit: (data: CreateProductInput) => void;
  onCancel: () => void;
  loading?: boolean;
}

export default function ProductForm({
  barcode: initialBarcode = '',
  initialData,
  onSubmit,
  onCancel,
  loading,
}: ProductFormProps) {
  const [barcode, setBarcode] = useState(initialBarcode || initialData?.barcode || '');
  const [name, setName] = useState(initialData?.name || '');
  const [category, setCategory] = useState(initialData?.category || '');
  const [price, setPrice] = useState(initialData?.price?.toString() || '');
  const [stock, setStock] = useState(initialData?.stock_current?.toString() || '0');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      barcode,
      name,
      category: category || undefined,
      price: parseFloat(price),
      stock_current: parseInt(stock, 10) || 0,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Código de barras *</label>
        {initialBarcode ? (
          <p className="font-mono text-lg bg-gray-100 px-3 py-2 rounded-lg">{barcode}</p>
        ) : (
          <input
            value={barcode}
            onChange={(e) => setBarcode(e.target.value)}
            required
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-300 focus:outline-none font-mono"
            placeholder="7790895001234"
          />
        )}
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-300 focus:outline-none"
          placeholder="Ej: Coca Cola 2.25L"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
        <input
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-300 focus:outline-none"
          placeholder="Ej: Bebidas"
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Precio *</label>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
            min="0"
            step="0.01"
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-300 focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Stock inicial</label>
          <input
            type="number"
            value={stock}
            onChange={(e) => setStock(e.target.value)}
            min="0"
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-300 focus:outline-none"
          />
        </div>
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
          disabled={loading}
          className="flex-1 py-3 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Creando...' : 'CREAR'}
        </button>
      </div>
    </form>
  );
}
