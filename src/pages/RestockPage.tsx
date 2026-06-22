import { useState } from 'react';
import BarcodeScanner from '../components/BarcodeScanner';
import Loader from '../components/Loader';
import PageCard from '../components/ui/PageCard';
import GradientButton from '../components/ui/GradientButton';
import { subpageContentClass } from '../components/layout/subpageContent';
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
    <div className={`${subpageContentClass} max-w-3xl`}>
      <p className="w-full max-w-2xl text-center text-sm font-bold text-pos-muted sm:text-base">
        Reposición de Stock
      </p>

      <PageCard className="max-w-2xl space-y-4">
        <BarcodeScanner onScan={handleScan} disabled={loading} />

        {loading && <Loader text="Registrando..." />}

        {product && (
          <div className="space-y-4 border-t border-[#f0f0f8] pt-4">
            <div>
              <p className="text-sm text-pos-muted">Producto</p>
              <p className="text-xl font-bold text-pos-ink">{product.name}</p>
            </div>
            <div className="flex gap-6">
              <div>
                <p className="text-sm text-pos-muted">Stock actual</p>
                <p className="text-2xl font-bold text-[#5b6bf5]">{product.stock_current}</p>
              </div>
              <div>
                <p className="text-sm text-pos-muted">Stock mínimo</p>
                <p className="text-2xl font-bold text-pos-muted">{product.stock_minimum}</p>
              </div>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-pos-ink">
                Cantidad a agregar
              </label>
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                min="1"
                className="w-full rounded-2xl border-2 border-[#e5e7eb] bg-white px-4 py-3 text-center text-xl focus:border-[#818cf8] focus:outline-none"
                placeholder="0"
              />
            </div>
            <GradientButton
              variant="green"
              onClick={handleRestock}
              disabled={loading || !quantity}
            >
              AGREGAR STOCK
            </GradientButton>
          </div>
        )}

        {success && (
          <div className="rounded-2xl bg-[#dbfce7] py-3 text-center font-medium text-[#016630]">
            Stock actualizado correctamente
          </div>
        )}

        {error && (
          <div className="rounded-2xl bg-[#fef2f2] py-3 text-center font-medium text-[#ef4444]">
            {error}
          </div>
        )}
      </PageCard>
    </div>
  );
}
