import { useState } from 'react';
import BarcodeScanner from '../components/BarcodeScanner';
import Loader from '../components/Loader';
import * as productService from '../services/productService';
import * as purchaseService from '../services/purchaseService';
import type { Product } from '../types';

export default function RestockPage() {
  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleScan = async (barcode: string) => {
    setError('');
    setSuccess(false);
    try {
      const found = await productService.getByBarcode(barcode);
      if (found) {
        setProduct(found);
      } else {
        setError('Producto no encontrado. Cargalo primero en Productos.');
        setProduct(null);
      }
    } catch {
      setError('Error al buscar producto');
    }
  };

  const handleRestock = async () => {
    if (!product || !quantity) return;

    setLoading(true);
    setError('');
    try {
      await purchaseService.createPurchase({
        productId: product.id,
        quantity: parseInt(quantity, 10),
        source: 'manual',
        notes: 'Reposición desde POS',
      });
      const updated = await productService.getProductById(product.id);
      setProduct(updated);
      setSuccess(true);
      setQuantity('');
      setTimeout(() => setSuccess(false), 2000);
    } catch {
      setError('Error al registrar reposición');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 text-center">Reposición de Stock</h2>

      <BarcodeScanner onScan={handleScan} disabled={loading} />

      {loading && <Loader text="Registrando..." />}

      {product && (
        <div className="bg-white rounded-2xl shadow-lg p-6 space-y-4">
          <div>
            <p className="text-sm text-gray-500">Producto</p>
            <p className="text-xl font-bold text-gray-900">{product.name}</p>
          </div>
          <div className="flex gap-4">
            <div>
              <p className="text-sm text-gray-500">Stock actual</p>
              <p className="text-2xl font-bold text-blue-700">{product.stock_current}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Stock mínimo</p>
              <p className="text-2xl font-bold text-gray-600">{product.stock_minimum}</p>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cantidad a agregar
            </label>
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              min="1"
              className="w-full px-4 py-3 text-xl text-center border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
              placeholder="0"
            />
          </div>
          <button
            onClick={handleRestock}
            disabled={loading || !quantity}
            className="w-full py-4 bg-green-600 text-white rounded-xl font-bold text-lg hover:bg-green-700 disabled:opacity-50"
          >
            AGREGAR STOCK
          </button>
        </div>
      )}

      {success && (
        <div className="bg-green-100 text-green-800 text-center py-3 rounded-xl font-medium">
          Stock actualizado correctamente
        </div>
      )}

      {error && (
        <div className="bg-red-100 text-red-800 text-center py-3 rounded-xl font-medium">
          {error}
        </div>
      )}
    </div>
  );
}
