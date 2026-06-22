import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import BarcodeScanner from '../components/BarcodeScanner';
import Cart from '../components/Cart';
import PaymentSelector from '../components/PaymentSelector';
import ProductSearchModal from '../components/ProductSearchModal';
import Modal from '../components/Modal';
import ManualProductForm from '../components/ManualProductForm';
import ConfirmDialog from '../components/ConfirmDialog';
import PageCard from '../components/ui/PageCard';
import GradientButton from '../components/ui/GradientButton';
import { subpageContentClass } from '../components/layout/subpageContent';
import { useCartStore } from '../stores/cartStore';
import { useCashStore } from '../stores/cashStore';
import * as productService from '../services/productService';
import * as saleService from '../services/saleService';
import type { PaymentMethod, Product } from '../types';
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
  const [showManual, setShowManual] = useState(false);
  const [showCancel, setShowCancel] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [showSearch, setShowSearch] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [successAmount, setSuccessAmount] = useState(0);
  const [error, setError] = useState('');

  const handleScan = useCallback(async (input: string) => {
    setError('');
    const query = input.trim();
    if (!query) return;

    setLoading(true);
    try {
      const byBarcode = await productService.getByBarcode(query);
      if (byBarcode) {
        addProduct(byBarcode);
        return;
      }

      const results = await productService.searchProducts(query);

      if (results.length === 0) {
        setError(
          'No se encontró ningún producto. Cargalo en Productos o usá + Producto Manual.'
        );
        return;
      }

      if (results.length === 1) {
        addProduct(results[0]);
        return;
      }

      setSearchQuery(query);
      setSearchResults(results);
      setShowSearch(true);
    } catch {
      setError('Error al buscar producto');
    } finally {
      setLoading(false);
    }
  }, [addProduct]);

  const handleSelectProduct = (product: Product) => {
    addProduct(product);
    setShowSearch(false);
    setSearchResults([]);
    setSearchQuery('');
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
      <div className={`${subpageContentClass} max-w-lg py-12`}>
        <p className="text-center text-lg font-medium text-[#ef4444]">No hay caja abierta</p>
        <GradientButton fullWidth={false} className="px-8" onClick={() => navigate('/open')}>
          Abrir Caja
        </GradientButton>
      </div>
    );
  }

  return (
    <>
      {success && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#16a34a]/90">
          <div className="text-center text-white">
            <p className="mb-2 text-2xl font-bold sm:text-3xl">VENTA REGISTRADA</p>
            <p className="text-4xl font-bold sm:text-5xl">{formatCurrency(successAmount)}</p>
          </div>
        </div>
      )}

      <div className={`${subpageContentClass} w-full max-w-3xl`}>
      <PageCard className="w-full max-w-3xl space-y-4">
        <BarcodeScanner onScan={handleScan} disabled={loading} />

        <div className="flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            onClick={() => setShowManual(true)}
            className="flex-1 rounded-2xl bg-[#f3f4f6] py-3 font-medium text-pos-ink transition-colors hover:bg-[#e5e7eb]"
          >
            + Producto Manual
          </button>
          <button
            type="button"
            onClick={() => setShowCancel(true)}
            className="rounded-2xl bg-[#fef2f2] px-4 py-3 font-medium text-[#ef4444] transition-colors hover:bg-[#fee2e2] sm:shrink-0"
          >
            Anular Última
          </button>
        </div>

        <Cart />
        <PaymentSelector selected={paymentMethod} onSelect={setPaymentMethod} />

        {error && <p className="text-center text-sm text-[#ef4444]">{error}</p>}

        <GradientButton
          variant="purple"
          onClick={handleCharge}
          disabled={loading || items.length === 0}
        >
          {loading ? 'Procesando...' : 'COBRAR'}
        </GradientButton>
      </PageCard>
      </div>

      <ProductSearchModal
        open={showSearch}
        query={searchQuery}
        products={searchResults}
        onSelect={handleSelectProduct}
        onClose={() => {
          setShowSearch(false);
          setSearchResults([]);
        }}
      />

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
    </>
  );
}
