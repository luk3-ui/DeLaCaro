import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import BarcodeScanner from '../components/BarcodeScanner';
import Cart from '../components/Cart';
import PaymentSelector from '../components/PaymentSelector';
import Modal from '../components/Modal';
import ProductForm from '../components/ProductForm';
import ManualProductForm from '../components/ManualProductForm';
import ConfirmDialog from '../components/ConfirmDialog';
import { useCartStore } from '../stores/cartStore';
import { useCashStore } from '../stores/cashStore';
import * as productService from '../services/productService';
import * as saleService from '../services/saleService';
import type { PaymentMethod, CreateProductInput } from '../types';
import { formatCurrency } from '../utils/format';

export default function PosPage() {
  const navigate = useNavigate();
  const session = useCashStore((s) => s.session);
  const items = useCartStore((s) => s.items);
  const addProduct = useCartStore((s) => s.addProduct);
  const addManualItem = useCartStore((s) => s.addManualItem);
  const clearCart = useCartStore((s) => s.clearCart);
  const calculateTotal = useCartStore((s) => s.calculateTotal);

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null);
  const [showNewProduct, setShowNewProduct] = useState(false);
  const [showManual, setShowManual] = useState(false);
  const [showCancel, setShowCancel] = useState(false);
  const [unknownBarcode, setUnknownBarcode] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [successAmount, setSuccessAmount] = useState(0);
  const [error, setError] = useState('');

  const handleScan = useCallback(async (barcode: string) => {
    setError('');
    try {
      const product = await productService.getByBarcode(barcode);
      if (product) {
        addProduct(product);
      } else {
        setUnknownBarcode(barcode);
        setShowNewProduct(true);
      }
    } catch {
      setError('Error al buscar producto');
    }
  }, [addProduct]);

  const handleCreateProduct = async (data: CreateProductInput) => {
    setLoading(true);
    try {
      const product = await productService.createProduct(data);
      addProduct(product);
      setShowNewProduct(false);
      setUnknownBarcode('');
    } catch {
      setError('Error al crear producto');
    } finally {
      setLoading(false);
    }
  };

  const handleCharge = async () => {
    if (!session) {
      setError('No hay caja abierta. Abrí la caja primero.');
      return;
    }
    if (items.length === 0) {
      setError('El carrito está vacío');
      return;
    }
    if (!paymentMethod) {
      setError('Seleccioná un medio de pago');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const total = calculateTotal();
      await saleService.createSale({
        cashSessionId: session.id,
        items,
        paymentMethod,
        total,
      });
      setSuccessAmount(total);
      setSuccess(true);
      clearCart();
      setPaymentMethod(null);
      setTimeout(() => setSuccess(false), 1500);
    } catch {
      setError('No se pudo registrar la venta');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelLast = async () => {
    if (!session) return;
    setLoading(true);
    try {
      await saleService.cancelLastSale(session.id);
      setShowCancel(false);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  if (!session) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 text-lg font-medium mb-4">No hay caja abierta</p>
        <button
          onClick={() => navigate('/open')}
          className="px-6 py-3 bg-blue-600 text-white rounded-xl font-medium"
        >
          Abrir Caja
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {success && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-green-600/90">
          <div className="text-center text-white">
            <p className="text-3xl font-bold mb-2">VENTA REGISTRADA</p>
            <p className="text-5xl font-bold">{formatCurrency(successAmount)}</p>
          </div>
        </div>
      )}

      <BarcodeScanner onScan={handleScan} disabled={loading} />

      <div className="flex gap-2">
        <button
          onClick={() => setShowManual(true)}
          className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200"
        >
          + Producto Manual
        </button>
        <button
          onClick={() => setShowCancel(true)}
          className="px-4 py-3 bg-red-50 text-red-600 rounded-xl font-medium hover:bg-red-100"
        >
          Anular Última
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-4 min-h-[200px]">
        <Cart />
      </div>

      <PaymentSelector selected={paymentMethod} onSelect={setPaymentMethod} />

      {error && <p className="text-red-600 text-sm text-center">{error}</p>}

      <button
        onClick={handleCharge}
        disabled={loading || items.length === 0}
        className="w-full py-5 bg-blue-600 text-white rounded-xl font-bold text-xl hover:bg-blue-700 disabled:opacity-50 transition-colors"
      >
        {loading ? 'Procesando...' : 'COBRAR'}
      </button>

      <Modal open={showNewProduct} onClose={() => setShowNewProduct(false)} title="Nuevo Producto">
        <ProductForm
          barcode={unknownBarcode}
          onSubmit={handleCreateProduct}
          onCancel={() => setShowNewProduct(false)}
          loading={loading}
        />
      </Modal>

      <Modal open={showManual} onClose={() => setShowManual(false)} title="Producto Manual">
        <ManualProductForm
          onSubmit={(desc, amt) => {
            addManualItem(desc, amt);
            setShowManual(false);
          }}
          onCancel={() => setShowManual(false)}
        />
      </Modal>

      <ConfirmDialog
        open={showCancel}
        title="Anular Última Venta"
        message="¿Estás seguro de anular la última venta? Se revertirá el stock."
        onConfirm={handleCancelLast}
        onCancel={() => setShowCancel(false)}
        confirmLabel="Anular"
        danger
      />
    </div>
  );
}
