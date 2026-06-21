import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCashStore } from '../stores/cashStore';
import { formatCurrency } from '../utils/format';

export default function OpenCashPage() {
  const navigate = useNavigate();
  const { session, openSession, loading, error } = useCashStore();
  const [amount, setAmount] = useState('0');

  if (session) {
    return (
      <div className="text-center py-12">
        <div className="inline-flex items-center gap-2 bg-green-100 text-green-800 px-4 py-2 rounded-full mb-4">
          <span className="w-3 h-3 bg-green-500 rounded-full" />
          Caja abierta
        </div>
        <p className="text-gray-600 mb-6">
          Monto inicial: {formatCurrency(Number(session.opening_amount))}
        </p>
        <button
          onClick={() => navigate('/pos')}
          className="px-8 py-4 bg-blue-600 text-white rounded-xl font-bold text-lg hover:bg-blue-700"
        >
          Ir a Vender
        </button>
      </div>
    );
  }

  const handleOpen = async () => {
    try {
      await openSession(parseFloat(amount) || 0);
      navigate('/pos');
    } catch {
      // error handled in store
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Apertura de Caja</h2>
      <div className="bg-white rounded-2xl shadow-lg p-6 space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Monto Inicial
          </label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            min="0"
            step="0.01"
            className="w-full px-4 py-4 text-2xl text-center border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
          />
        </div>
        {error && (
          <p className="text-red-600 text-sm text-center">{error}</p>
        )}
        <button
          onClick={handleOpen}
          disabled={loading}
          className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold text-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {loading ? 'Abriendo...' : 'ABRIR CAJA'}
        </button>
      </div>
    </div>
  );
}
