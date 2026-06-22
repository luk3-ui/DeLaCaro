import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCashStore } from '../stores/cashStore';
import PageCard from '../components/ui/PageCard';
import NumericKeypad from '../components/ui/NumericKeypad';
import GradientButton from '../components/ui/GradientButton';
import CashStatusBadge from '../components/ui/CashStatusBadge';
import { subpageContentClass } from '../components/layout/subpageContent';
import { formatCurrency } from '../utils/format';

function applyDigit(current: string, digit: string): string {
  if (current === '0') return digit;
  if (current.length >= 9) return current;
  return current + digit;
}

export default function OpenCashPage() {
  const navigate = useNavigate();
  const { session, openSession, loading, error } = useCashStore();
  const [amount, setAmount] = useState('0');

  if (session) {
    return (
      <div className={`${subpageContentClass} max-w-lg sm:gap-12`}>
        <PageCard className="w-full">
          <p className="font-[family-name:var(--font-inter)] text-[13px] font-semibold uppercase tracking-wide text-pos-muted">
            Monto Inicial
          </p>
          <div className="mt-3 flex items-center justify-center rounded-2xl border border-[#e0e7ff] bg-[#f5f7ff] px-5 py-4">
            <span className="font-[family-name:var(--font-inter)] text-3xl font-extrabold tracking-tight text-[#101828] sm:text-4xl">
              {formatCurrency(Number(session.opening_amount))}
            </span>
          </div>
          <div className="mt-4">
            <GradientButton onClick={() => navigate('/pos')}>Ir a Venta</GradientButton>
          </div>
        </PageCard>
        <CashStatusBadge />
      </div>
    );
  }

  const handleOpen = async () => {
    try {
      await openSession(parseInt(amount, 10) || 0);
      navigate('/pos');
    } catch {
      // error handled in store
    }
  };

  return (
    <div className={`${subpageContentClass} max-w-lg sm:gap-12`}>
      <PageCard className="w-full">
        <p className="font-[family-name:var(--font-inter)] text-[13px] font-semibold uppercase tracking-wide text-pos-muted">
          Monto Inicial
        </p>
        <div className="mt-3 flex items-center justify-center rounded-2xl border border-[#e0e7ff] bg-[#f5f7ff] px-5 py-4">
          <span className="font-[family-name:var(--font-inter)] text-3xl font-extrabold tracking-tight text-[#101828] sm:text-4xl">
            {formatCurrency(parseInt(amount, 10) || 0)}
          </span>
        </div>

        <div className="mt-5">
          <NumericKeypad
            onDigit={(digit) => setAmount((prev) => applyDigit(prev, digit))}
            onClear={() => setAmount('0')}
            onBackspace={() =>
              setAmount((prev) => (prev.length <= 1 ? '0' : prev.slice(0, -1)))
            }
          />
        </div>

        {error && (
          <p className="mt-4 text-center text-sm text-[#ef4444]">{error}</p>
        )}

        <div className="mt-5">
          <GradientButton onClick={handleOpen} disabled={loading}>
            {loading ? 'Abriendo...' : 'ABRIR CAJA'}
          </GradientButton>
        </div>
      </PageCard>
      <CashStatusBadge />
    </div>
  );
}
