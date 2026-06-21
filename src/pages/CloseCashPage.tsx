import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ConfirmDialog from '../components/ConfirmDialog';
import Loader from '../components/Loader';
import { useCashStore } from '../stores/cashStore';
import * as cashService from '../services/cashService';
import { formatCurrency } from '../utils/format';

export default function CloseCashPage() {
  const navigate = useNavigate();
  const { session, closeSession, loading } = useCashStore();
  const [summary, setSummary] = useState({ total: 0, cash: 0, qr: 0, card: 0, count: 0 });
  const [loadingSummary, setLoadingSummary] = useState(true);
  const [showConfirm, setShowConfirm] = useState(false);
  const [closed, setClosed] = useState(false);

  useEffect(() => {
    if (session) {
      cashService.getSessionSummary(session.id).then(setSummary).finally(() => setLoadingSummary(false));
    } else {
      setLoadingSummary(false);
    }
  }, [session]);

  const handleClose = async () => {
    try {
      await closeSession();
      setClosed(true);
      setShowConfirm(false);
    } catch {
      // error in store
    }
  };

  if (loadingSummary) return <Loader />;

  if (!session && !closed) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 text-lg mb-4">No hay caja abierta</p>
        <button
          onClick={() => navigate('/open')}
          className="px-6 py-3 bg-blue-600 text-white rounded-xl font-medium"
        >
          Abrir Caja
        </button>
      </div>
    );
  }

  if (closed) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">✓</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Caja Cerrada</h2>
        <p className="text-gray-600 mb-6">Resumen guardado correctamente</p>
        <div className="bg-white rounded-2xl shadow-lg p-6 max-w-sm mx-auto text-left space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-600">Total vendido</span>
            <span className="font-bold">{formatCurrency(summary.total)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Operaciones</span>
            <span className="font-bold">{summary.count}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto">
      <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Cierre de Caja</h2>
      <div className="bg-white rounded-2xl shadow-lg p-6 space-y-4">
        <div className="flex justify-between items-center py-2 border-b">
          <span className="text-gray-600">Ventas</span>
          <span className="text-2xl font-bold text-gray-900">{formatCurrency(summary.total)}</span>
        </div>
        <div className="flex justify-between py-2">
          <span className="text-gray-600">Efectivo</span>
          <span className="font-semibold">{formatCurrency(summary.cash)}</span>
        </div>
        <div className="flex justify-between py-2">
          <span className="text-gray-600">QR</span>
          <span className="font-semibold">{formatCurrency(summary.qr)}</span>
        </div>
        <div className="flex justify-between py-2">
          <span className="text-gray-600">Tarjeta</span>
          <span className="font-semibold">{formatCurrency(summary.card)}</span>
        </div>
        <div className="flex justify-between py-2 border-t">
          <span className="text-gray-600">Operaciones</span>
          <span className="font-bold text-lg">{summary.count}</span>
        </div>
        <button
          onClick={() => setShowConfirm(true)}
          disabled={loading}
          className="w-full py-4 bg-red-600 text-white rounded-xl font-bold text-lg hover:bg-red-700 disabled:opacity-50 mt-4"
        >
          {loading ? 'Cerrando...' : 'CERRAR CAJA'}
        </button>
      </div>

      <ConfirmDialog
        open={showConfirm}
        title="Confirmar Cierre"
        message="¿Estás seguro de cerrar la caja? No se podrán registrar más ventas hasta abrirla de nuevo."
        onConfirm={handleClose}
        onCancel={() => setShowConfirm(false)}
        confirmLabel="Cerrar Caja"
        danger
      />
    </div>
  );
}
